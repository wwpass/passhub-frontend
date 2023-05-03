import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";
import InputField from "./inputField";

import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";

import * as passhubCrypto from "../lib/crypto";

class FolderNameModal extends Component {
  state = { name: "", errorMsg: "" };
  isShown = false;
  title = "";

  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }

  onClose = () => {
    this.props.onClose();
  };

  createSafe = (safeName) => {
    const safe = passhubCrypto.createSafe(safeName);
    console.log(safe);
    axios
      .post(`${getApiUrl()}create_safe.php`, {
        verifier: getVerifier(),
        safe,
      })
      .then((response) => {
        const result = response.data;

        if (result.status === "Ok") {
          this.props.onClose(true, result.id);
          return;
        }
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        this.setState({ errorMsg: result.status });
        return;
      })
      .catch((err) => {
        console.log(err);
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  renameSafe = (newName) => {
    const eName = passhubCrypto.encryptSafeName(
      newName,
      this.props.args.folder.bstringKey
    );
    axios
      .post(`${getApiUrl()}update_vault.php`, {
        vault: this.props.args.folder.id,
        verifier: getVerifier(),
        eName,
        version: 3,
      })
      .then((response) => {
        const result = response.data;
        if (result.status === "Ok") {
          this.props.onClose(true);
          return;
        }
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        this.setState({ errorMsg: result.status });
      })
      .catch(() => {
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  createFolder = (parent, folderName) => {
    const [eAesKey, SafeID, folderID] = parent.safe
      ? [parent.safe.key, parent.safe.id, parent.id]
      : [parent.key, parent.id, 0];

    passhubCrypto.decryptAesKey(eAesKey).then((aesKey) => {
      const eFolderName = passhubCrypto.encryptFolderName(folderName, aesKey);
      axios
        .post(`${getApiUrl()}folder_ops.php`, {
          operation: "create",
          verifier: getVerifier(),
          SafeID,
          folderID,
          name: eFolderName,
        })
        .then((response) => {
          const result = response.data;
          if (result.status === "Ok") {
            // safes.setNewFolderID(result.id);
            this.props.onClose(true, result.id);
            return;
          }
          if (result.status === "login") {
            window.location.href = "expired.php";
            return;
          }
          this.setState({ errorMsg: result.status });
        })
        .catch((err) => {
          console.log(err);
          this.setState({ errorMsg: "Server error. Please try again later" });
        });
    });
  };

  renameFolder = (newName) => {
    passhubCrypto
      .decryptAesKey(this.props.args.folder.safe.key)
      .then((aesKey) => {
        const eFolderName = passhubCrypto.encryptFolderName(newName, aesKey);
        axios
          .post(`${getApiUrl()}folder_ops.php`, {
            operation: "rename",
            verifier: getVerifier(),
            SafeID: this.props.args.folder.safe.id,
            folderID: this.props.args.folder.id,
            name: eFolderName,
          })
          .then((response) => {
            const result = response.data;
            if (result.status === "Ok") {
              this.props.onClose(true);
              return;
            }
            if (result.status === "login") {
              window.location.href = "expired.php";
              return;
            }
            this.setState({ errorMsg: result.status });
            return;
          })
          .catch((err) => {
            console.log(err);
            this.setState({
              errorMsg: "Server error. Please try again later",
            });
          });
      });
  };

  onSubmit = () => {
    console.log(`submit ${this.title}`);
    const name = this.state.name.trim();
    if (name.length == 0) {
      this.setState({
        name: name,
        errorMsg: "* Please fill in the name field",
      });
      return;
    }

    if (this.title == "Create Safe") {
      this.createSafe(this.state.name);
      return;
    }

    if (this.title == "Create Folder") {
      this.createFolder(this.props.args.parent, this.state.name);
      return;
    }

    // rename
    let prevName =
      this.props.args.folder.path[this.props.args.folder.path.length - 1][0];
    if (prevName == name) {
      this.props.onClose();
      return;
    }

    if (this.title == "Rename Safe") {
      this.renameSafe(this.state.name);
      return;
    }
    if (this.title == "Rename Folder") {
      this.renameFolder(this.state.name);
    }
  };

  handleChange = (e) => this.setState({ name: e.target.value, errorMsg: "" });

  keyUp = (e) => {
    if (e.key === "Enter") {
      this.onSubmit();
    }
  };

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    if (!this.isShown) {
      this.isShown = true;
      this.state.errorMsg = "";
      if (this.props.args.folder) {
        // rename
        this.state.name =
          this.props.args.folder.path[
            this.props.args.folder.path.length - 1
          ][0];
      } else {
        this.state.name = "";
      }
    }

    this.title = "Create";
    let icon = "#f-safe";
    let titleClass = "safe-name-title";

    if (this.props.args.folder) {
      [this.title, icon, titleClass] =
        this.props.args.folder.path.length < 2
          ? ["Rename Safe", "#f-safe", "safe-name-title"]
          : ["Rename Folder", "#f-folderSimplePlus", ""];
    } else {
      [this.title, icon, titleClass] = this.props.args.parent
        ? ["Create Folder", "#f-folderSimplePlus", ""]
        : ["Create Safe", "#f-safe", "safe-name-title"];
    }

    let path = "";
    if (this.props.args.parent) {
      path = this.props.args.parent.path.map((e) => e[0]).join(" > ");
    } else if (this.props.args.folder) {
      if (this.props.args.folder.path.length > 1) {
        path = this.props.args.folder.path
          .slice(0, -1)
          .map((e) => e[0])
          .join(" > ");
      }
    }

    return (
      <Modal
        show={this.props.show}
        onHide={this.onClose}
        animation={false}
        centered
      >
        <ModalCross onClose={this.props.onClose}></ModalCross>
        {path.length > 0 && false && (
          <div className="itemModalPath d-none d-sm-block">{path}</div>
        )}

        <div className="modalTitle" style={{ alignItems: "center" }}>
          <div>
            <svg width="32" height="32" style={{ marginRight: "14px" }}>
              <use href={icon}></use>
            </svg>
          </div>

          <div className="h2">{this.title}</div>
        </div>
        {this.title == "Create Safe" && <div>Shareable top-level folder</div>}

        <Modal.Body className="edit">
          <InputField
            id="folderNameModalInput"
            label="Name"
            value={this.state.name}
            edit
            autoFocus
            onChange={this.handleChange}
            onKeyUp={this.keyUp}
          ></InputField>
          {this.state.errorMsg.length > 0 && (
            <div style={{ color: "red" }}>{this.state.errorMsg}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.onClose}>
            Cancel
          </Button>

          <Button variant="primary" type="submit" onClick={this.onSubmit}>
            {this.props.args.folder ? "Rename" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default FolderNameModal;

/*           &#215;

          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              ref={this.textInput}
              type="text"
              spellCheck={false}
              onChange={this.handleChange}
              value={this.state.name}
            />
          </Form.Group>



*/
