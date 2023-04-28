import React, { Component } from "react";
import axios from "axios";
import IdleTimer from "react-idle-timer";
import WsConnection from "../lib/wsConnection";
import * as passhubCrypto from "../lib/crypto";
import {
  keepTicketAlive,
  getFolderById,
  getApiUrl,
  getWsUrl,
  getVerifier,
  setUserData,
  serverLog
} from "../lib/utils";
import * as extensionInterface from "../lib/extensionInterface";

import SafePane from "./safePane";
import TablePane from "./tablePane";
import ImportModal from "./importModal";
import MessageModal from "./messageModal";
import IdleModal from "./idleModal";

import mockData from "../lib/mockdata";

import progress from "../lib/progress";

import { popCopyBuffer } from "../lib/copyBuffer";
import * as dropAndPaste from "../lib/dropAndPaste";
import { toBeDisabled } from "@testing-library/jest-dom/dist/matchers";

let wsConnector;

function decryptSafeData(safe, aesKey) {
  /*
  for (let i = 0; i < safe.items.length; i += 1) {
    safe.items[i].cleartext = passhubCrypto.decodeItem(safe.items[i], aesKey);
  }

  for (let i = 0; i < safe.folders.length; i += 1) {
    safe.folders[i].cleartext = passhubCrypto.decodeFolder(
      safe.folders[i],
      aesKey
    );
  }
  */
  for (const item of safe.items) {
    item.cleartext = passhubCrypto.decodeItem(item, aesKey);
  }

  for (const folder of safe.folders) {
    folder.cleartext = passhubCrypto.decodeFolder(folder, aesKey);
  }
}

/*
function decryptSafes(eSafes) {
  // console.log("xxx");
  const promises = [];
  for (let i = 0; i < eSafes.length; i++) {
    const safe = eSafes[i];
    if (safe.key) {
      promises.push(
        passhubCrypto.decryptAesKey(safe.key).then((bstringKey) => {
          safe.bstringKey = bstringKey;
          safe.name = passhubCrypto.decryptSafeName(safe, safe.bstringKey);
          return decryptSafeData(safe, safe.bstringKey);
        })
      );
    }
  }
  return Promise.all(promises);
}
*/

function decryptSafes(eSafes) {
  const promises = eSafes.map((safe) =>
    passhubCrypto.decryptAesKey(safe.key).then((bstringKey) => {
      safe.bstringKey = bstringKey;
      safe.name = passhubCrypto.decryptSafeName(safe, safe.bstringKey);
      return decryptSafeData(safe, safe.bstringKey);
    })
  );
  return Promise.all(promises);
}

/*
  const promises = [];


  for (let i = 0; i < eSafes.length; i++) {
    const safe = eSafes[i];
    if (safe.key) {
      promises.push(
        passhubCrypto.decryptAesKey(safe.key).then((bstringKey) => {
          safe.bstringKey = bstringKey;
          safe.name = passhubCrypto.decryptSafeName(safe, safe.bstringKey);
          return decryptSafeData(safe, safe.bstringKey);
        })
      );
    }
  }
  return Promise.all(promises);
}
  */

function normalizeFolder(folder, items, folders) {
  folder.contentModificationDate = folder.lastModified
    ? folder.lastModified
    : "-";
  folder.name = folder.cleartext[0];
  folder.id = folder._id;
  folder.path = [...folder.path, [folder.cleartext[0], folder.id]];

  folder.items = [];
  for (const item of items) {
    if (item.folder === folder.id) {
      folder.items.push(item);
      item.path = folder.path;
      if (
        item.lastModified &&
        item.lastModified > folder.contentModificationDate
      ) {
        folder.contentModificationDate = item.lastModified;
      }
    }
  }
  folder.items.sort((a, b) =>
    a.cleartext[0].toLowerCase().localeCompare(b.cleartext[0].toLowerCase())
  );

  folder.folders = [];
  for (const f of folders) {
    if (f.parent === folder.id) {
      folder.folders.push(f);
      f.path = folder.path;
      f.safe = folder.safe;
      normalizeFolder(f, items, folders);
      if (
        f.contentModificationDate &&
        f.contentModificationDate > folder.contentModificationDate
      ) {
        folder.contentModificationDate = f.contentModificationDate;
      }
    }
  }
  folder.folders.sort((a, b) =>
    a.cleartext[0].toLowerCase().localeCompare(b.cleartext[0].toLowerCase())
  );
}

function normalizeSafes(safes) {
  for (const safe of safes) {
    safe.rawItems = safe.items;
    safe.path = [[safe.name, safe.id]];
    safe.items = [];
    for (const item of safe.rawItems) {
      if (!item.folder || item.folder == "0") {
        safe.items.push(item);
        item.path = safe.path;
      }
    }
    safe.items.sort((a, b) =>
      a.cleartext[0].toLowerCase().localeCompare(b.cleartext[0].toLowerCase())
    );

    safe.rawFolders = safe.folders;
    safe.folders = [];
    for (const folder of safe.rawFolders) {
      if (!folder.parent || folder.parent == "0") {
        safe.folders.push(folder);
        folder.path = safe.path;
        folder.safe = safe;
        normalizeFolder(folder, safe.rawItems, safe.rawFolders);
      }
    }
    safe.folders.sort((a, b) =>
      a.cleartext[0].toLowerCase().localeCompare(b.cleartext[0].toLowerCase())
    );
  }
}

class MainPage extends Component {
  state = {
    safes: [],
    openNodes: new Set(),
    activeFolder: null,
    idleTimeoutAlert: false,
    showModal: "",
    messageModalArgs: "",
  };

  handleOpenFolder = (folder) => {
    const openNodesCopy = new Set(this.state.openNodes);
    if (this.state.openNodes.has(folder.id)) {
      openNodesCopy.delete(folder.id);
    } else {
      openNodesCopy.add(folder.id);
    }
    this.setState({ openNodes: openNodesCopy });
  };

  constructor(props) {
    super(props);
    this.safePaneRef = React.createRef();

    extensionInterface.connect(this.advise);

    document.addEventListener("passhubExtInstalled", function (data) {
      console.log("got passhubExtInstalled");
      extensionInterface.connect(this.advise);
    });
  }

  onAccountMenuCommand = (cmd) => {
    console.log("main: " + cmd);

    if (cmd === "Import") {
      this.setState({
        showModal: "ImportModal",
      });
      return;
    }

    this.safePaneRef.current.onAccountMenuCommand(cmd);
  };

  handleFolderMenuCmd = (node, cmd) => {
    this.safePaneRef.current.onFolderMenuCmd(node, cmd);
  };

  setActiveFolder = (folder) => {
    this.props.onSearchClear();

    if (typeof folder !== "object") {
      folder = getFolderById(this.state.safes, folder);
    }
    if (folder.SafeID) {
      // isFolder
      const openNodesCopy = new Set(this.state.openNodes);
      let parentID = folder.parent;
      while (parentID != 0) {
        if (!this.state.openNodes.has(parentID)) {
          openNodesCopy.add(parentID);
        }
        let parentFolder = getFolderById(this.state.safes, parentID);
        parentID = parentFolder.parent;
      }
      if (!this.state.openNodes.has(folder.SafeID)) {
        openNodesCopy.add(folder.SafeID);
      }
      this.setState({ openNodes: openNodesCopy });
    }

    this.setState({ activeFolder: folder });
  };

  openParentFolder = (folder) => {
    if (!folder.SafeID) {
      return;
    }
    if (folder.parent == 0) {
      this.setActiveFolder(folder.safe);
    } else {
      const parent = getFolderById(this.state.safes, folder.parent);
      this.setActiveFolder(parent);
    }
  };

  refreshUserData = ({ safes = [], newFolderID, broadcast = true } = {}) => {
    console.log(safes);
    console.log(newFolderID);
    if (broadcast && wsConnector) {
      console.log(JSON.stringify(safes));
      wsConnector.send(JSON.stringify(safes));
    }

    let activeFolderID = this.state.activeFolder.id
      ? this.state.activeFolder.id
      : null;

    if (newFolderID) {
      activeFolderID = newFolderID;
    }

    const self = this;
    progress.lock();
    axios
      .post(`${getApiUrl()}get_user_datar.php`, {
        verifier: getVerifier(),
        // verifier: document.getElementById("csrf").getAttribute("data-csrf"),
      })
      .then((response) => {
        const result = response.data;
        if (result.status === "Ok") {
          const data = result.data;
          // const safes = data.safes;
          return decryptSafes(data.safes).then(() => {
            data.safes.sort((a, b) =>
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );
            normalizeSafes(data.safes);
            let activeFolder = getFolderById(data.safes, activeFolderID);
            if (activeFolder === null) {
              console.log("old activesafe not found");
              activeFolder = getFolderById(data.safes, data.currentSafe);
            }
            if (activeFolder === null) {
              console.log("recommended activesafe not found");
              activeFolder = data.safes[0];
            }
            setUserData(data);
            console.log("setting new state with updated data");
            progress.unlock();

            this.setState(data);
            if(this.props.searchString.trim().length === 0) {
              this.setActiveFolder(activeFolder);
            }
          });
          return;
        }
        if (result.data.status === "login") {
          window.location.href = "expired.php";
          return;
        }
      })
      .catch((error) => {
        progress.unlock();
        console.log(error);
      });
  };

  wsMessageInd = (message) => {
    try {
      const pMessage = JSON.parse(message);
      if (Array.isArray(pMessage)) {
        console.log("Safes total: " + pMessage.length);
        this.refreshUserData({ broadcast: false });
      }
    } catch (err) {
      console.log("catch 322" + err);
    }
  };

  getPageData = () => {
    const self = this;

    if (window.location.href.includes("mock")) {
      mockData.activeFolder = mockData.safes[0];
      mockData.safes[0].folders[0].safe = mockData.safes[0];
      mockData.safes[1].folders[0].safe = mockData.safes[1];
      normalizeSafes(mockData.safes);

      this.setState(mockData);
      if ("goPremium" in mockData && mockData.goPremium == true) {
        self.props.showToast("goPremiumToast");
      } else if ("takeSurvey" in mockData && mockData.takeSurvey == true) {
        self.props.showToast("takeSurveyToast");
      }
      return;
    }

    progress.lock();
    axios
      .post(`${getApiUrl()}get_user_datar.php`, {
        verifier: getVerifier(),
      })
      .then((result) => {
        if (result.data.status === "Ok") {
          const data = result.data.data;

          passhubCrypto
            .getPrivateKey(data)
            .then(() => {
              return decryptSafes(data.safes).then(() => {
                data.safes.sort((a, b) =>
                  a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                );
                normalizeSafes(data.safes);
                data.activeFolder = getFolderById(data.safes, data.currentSafe);
                if (!data.activeFolder) {
                  console.log("active folder not found" + data.currentSafe);
                  data.activeFolder = data.safes[0];
                }
                setUserData(data);
                if (data.websocket) {
                  wsConnector = new WsConnection(getWsUrl(), this.wsMessageInd);
                  try {
                    wsConnector.connect();
                  } catch (err) {
                    console.log("catch 343");
                    console.log(err);
                  }
                } else {
                  console.log("websocket disbled");
                }

                progress.unlock();
                self.setState(data);
                if ("goPremium" in data && data.goPremium == true) {
                  self.props.showGoPremium();
                } else if ("takeSurvey" in data && data.takeSurvey == true) {
                  self.props.showToast("takeSurveyToast");
                }
                keepTicketAlive(data.WWPASS_TICKET_TTL, data.ticketAge);
              });
            })
            
            .catch(err => {
              if (window.location.href.includes("debug")) {
                alert(`387: ${err}`);
                return;
              }
              window.location.href = `error_page.php?js=387&error=${err}`;
            });
            
        }
        if (result.data.status === "login") {
          window.location.href = "expired.php";
          progress.unlock();
          return;
        }
      })
      
      .catch((error) => {
        progress.unlock();
        console.log(error);
      });
      
  };

  pageDataLoaded = false;

  componentDidMount() {
    if (this.props.show) {
      this.pageDataLoaded = true;
      this.getPageData();
    }
  }

  componentDidUpdate() {
    if (!this.pageDataLoaded && this.props.show) {
      this.pageDataLoaded = true;
      this.getPageData();
    }
  }

  componentWillUnmount() {
    console.log("mainPage unmount");
  }

  handleOnIdle = () => {
    this.setState({ idleTimeoutAlert: true });

    this.logoutTimer = setTimeout(() => {
      document.location.href = "logout.php";
    }, 60 * 1000);

    console.log("handleOnIdle");
  };
  onActive() {
    console.log("userIactive");
  }

  onIdleModalClose = () => {
    console.log("onIdleModalClose");
    this.setState({ idleTimeoutAlert: false });
    clearTimeout(this.logoutTimer);
  };

  searchFolder = {
    path: [["Search results", 0]],
    folders: [],
    items: [],
  };

  searchFolders(what) {
    const result = [];
    const lcWhat = what.toLowerCase();
    for (const safe of this.state.safes) {
      if (safe.key) {
        // key!= null => confirmed, better have a class
        for (const folder of safe.rawFolders) {
          if (folder.cleartext[0].toLowerCase().indexOf(lcWhat) >= 0) {
            result.push(folder);
          }
        }
      }
    }

    result.sort((a, b) =>
      a.cleartext[0].toLowerCase().localeCompare(b.cleartext[0].toLowerCase())
    );
    return result;
  }


  search(what) {
    const result = [];
    const lcWhat = what.toLowerCase();
    for (const safe of this.state.safes) {
      if (safe.key) {
        // key!= null => confirmed, better have a class
        for (const item of safe.rawItems) {
          let found = false;

          if (item.cleartext.length == 8) {
            // card
            if (item.cleartext[1].toLowerCase().indexOf(lcWhat) >= 0) {
              found = true;
            } else if (item.cleartext[2].toLowerCase().indexOf(lcWhat) >= 0) {
              found = true;
            }
          } else {
            if (item.cleartext[0].toLowerCase().indexOf(lcWhat) >= 0) {
              found = true;
            } else if (item.cleartext[1].toLowerCase().indexOf(lcWhat) >= 0) {
              found = true;
            } else if (item.cleartext[3].toLowerCase().indexOf(lcWhat) >= 0) {
              found = true;
            } else if (item.cleartext[4].toLowerCase().indexOf(lcWhat) >= 0) {
              found = true;
            }
          }
          if (found) {
            result.push(item);
          }
        }
      }
    }

    result.sort((a, b) =>
      a.cleartext[0].toLowerCase().localeCompare(b.cleartext[0].toLowerCase())
    );

    return result;
  }

  paymentCards = () => {
    const cards = [];
    for (const safe of this.state.safes) {
      if (safe.key) {
        // key!= null => confirmed, better have a class
        for (const item of safe.rawItems) {
          if (item.version === 5 && item.cleartext[0] === "card") {
            cards.push({
              safe: safe.name,
              title: item.cleartext[1],
              card: item.cleartext,
            });
          }
        }
      }
    }
    return { id: "payment", found: cards };
  };

  advise = (what) => {
    if (what.id === "payment page") {
      return this.paymentCards();
    }
    if (what.id === "advise request" || what.id === "not a payment page") {
      const u = new URL(what.url);
      let hostname = u.hostname.toLowerCase();
      if (hostname.substring(0, 4) === "www.") {
        hostname = hostname.substring(4);
      }
      const result = [];
      if (hostname) {
        for (const safe of this.state.safes) {
          if (safe.key) {
            // key!= null => confirmed, better have a class
            const items = safe.rawItems;
            for (const item of items) {
              try {
                let itemUrl = item.cleartext[3].toLowerCase();
                if (itemUrl.substring(0, 4) != "http") {
                  itemUrl = "https://" + itemUrl;
                }

                itemUrl = new URL(itemUrl);
                let itemHost = itemUrl.hostname.toLowerCase();
                if (itemHost.substring(0, 4) === "www.") {
                  itemHost = itemHost.substring(4);
                }
                if (itemHost == hostname) {
                  result.push({
                    safe: safe.name,
                    title: item.cleartext[0],
                    username: item.cleartext[1],
                    password: item.cleartext[2],
                  });
                }
              } catch (err) {}
            }
          }
        }
      }
      return { id: "advise", hostname, found: result };
    }
  };

  doMove = (node, pItem, operation) => {

    dropAndPaste
      .doMove(this.state.safes, node, pItem, operation)
      .then((status) => {
        console.log(status);
        if (status === "Ok") {
          this.refreshUserData();
          return;
        }
        if (status === "no src write") {
          this.setState({
            showModal: "NoRightsModal",
            messageModalArgs: {
              message:
                'Sorry, "Move" operation is forbidden. You have only read access to the source safe.',
            },
          });

          return;
        }
        if (status === "no dst write") {
          this.setState({
            showModal: "NoRightsModal",
            messageModalArgs: {
              message:
                'Sorry, "Paste" is forbidden. You have only read access to the destination safe.',
            },
          });
          return;
        }
        console.log(`Unkown status -${status}-`)
        return;
      })
      .catch((err) => {
        console.log(err.message);
        if (err.message === "no src write") {
          this.setState({
            showModal: "NoRightsModal",
            messageModalArgs: {
              message:
                'Sorry, "Move" operation is forbidden. You have only read access to the source safe.',
            },
          });

          return;
        }
        if (err.message === "no dst write") {
          this.setState({
            showModal: "NoRightsModal",
            messageModalArgs: {
              message:
                'Sorry, "Paste" is forbidden. You have only read access to the destination safe.',
            },
          });
          return;
        }
        if (err.message === "drop into child") {
          this.setState({
            showModal: "NoRightsModal",
            messageModalArgs: {
              message:
                'Sorry, cannot move to the child folder.',
            },
          });
          return;
        }

      });
  };

  dropItem = (node, pItem) => {
    this.doMove(node, pItem, "move");
  };

  pasteItem = (node) => {
    const clip = popCopyBuffer();
    if (clip == null) {
      return true;
    }
    const { item, operation } = clip;

    this.doMove(node, item, operation);
  };

  render() {
    if (!this.props.show) {
      return null;
    }
    const searchString = this.props.searchString.trim();
    if (searchString.length > 0) {
      this.searchFolder.items = this.search(searchString);
      this.searchFolder.folders = this.searchFolders(searchString);

      const safePane = document.querySelector("#safe_pane");

      if (safePane && !safePane.classList.contains("d-none")) {
        document.querySelector("#safe_pane").classList.add("d-none");
        document.querySelector("#table_pane").classList.remove("d-none");
      }
    }

    const idleTimeout =
      "idleTimeout" in this.state ? this.state.idleTimeout : 0;

    return (
      <React.Fragment>
        <SafePane
          show={this.state.ePrivateKey || window.location.href.includes("mock")}
          safes={this.state.safes}
          setActiveFolder={this.setActiveFolder}
          activeFolder={this.state.activeFolder}
          refreshUserData={this.refreshUserData}
          ref={this.safePaneRef}
          handleOpenFolder={this.handleOpenFolder}
          openNodes={this.state.openNodes}
          email={this.state.email}
          dropItem={this.dropItem}
          pasteItem={this.pasteItem}
        />
        <TablePane
          folder={
            searchString.length > 0
              ? this.searchFolder
              : this.state.activeFolder
          }
          safes={this.state.safes}
          searchMode={searchString.length > 0}
          setActiveFolder={this.setActiveFolder}
          openParentFolder={this.openParentFolder}
          refreshUserData={this.refreshUserData}
          inMemoryView={this.props.inMemoryView}
          onFolderMenuCmd={this.handleFolderMenuCmd}
          onSearchClear={this.props.onSearchClear}
          showItemPane={this.props.showItemPane}
          dropItem={this.dropItem}
        />

        {"idleTimeout" in this.state && (
          <div>
            <IdleTimer
              ref={(ref) => {
                this.idleTimer = ref;
              }}
              timeout={/*this.state.idleTimeout*/ idleTimeout * 1000}
              onIdle={this.handleOnIdle}
              onActive={this.onActive}
              debounce={250}
            />
          </div>
        )}

        <ImportModal
          show={this.state.showModal == "ImportModal"}
          safes={this.state.safes}
          onClose={(refresh = false) => {
            this.setState({ showModal: "" });
            if (refresh === true) {
              this.refreshUserData();
            }
          }}
        ></ImportModal>
        <MessageModal
          show={this.state.showModal == "NoRightsModal"}
          norights
          onClose={() => {
            this.setState({ showModal: "" });
          }}
        >
          {this.state.messageModalArgs && this.state.messageModalArgs.message}
        </MessageModal>

        <IdleModal
          show={this.state.idleTimeoutAlert}
          onClose={this.onIdleModalClose}
        ></IdleModal>
      </React.Fragment>
    );
  }
}

export default MainPage;
