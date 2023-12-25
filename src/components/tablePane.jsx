import React, { Component } from "react";

import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import { Menu, Item } from "react-contexify";

import FolderItem from "./folderItemF";
import PasswordItem from "./passwordItemF";
import NoteItem from "./noteItemF";
import BankCardItem from "./bankCardItemF";
import FileItem from "./fileItemF";

import PasswordModal from "./passwordModal";

import NoteModal from "./noteModal";
import FileModal from "./fileModal";
import BankCardModal from "./bankCardModal";
import CreateFileModal from "./createFileModal";
import DeleteItemModal from "./deleteItemModal";
import AddDropUp from "./addDropUp";
import FolderMenuMobile from "./folderMenuMobile";
import PathElement from "./pathElement";

import { getFolderById } from "../lib/utils";

const ADD_BUTTON_MENU_ID = "add-menu-id";

function isPasswordItem(item) {
  return !item.note && !item.file && item.version !== 5;
}

function isFileItem(item) {
  return item.file ? true : false;
}

function isBankCardItem(item) {
  return item.version === 5 && item.cleartext[0] === "card";
}

function isNoteItem(item) {
  return item.note ? true : false;
}

class TablePane extends Component {
  state = {
    showModal: "",

    itemModalArgs: {},
    currentItem: 0,
  };

  constructor(props) {
    super(props);
    this.addButtonRef = React.createRef();
  }

  addButtonRect = { right: "16px", bottom: "16px" };

  handleAddClick = (cmd) => {
    console.log(cmd);
    if (cmd === "Password") {
      this.showItemModal("PasswordModal");
    }
    if (cmd === "File") {
      // this.showCreateFileModal();
      this.showItemModal("CreateFileModal");
    }
    if (cmd === "Note") {
      this.showItemModal("NoteModal");
    }
    if (cmd === "Bank Card") {
      this.showItemModal("BankCardModal");
    }
    if (cmd === "Folder") {
      this.handleFolderMenuCmd(this.props.folder, "Add folder");
    }
  };

  addMenu = (
    <Menu id={ADD_BUTTON_MENU_ID}>
      <Item
        onClick={() => {
          this.handleAddClick("Login");
        }}
      >
        Login
      </Item>
      <Item
        onClick={() => {
          this.handleAddClick("Note");
        }}
      >
        Note
      </Item>
      <Item
        onClick={() => {
          this.handleAddClick("File");
        }}
      >
        File
      </Item>
      <Item
        onClick={() => {
          this.handleAddClick("Folder");
        }}
      >
        Folder
      </Item>
    </Menu>
  );

  showAddMenu = (e) => {
    this.setState({
      showModal: "addDropUp",
    });
  };

  showItemModal = (modalName, item) => {
    let safe = this.props.folder.safe
      ? this.props.folder.safe
      : this.props.folder;
    if (this.props.searchMode && item) {
      safe = getFolderById(this.props.safes, item.SafeID);
    }
    const itemModalArgs = {
      item,
      safe,
      folder: this.props.folder,
      openDeleteItemModal: this.openDeleteItemModal,
    };

    this.setState({
      showModal: modalName,
      itemModalArgs,
    });
  };

  /*
  showCreateFileModal = (item) => {
    let safe = this.props.folder.safe
      ? this.props.folder.safe
      : this.props.folder;
    if (this.props.searchMode && item) {
      safe = getFolderById(this.props.safes, item.SafeID);
    }
    const itemModalArgs = {
      item,
      safe,
      folder: this.props.folder,
      openDeleteItemModal: this.openDeleteItemModal,
    };

    this.setState({
      showModal: "CreateFileModal",
      itemModalArgs,
    });
  };

  
  showNoteModal = (item) => {
    const itemModalArgs = {
      item,
      folder: this.props.folder,
      openDeleteItemModal: this.openDeleteItemModal,
    };

    if (this.props.searchMode && item) {
      itemModalArgs.safe = getFolderById(this.props.safes, item.SafeID);
    }
    this.setState({
      showModal: "NoteModal",
      itemModalArgs,
    });
  };
  showFileModal = (item) => {
    const itemModalArgs = {
      item,
      folder: this.props.folder,
      openDeleteItemModal: this.openDeleteItemModal,
    };

    if (this.props.searchMode && item) {
      itemModalArgs.safe = getFolderById(this.props.safes, item.SafeID);
    }

    const safe = getFolderById(this.props.safes, item.SafeID);
    this.setState({
      showModal: "FileModal",
      itemModalArgs,
    });
  };
*/

  onItemModalClose1 = (refresh = false) => {
    this.setState({ showModal: "" });
    if (refresh === true) {
      this.props.refreshUserData();
    }
  };

  onItemModalClose = (refresh = false) => {
    this.setState({ showModal: "" });
    if (refresh === true) {
/*
      if (this.props.searchMode) {
        const folderID =
          this.state.itemModalArgs.item.folder != 0 // not !== intentionally, better have it "0"
            ? this.state.itemModalArgs.item.folder
            : this.state.itemModalArgs.item.SafeID;
        this.props.setActiveFolder(folderID);
      }
*/
      this.props.refreshUserData({
        safes: [this.state.itemModalArgs.safe.id],
      });
    }
  };

  onItemModalCloseSetFolder = (f) => {
    this.setState({ showModal: "" });
    if (this.props.searchMode) {
      const folderID =
        this.state.itemModalArgs.item.folder != 0 // intentionally: better have it "0"
          ? this.state.itemModalArgs.item.folder
          : this.state.itemModalArgs.item.SafeID;
      this.props.setActiveFolder(folderID);
    } else {
      this.props.setActiveFolder(f);
    }
  };

  openDeleteItemModal = () => {
    this.setState({ showModal: "DeleteItemModal" });
  };

  openFolder = (folder) => {
    this.props.setActiveFolder(folder);
  };

  handleFolderMenuCmd = (node, cmd) => {
    this.props.onFolderMenuCmd(this.props.folder, cmd);
    console.log(cmd);
  };

  render() {
    if (!this.props.folder) {
      return null;
    }

    const { folder } = this.props;
    /*
    const pathToFolder =
      folder.path.length < 2
        ? ""
        : folder.path
            .slice(0, -1)
            .map((e) => e[0])
            .join(" > ") + " > ";
*/
    let pathString = [];
    for (let i = 0; i < folder.path.length - 1; i++) {
      pathString.push(
        <PathElement
          name={folder.path[i][0]}
          folderid={folder.path[i][1]}
          gt={folder.path.length - i - 1}
          onClick={(f) => this.openFolder(f)}
        ></PathElement>
      );
    }

    const emptyFolder = !(folder.folders.length + folder.items.length > 0);
    const isSafe = folder.path.length === 1 && !this.props.searchMode;
    let EmptyMessage = isSafe ? "Empty safe" : "Empty folder";
    if (this.props.searchMode) {
      EmptyMessage = (
        <div>
          <b>
            <p>Nothing found</p>
            <p>Try another search</p>
          </b>
        </div>
      );
    }

    return (
      <Col
        className="col-xl-9 col-lg-8 col-md-7 col-sm-6 d-none d-sm-block wwp_wt_home"
        id="table_pane"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            // marginRight: "0.3em",
          }}
        >
          <div
            className="d-sm-none green70"
            style={{ cursor: "pointer", marginBottom: "18px" }}
            onClick={() => {
              if (this.props.searchMode) {
                this.props.onSearchClear();
              }

              if (folder.SafeID) {
                this.props.openParentFolder(folder);
              } else {
                document.querySelector("#safe_pane").classList.remove("d-none");
                document.querySelector("#table_pane").classList.add("d-none");
              }
            }}
          >
            <svg
              width="24"
              height="24"
              style={{
                fill: "#009a50",
                transform: "rotate(90deg)",
              }}
            >
              <use href="#angle"></use>
            </svg>

            {folder.path.length === 1
              ? "All safes"
              : folder.path[folder.path.length - 2][0]}
          </div>
          <div
            className="d-sm-none"
            style={{
              display: "flex",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div className="h5">{folder.path[folder.path.length - 1][0]}</div>
            {!this.props.searchMode && true && (
              <FolderMenuMobile
                node={folder}
                onMenuCmd={this.handleFolderMenuCmd}
                color="black"
                isSafe={true}
              />
            )}
          </div>

{/*

          <div
            className="d-none d-sm-block"
            style={{ 
              color: "#1B1B26",
              marginBottom: "28px",
              
               }}
          >
            <div style='display:"flex", overflowX:"clip",
              textOverflow:"ellipsis",
              whiteSpace:"nowrap"'>
              <div>{pathString}</div>
              
              <b>{folder.path[folder.path.length - 1][0]}</b>
            </div>
          </div>
              */}

          <div
            className="d-none d-sm-block"
            style={{ color: "#1B1B26", marginBottom: "28px" }}
          >
            {pathString}
            <b>{folder.path[folder.path.length - 1][0]}</b>
          </div>



          {emptyFolder && (
            <div>
              <div style={{ textAlign: "center" }}>
                <svg
                  width="260"
                  height="208"
                  style={{ margin: "2em auto 1em auto", display: "block" }}
                >
                  <use href={isSafe ? "#f-emptySafe" : "#f-emptyFolder"}></use>
                </svg>
                {EmptyMessage}
              </div>
            </div>
          )}

          {!emptyFolder && (
            <div
              className="custom-scroll"
              style={{ overflowY: "auto", overflowX: "hidden" }}
            >
              <table className="item_table">
                <thead>
                  <tr className="d-flex">
                    <th className="d-none d-sm-table-cell col-sm-12 col-md-6 col-lg-4 col-xl-3" style={{paddinLeft:0}}>
                      Title
                    </th>
                    <th className="d-none d-xl-table-cell                             col-xl-3"></th>
                    <th className="d-none d-md-table-cell           col-md-6 col-lg-4 col-xl-3"></th>
                    <th className="d-none d-lg-table-cell                    col-lg-4 col-xl-3 column-modified">
                      Modified
                      </th>
                  </tr>
                </thead>
                <tbody>
                  {folder.folders.map((f) => (
                    <FolderItem
                      item={f}
                      key={`folder${f._id}`}
                      searchMode={this.props.searchMode}
                      dropItem={this.props.dropItem}
                      onClick={(folder) => {
                        this.openFolder(folder);
                      }}
                    />
                  ))}
                  {folder.items.map(
                    (f) =>
                      (isPasswordItem(f) && (
                        <PasswordItem
                          item={f}
                          key={`item${f._id}`}
                          searchMode={this.props.searchMode}
                          showModal={(item) =>
                            this.showItemModal("PasswordModal", item)
                          }
                        />
                      )) ||
                      (isNoteItem(f) && (
                        <NoteItem
                          item={f}
                          key={`item${f._id}`}
                          searchMode={this.props.searchMode}
                          showModal={(item) =>
                            this.showItemModal("NoteModal", item)
                          }
                        />
                      )) ||
                      (isFileItem(f) && (
                        <FileItem
                          item={f}
                          key={`item${f._id}`}
                          searchMode={this.props.searchMode}
                          showModal={(item) =>
                            this.showItemModal("FileModal", item)
                          }
                        />
                      )) ||
                      (isBankCardItem(f) && (
                        <BankCardItem
                          item={f}
                          key={`item${f._id}`}
                          searchMode={this.props.searchMode}
                          showModal={(item) =>
                            this.showItemModal("BankCardModal", item)
                          }
                        />
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {this.addMenu}
          {!this.props.searchMode && (
            <Button
              variant="primary"
              type="submit"
              ref={this.addButtonRef}
              style={{
                width: "80px",
                height: "80px",
                position: "absolute",
                bottom: "16px",
                right: "16px",
                minWidth: "0",
                padding: "20px",
                borderRadius: "14px",
              }}
              onClick={() => {
                this.addButtonRect =
                  this.addButtonRef.current.getBoundingClientRect();
                this.showAddMenu();
              }}
            >
              <svg width="40" height="40" style={{ strokeWidth: 2 }}>
                <use href="#f-plus"></use>
              </svg>
            </Button>
          )}

          <AddDropUp
            show={this.state.showModal === "addDropUp"}
            bottom={window.innerHeight - this.addButtonRect.bottom - 8}
            right={window.innerWidth - this.addButtonRect.right - 8}
            onClose={() => this.setState({ showModal: "" })}
            handleAddClick={this.handleAddClick}
          ></AddDropUp>

          <PasswordModal
            show={this.state.showModal === "PasswordModal"}
            args={this.state.itemModalArgs}
            openDeleteItemModal={this.openDeleteItemModal}
            onClose={this.onItemModalClose}
            onCloseSetFolder={this.onItemModalCloseSetFolder}
          ></PasswordModal>

          <FileModal
            show={this.state.showModal === "FileModal"}
            args={this.state.itemModalArgs}
            openDeleteItemModal={this.openDeleteItemModal}
            onClose={this.onItemModalClose}
            onCloseSetFolder={this.onItemModalCloseSetFolder}
            inMemoryView={(blob, filename) => {
              this.setState({ showModal: "" });
              this.props.inMemoryView(blob, filename);
            }}
          ></FileModal>

          <CreateFileModal
            show={this.state.showModal === "CreateFileModal"}
            args={this.state.itemModalArgs}
            openDeleteItemModal={this.openDeleteItemModal}
            onClose={this.onItemModalClose}
          ></CreateFileModal>

          <NoteModal
            show={this.state.showModal === "NoteModal"}
            args={this.state.itemModalArgs}
            openDeleteItemModal={this.openDeleteItemModal}
            onClose={this.onItemModalClose}
            onCloseSetFolder={this.onItemModalCloseSetFolder}
          ></NoteModal>

          <BankCardModal
            show={this.state.showModal === "BankCardModal"}
            args={this.state.itemModalArgs}
            openDeleteItemModal={this.openDeleteItemModal}
            onClose={this.onItemModalClose}
            onCloseSetFolder={this.onItemModalCloseSetFolder}
          ></BankCardModal>

          <DeleteItemModal
            show={this.state.showModal === "DeleteItemModal"}
            folder={folder}
            args={this.state.itemModalArgs}
            onClose={this.onItemModalClose}
          ></DeleteItemModal>
        </div>
      </Col>
    );
  }
}

export default TablePane;

/*
onClose={(refresh = false) => {
  this.setState({ showModal: "" });
  if (refresh === true) {
    this.props.refreshUserData();
  }
}}
*/
