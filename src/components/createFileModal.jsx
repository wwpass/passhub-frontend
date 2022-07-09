import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import axios from "axios";

import ModalCross from "./modalCross";
import ItemModalFieldNav from "./itemModalFieldNav";

import PlanLimitsReachedModal from "./planLimitsReachedModal";
import PlanStorageLimitsReachedModal from "./planStorageLimitsReachedModal";

import progress from "../lib/progress";
import * as passhubCrypto from "../lib/crypto";
import {
  getApiUrl,
  getVerifier,
  getUserData,
  atRecordsLimits,
  atStorageLimits,
  humanReadableFileSize,
} from "../lib/utils";

class CreateFileModal extends React.Component {
  state = { errorMsg: "", theFile: "", note: "" };

  isShown = false;

  onClose = () => {
    this.props.onClose();
  };

  onFileInputChange = (e) => {
    this.setState({
      theFile: e.target.files[0],
      errorMsg: "",
    });

    if (e.target.files[0].size > getUserData().MAX_FILE_SIZE) {
      this.setState({
        errorMsg: `File too large: ${humanReadableFileSize(
          e.target.files[0].size
        )}, max ${humanReadableFileSize(getUserData().MAX_FILE_SIZE)}`,
      });
      return;
    }
    const { type, size, lastModifiedDate } = e.target.files[0];
    console.log(type, size, lastModifiedDate);
  };

  onNoteChange = (e) => this.setState({ note: e.target.value });

  onSubmit = () => {
    if (!this.props.args.item && !this.state.theFile) {
      this.setState({ errorMsg: "No file defined" });
      return;
    }
    if (this.state.theFile.size > getUserData().MAX_FILE_SIZE) {
      this.setState({
        errorMsg: `File too large: ${humanReadableFileSize(
          this.state.theFile.size
        )}, max ${humanReadableFileSize(getUserData().MAX_FILE_SIZE)}`,
      });
      return;
    }
    const title = this.state.theFile.name;
    const { note } = this.state;

    const pData = [title, "", "", "", note];
    const options = {};

    const [aesKey, SafeID, folderID] = this.props.args.folder.safe
      ? [
          this.props.args.folder.safe.bstringKey,
          this.props.args.folder.safe.id,
          this.props.args.folder.id,
        ]
      : [this.props.args.folder.bstringKey, this.props.args.folder.id, 0];

    const eData = passhubCrypto.encryptItem(
      pData,
      aesKey,
      // init.safe.bstringKey, ?? TODO
      options
    );

    if (this.props.args.item) {
      progress.lock(0, "rename");
      axios
        .post(`${getApiUrl()}file_ops.php`, {
          verifier: getVerifier(),
          operation: "rename",
          SafeID,
          itemId: this.props.args.item._id,
          newName: eData,
        })
        .then((reply) => {
          progress.unlock();
          const result = reply.data;
          if (result.status == "Ok") {
            this.props.onClose(true);
            return;
          }
          if (result.status === "login") {
            window.location.href = "login.php";
            return;
          }
          if (result.status === "expired") {
            window.location.href = "expired.php";
            return;
          }
          this.setState({ errorMsg: result.status });
          return;
        })
        .catch((err) => {
          progress.unlock();
          this.setState({ errorMsg: "Server error. Please try again later" });
        });
      return;
    }

    const reader = new FileReader();

    progress.lock(0, "Encrypting file.");
    reader.readAsArrayBuffer(this.state.theFile);

    reader.onerror = (err) => {
      let error = "Error reading file";
      /*      
      if (
        err.currentTarget &&
        err.currentTarget.error &&
        err.currentTarget.error.message
      ) {
        error = err.currentTarget.error;
      }
      */
      if (reader.error && reader.error.message) {
        error = reader.error.message;
      }
      this.setState({ errorMsg: error });
    };

    reader.onload = () => {
      const { fileInfo, cFileContent } = passhubCrypto.encryptFile(
        reader.result,
        aesKey
      );
      progress.unlock();
      progress.lock(0, "Uploading. ");

      const data = new FormData();
      data.append("vault", SafeID);
      data.append("folder", folderID);
      data.append("verifier", getVerifier());

      data.append("meta", eData);
      data.append("file", fileInfo);
      const ab = passhubCrypto.str2uint8(cFileContent);
      const bl = new Blob([ab]);
      data.append("blob", bl);
      //       progress.lock();

      axios
        .post(`${getApiUrl()}create_file.php`, data, {
          headers: {
            "content-type": "multipart/form-data",
          },
          timeout: 600000,
        })
        .then((reply) => {
          progress.unlock();
          const result = reply.data;
          if (result.status == "Ok") {
            this.props.onClose(true);
            return;
          }
          if (result.status === "login") {
            window.location.href = "login.php";
            return;
          }
          if (result.status === "expired") {
            window.location.href = "expired.php";
            return;
          }
          this.setState({ errorMsg: result.status });
          return;
        })
        .catch((err) => {
          progress.unlock();
          this.setState({ errorMsg: "Server error. Please try again later" });
        });
    };
  };

  render() {
    if (!this.props.show) {
      if (this.isShown) {
        this.setState({ errorMsg: "", theFile: "", note: "" });
      }
      this.isShown = false;
      return null;
    }
    this.isShown = true;

    if (atRecordsLimits()) {
      return (
        <PlanLimitsReachedModal
          show={this.props.show}
          onClose={this.props.onClose}
        ></PlanLimitsReachedModal>
      );
    }

    if (atStorageLimits()) {
      return (
        <PlanStorageLimitsReachedModal
          show={this.props.show}
          onClose={this.props.onClose}
        ></PlanStorageLimitsReachedModal>
      );
    }

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
            <svg
              width="32"
              height="32"
              style={{ marginRight: "14px", stroke: "#1b1b26" }}
            >
              <use href="#i-file"></use>
            </svg>
          </div>

          <div className="h2">Upload File</div>
        </div>
        <Modal.Body className="edit">
          {this.state.errorMsg && (
            <div style={{ color: "red", marginBottom: 16 }}>
              {this.state.errorMsg}
            </div>
          )}
          <div className="import-modal-file-field">
            <div
              style={{
                flexGrow: 1,
                fontSize: "18px",
                lineHeight: "24px",
                padding: "12px 0 0 12px",
                overflowWrap: "anywhere",
              }}
            >
              {this.state.theFile ? this.state.theFile.name : "Choose file"}
            </div>
            <Button variant="primary" type="submit" onClick={this.onSubmit}>
              Browse
            </Button>

            <input type="file" onChange={this.onFileInputChange}></input>
          </div>
          <div className="itemNoteModalField">
            <ItemModalFieldNav name="Note" />
            <div>
              <textarea
                className="notes"
                onChange={this.onNoteChange}
                spellCheck={false}
                value={this.state.note}
                style={{ width: "100%" }}
                rows="5"
                placeholder="Type notes here"
              ></textarea>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.onClose}>
            Cancel
          </Button>

          <Button variant="primary" type="submit" onClick={this.onSubmit}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateFileModal;
