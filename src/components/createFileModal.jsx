import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import axios from "axios";

import ModalCross from "./modalCross";
import ItemModalFieldNav from "./itemModalFieldNav";

// import PlanLimitsReachedModal from "./planLimitsReachedModal";
import UpgradeModal from "./upgradeModal";

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



const uploadFileP = (theFile, SafeID, folderID, note, aesKey) => 
  theFile.arrayBuffer()
  .then( pFileContent => {
    console.log(Date.now());
    console.log('got arrayBuffer ' + theFile.name);

    const { fileInfo, cFileContent } = passhubCrypto.encryptFile(
      pFileContent,
      aesKey
    );
    const title = theFile.name;    

    const pData = [title, "", "", "", note];
    const options = {};

    const eData = passhubCrypto.encryptItem(
      pData,
      aesKey,
      options
    );

    const data = new FormData();
    data.append("vault", SafeID);
    data.append("folder", folderID);
    data.append("verifier", getVerifier());

    data.append("meta", eData);
    data.append("file", fileInfo);
    const ab = passhubCrypto.str2uint8(cFileContent);
    const bl = new Blob([ab]);
    data.append("blob", bl);
    return axios
    .post(`${getApiUrl()}create_file.php`, data, {
      headers: {
        "content-type": "multipart/form-data",
      },
      timeout: 600000,
    })
    .then( result => {
      console.log(Date.now());
      console.log("64 axios result " + title);
      console.log(result);
      if(result.data.status != "Ok") {
        throw new Error(result.data.status);
        // throw error
      }
      return result;
    })
  })
  
function uploadFiles(files, SafeID, folderID, note, aesKey) {

    let promise = Promise.resolve();
    for(let i = 0; i < files.length; i++) {
      promise = promise.then(() => uploadFileP(files[i], SafeID, folderID, note, aesKey))
    }
    // promise.then(() => console.log('all done...'));
    console.log(promise);
    return promise;
}

class CreateFileModal extends React.Component {
  state = { errorMsg: "", files: "", note: "" };

  isShown = false;

  onClose = () => {
    this.props.onClose();
  };

  onFileInputChange = (e) => {
    this.setState({
      files: e.target.files,
      errorMsg: "",
    });

  };

  onNoteChange = (e) => this.setState({ note: e.target.value });

  onSubmit = () => {
    if (!this.props.args.item && !this.state.files) {
      this.setState({ errorMsg: "No file defined" });
      return;
    }
    
    const [aesKey, SafeID, folderID] = this.props.args.folder.safe
      ? [
          this.props.args.folder.safe.bstringKey,
          this.props.args.folder.safe.id,
          this.props.args.folder.id,
        ]
      : [this.props.args.folder.bstringKey, this.props.args.folder.id, 0];

    progress.lock(0, "file upload");
    return uploadFiles( this.state.files, SafeID, folderID, this.state.note, aesKey)
    .then(() => {
      progress.unlock();      
      console.log("129 uploaded")
      this.props.onClose(true);
      return;
    })
    .catch(err => {
      progress.unlock();      
      console.log(`upload file promise rejected`);
      console.log(err);
      if(err.message == "login") {
          window.location.href = "expired.php";
          return;
      }
      if(err.message == "expired") {
        window.location.href = "expired.php";
        return;
    }
    this.setState({ errorMsg: err.message});
    });
  }

  render() {
    if (!this.props.show) {
      if (this.isShown) {
        this.setState({ errorMsg: "", files: [], note: "" });
      }
      this.isShown = false;
      return null;
    }
    this.isShown = true;

    let fileNameArray = [];
    for(let i=0; i < this.state.files.length; i++ ) {
      fileNameArray.push(this.state.files[i].name);
    }

    if (atRecordsLimits()) {
      return (
        <UpgradeModal
          show={this.props.show}
          accountData={getUserData()}
          onClose={this.props.onClose}
        ></UpgradeModal>
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
              {(fileNameArray.length == 0) &&  (<div className="filename" style={{marginBottom:"6px", maxWidth:"330px", overflow: "hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", }}>Choose file(s)</div>)}
              {fileNameArray.map((f) => (<div className="filename">{f}</div>))}
            </div>
            <Button variant="primary" type="submit" onClick={this.onSubmit} style={{height: "48px", marginTop: ((fileNameArray.length > 1)? "12px": "0") }}>
              Browse
            </Button>

            <input type="file" onChange={this.onFileInputChange} multiple></input>
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
