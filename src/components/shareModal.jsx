import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";
import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";

import { contextMenu, Menu, Item, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import SafeUser from "./safeUser";
import ItemModalFieldNav from "./itemModalFieldNav";
import * as passhubCrypto from "../lib/crypto";

class ShareModal extends Component {
  state = {
    userList: [],
    email: "",
    invitedUserRights: "can view",
    errorMsg: "",
  };

  isShown = false;
  isAdmin = false;
  refreshOnClose = false;

  onEmailChange = (e) => {
    let email = e.target.value;
    this.setState({ email, errorMsg: "" });
  };

  onClose = (refresh = false) => {
    this.props.onClose(refresh || this.refreshOnClose);
  };

  safeUserMenu = (
    <Menu id={"invited-user-menu"}>
      <Item
        onClick={(e) => {
          this.setState({ invitedUserRights: "limited view" });
        }}
      >
        <div>
          <div>Limited view</div>
          <div
            style={{
              fontSize: "13px",
              opacity: "0.5",
              maxWidth: "17em",
              whiteSpace: "break-spaces",
            }}
          >
            User can only view records and download files, passwords are hidden
          </div>
        </div>
      </Item>

      <Item
        onClick={(e) => {
          this.setState({ invitedUserRights: "can view" });
        }}
      >
        <div>
          <div>Can view</div>
          <div
            style={{
              fontSize: "13px",
              opacity: "0.5",
              maxWidth: "17em",
              whiteSpace: "break-spaces",
            }}
          >
            User can only view records and download files
          </div>
        </div>
      </Item>

      <Item
        onClick={(e) => {
          this.setState({ invitedUserRights: "can edit" });
        }}
      >
        <div>
          <div>Can Edit</div>
          <div
            style={{
              fontSize: "13px",
              opacity: "0.5",
              maxWidth: "17em",
              whiteSpace: "break-spaces",
            }}
          >
            User can edit, delete, and add files to the Safe
          </div>
        </div>
      </Item>
      <Item
        onClick={(e) => {
          this.setState({ invitedUserRights: "safe owner" });
        }}
      >
        <div>
          <div>Safe owner</div>
          <div
            style={{
              fontSize: "13px",
              opacity: "0.5",
              maxWidth: "17em",
              whiteSpace: "break-spaces",
            }}
          >
            Additionaly can share safe and manage user access rights
          </div>
        </div>
      </Item>
    </Menu>
  );

  shareByMailFinal = (username, eAesKey) => {
    let role = "readonly";
    if (this.state.invitedUserRights == "limited view") {
      role = "limited view";
    }
    if (this.state.invitedUserRights == "can edit") {
      role = "editor";
    }
    if (this.state.invitedUserRights == "safe owner") {
      role = "administrator";
    }

    const { folder } = this.props.args;
    let recipientSafeName = folder.name;

    let { email } = this.props.args;
    if (email) {
      const atIdx = email.indexOf("@");
      if (atIdx > 0) {
        email = email.substring(0, atIdx);
      }
      recipientSafeName += " /" + email;
    }
    const eName = passhubCrypto.encryptSafeName(
      recipientSafeName,
      this.props.args.folder.bstringKey
    );

    const vault = folder.safe ? folder.safe.id : folder.id;

    axios
      .post(`${getApiUrl()}safe_acl.php`, {
        verifier: getVerifier(),
        vault,
        operation: "email_final",
        name: username,
        key: eAesKey,
        eName,
        vesrion: 3,
        // safeName: recipientSafeName,
        role,
      })
      .then((reply) => {
        const result = reply.data;
        if (result.status == "Ok") {
          /*
          const url =
            window.location.href.substring(
              0,
              window.location.href.lastIndexOf("/")
            ) + "/";
          const subj = "Passhub safe shared with you";
          const body = `${state.userMail} shared a Passhub safe with you.\n\n Please visit ${url}`;
          openmailclient.openMailClient(username, subj, body);
          */
          this.setState({ email: "", errorMsg: "" });
          this.refreshOnClose = true;
          this.getSafeUsers();
          return;
        }
        this.setState({ errorMsg: result.status });
        return;
      })
      .catch((err) => {
        this.setState({
          errorMsg: "Server error. Please try again later",
        });
      });
  };

  onSubmit = () => {
    let peer = this.state.email.trim();
    if (peer.length < 1) {
      this.setState({ errorMsg: "Recipient email should not be empty" });
      return;
    }
    const { folder } = this.props.args;
    const [SafeID, safeAesKey] = folder.safe
      ? [folder.safe.id, folder.safe.key]
      : [folder.id, folder.key];

    axios
      .post(`${getApiUrl()}safe_acl.php`, {
        verifier: getVerifier(),
        vault: SafeID,
        operation: "email",
        origin: window.location.origin,
        name: peer,
      })
      .then((reply) => {
        const result = reply.data;
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }

        if (result.status == "Ok") {
          passhubCrypto.decryptAesKey(safeAesKey).then((aesKey) => {
            const hexPeerEncryptedAesKey = passhubCrypto.encryptAesKey(
              result.public_key,
              aesKey
            );
            this.shareByMailFinal(peer, hexPeerEncryptedAesKey);
          });
          return;
        }
        this.setState({ errorMsg: result.status });
        return;
      })
      .catch((err) => {
        this.setState({
          errorMsg: "Server error. Please try again later",
        });
      });
  };

  removeUser = (name) => {
    axios
      .post(`${getApiUrl()}safe_acl.php`, {
        verifier: getVerifier(),
        vault: this.props.args.folder.id,
        operation: "delete",
        name,
      })
      .then((reply) => {
        const result = reply.data;
        if (result.status == "Ok") {
          this.setUserList(result.UserList);

          //          this.setState({ userList: result.UserList });
          return;
        }
        this.setState({ errorMsg: result.status });
      })
      .catch((err) => {
        this.setState({
          errorMsg: "Server error. Please try again later",
        });
      });
  };

  setUserRole = (name, role) => {
    if (role == "Remove") {
      this.removeUser(name);
      return;
    }

    axios
      .post(`${getApiUrl()}safe_acl.php`, {
        verifier: getVerifier(),
        vault: this.props.args.folder.id,
        operation: "role",
        name,
        role,
      })
      .then((reply) => {
        const result = reply.data;
        if (result.status == "Ok") {
          this.setUserList(result.UserList);

          //           this.setState({ userList: result.UserList });
          return;
        }
        this.setState({ errorMsg: result.status });
      })
      .catch((err) => {
        this.setState({
          errorMsg: "Server error. Please try again later",
        });
      });
  };

  onUnsubscribe = () => {
    const { folder } = this.props.args;
    const [SafeID, safeAesKey] = folder.safe
      ? [folder.safe.id, folder.safe.key]
      : [folder.id, folder.key];

    axios
      .post(`${getApiUrl()}safe_acl.php`, {
        verifier: getVerifier(),
        vault: SafeID,
        operation: "unsubscribe",
      })
      .then((reply) => {
        const result = reply.data;
        this.onClose(true);
      })
      .catch((err) => {
        this.setState({
          errorMsg: "Server error. Please try again later",
        });
      });
  };

  setUserList = (users) => {
    let filteredUserList = users.filter((user) => {
      if (user.myself && user.role == "administrator") {
        this.isAdmin = true;
      }
      return user.name.length > 0 || user.myself;
    });
    filteredUserList.sort((u1, u2) => {
      if (u1.myself && !u2.myself) {
        return -1;
      }
      if (!u1.myself && u2.myself) {
        return 1;
      }
      if (u1.name.toUpperCase() < u2.name.toUpperCase()) {
        return -1;
      }
      if (u1.name.toUpperCase() > u2.name.toUpperCase()) {
        return 1;
      }
      return 0;
    });

    this.setState({ userList: filteredUserList });
  };

  getSafeUsers = () => {
    const { folder } = this.props.args;
    const vault = folder.safe ? folder.safe.id : folder.id;

    axios
      .post(`${getApiUrl()}safe_acl.php`, {
        verifier: getVerifier(),
        vault: this.props.args.folder.id,
      })
      .then((reply) => {
        const result = reply.data;
        if (result.status === "Ok") {
          this.setUserList(result.UserList);
          /*
          let filteredUserList = result.UserList.filter((user) => {
            if (user.myself && user.role == "administrator") {
              this.isAdmin = true;
            }
            return user.name.length > 0 || user.myself;
          });
          filteredUserList.sort((u1, u2) => {
            if (u1.myself && !u2.myself) {
              return -1;
            }
            if (u1.name.toUpperCase() < u2.name.toUpperCase()) {
              return -1;
            }
            if (u1.name.toUpperCase() > u2.name.toUpperCase()) {
              return 1;
            }
            return 0;
          });

          this.setState({ userList: filteredUserList });
*/
          return;
        }
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        this.setState({ errorMsg: result.status });
      })
      .catch((err) => {
        this.setState({
          errorMsg: "Server error. Please try again later",
        });
      });
  };

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    let title = this.props.args.folder.name;

    if (!this.isShown) {
      this.isShown = true;
      this.isAdmin = false;
      this.refreshOnClose = false;
      this.state.userList = [];
      this.state.email = "";
      this.state.errorMsg = "";
      this.getSafeUsers();
    }

    const recipientField =
      !this.isAdmin && this.state.userList.length > 0 ? (
        ""
      ) : (
        <div className="itemModalField" style={{ marginBottom: "16px" }}>
          <ItemModalFieldNav name="Email" />
          <div>
            <input
              onChange={this.onEmailChange}
              readOnly={false}
              spellCheck={false}
              value={this.state.email}
              type="text"
            ></input>
          </div>
        </div>
      );

    let userCount = "Safe users";
    /*
    if (this.state.userList.length == 1) {
      userCount = "1 user has access";
    }
    if (this.state.userList.length > 1) {
      userCount = `${this.state.userList.length} users have access`;
    }
    */

    return (
      <Modal
        show={this.props.show}
        onHide={this.onClose}
        animation={false}
        centered
      >
        <ModalCross onClose={this.props.onClose}></ModalCross>
        <div className="modalTitle" style={{ alignItems: "center" }}>
          <div>
            <svg width="32" height="32" style={{ marginRight: "14px" }}>
              <use href="#f-safe"></use>
            </svg>
          </div>

          <div className="h2">{title}</div>
        </div>

        <Modal.Body className="edit">
          {this.isAdmin && (
            <div style={{ marginBottom: "12px" }}>
              User invited:{" "}
              <span
                className="roleChanger"
                onClick={(e) => {
                  contextMenu.show({ id: "invited-user-menu", event: e });
                }}
              >
                {this.state.invitedUserRights}
                <svg
                  width="24"
                  height="24"
                  style={{
                    verticalAlign: "top",
                    fill: "#009A50",
                  }}
                >
                  <use href="#angle"></use>
                </svg>
              </span>
              {this.safeUserMenu}
            </div>
          )}
          {!this.isAdmin && this.state.userList.length > 0 && (
            <div
              style={{
                marginBottom: "12px",
                color: "rgb(222, 95, 0)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                style={{
                  fill: "none",
                  width: "64px",
                  height: "64px",
                  marginRight: "14px",
                }}
              >
                <use href="#info-circle"></use>
              </svg>
              <div>
                Only safe owners can share access to the safe or change access
                rights of other users.
              </div>
            </div>
          )}
          {recipientField}
          {this.state.errorMsg.length > 0 && (
            <div style={{ color: "red" }}>{this.state.errorMsg}</div>
          )}
          {this.isAdmin && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "24px",
              }}
            >
              <Button onClick={this.onSubmit}>Share Safe</Button>
            </div>
          )}
          <div
            style={{
              fontSize: "14px",
              lineHeight: "22px",
              color: "rgba(27, 27, 38, 0.7)",
              marginBottom: "20px",
            }}
          >
            {userCount}
          </div>
          {this.state.userList.map((user) => {
            console.log(user);

            return (
              <SafeUser
                key={user.name}
                user={user}
                isAdmin={this.isAdmin}
                setUserRole={this.setUserRole}
              />
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              this.onClose();
            }}
          >
            Close
          </Button>
          {!this.isAdmin && this.state.userList.length > 0 && (
            <Button onClick={this.onUnsubscribe}>Unsubscribe</Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ShareModal;
