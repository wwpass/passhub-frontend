import React, { Component } from "react";

import axios from "axios";
import { saveAs } from "file-saver";

import * as passhubCrypto from "../lib/crypto";
import {
  getApiUrl,
  getVerifier,
  atRecordsLimits,
  atStorageLimits,
  isMobile,
  humanReadableFileSize,
} from "../lib/utils";

import DownloadAndViewButtons from "./downloadAndViewButtons";
import PlanLimitsReachedModal from "./planLimitsReachedModal";
import PlanStorageLimitsReachedModal from "./planStorageLimitsReachedModal";

import ItemModal from "./itemModal";
import ViewFile from "./viewFile";

import progress from "../lib/progress";

function getMimeByExt(filename) {
  const mimeType = {
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    gzip: "application/gzip",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    pdf: "application/pdf",
    png: "image/png",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    tif: "image/tiff",
    tiff: "image/tiff",
    txt: "text/plain",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    zip: "application/zip",
  };
  const i = filename.lastIndexOf(".");
  if (i !== -1) {
    const ext = filename.substr(i + 1).toLowerCase();
    if (ext in mimeType) {
      return mimeType[ext];
    }
  }
  // }
  return "application/octet-binary";
}

function isFileViewable(filename) {
  const dot = filename.lastIndexOf(".");
  if (dot > 0) {
    const ext = filename.substring(dot + 1).toLowerCase();
    if (ext == "pdf") {
      if (isMobile()) {
        return false;
      }

      if (
        navigator.userAgent.indexOf("Chrome") == -1 &&
        navigator.userAgent.indexOf("Safari") > 0 &&
        navigator.userAgent.indexOf("Macintosh") > 0
      ) {
        return false;
      }
      return true;
    }
    if (
      ext == "jpeg" ||
      ext == "jpg" ||
      ext == "png" ||
      ext == "gif" ||
      ext == "bmp"

      /* || (ext == 'tif')
       || (ext == 'svg')  
      */
    ) {
      return true;
    }
  }
  return false;
}

class FileModal extends Component {
  state = {
    edit: false,
    errorMsg: "",
    theFile: null,
    page: "",
  };

  onEdit = () => {
    this.setState({ edit: true });
  };

  constructor(props) {
    super(props);
    this.wrapperComponent = React.createRef();
  }

  isShown = false;

  onClose = () => {
    this.props.onClose();
  };

  download(callBack) {
    let safe;

    if (this.props.args.safe) {
      safe = this.props.args.safe;
    } else if (this.props.args.folder.safe) {
      safe = this.props.args.folder.safe;
    } else {
      safe = this.props.args.folder;
    }

    const aesKey = safe.bstringKey;
    const SafeID = safe.id;
    /*
    const folderID = this.props.args.item
      ? this.props.args.item.folder
      : this.props.args.folder;
*/
    /*
    const [eAesKey, SafeID, folderID] = this.props.args.folder.safe
      ? [
          this.props.args.folder.safe.key,
          this.props.args.folder.safe.id,
          this.props.args.folder.id,
        ]
      : [this.props.args.folder.key, this.props.args.folder.id, 0];
      */

    progress.lock(0);
    axios
      .post(`${getApiUrl()}file_ops.php`, {
        operation: "download",
        SafeID,
        verifier: getVerifier(),
        itemId: this.props.args.item._id,
      })
      .then((reply) => {
        progress.unlock();
        const result = reply.data;
        if (result.status === "Ok") {
          const { filename, buf } = passhubCrypto.decryptFile(result, aesKey);
          const mime = getMimeByExt(filename);
          const blob = new Blob([buf], { type: mime });
          callBack(blob, filename);

          /*
          passhubCrypto.decryptAesKey(eAesKey).then((aesKey) => {
            const { filename, buf } = passhubCrypto.decryptFile(result, aesKey);
            const mime = getMimeByExt(filename);
            const blob = new Blob([buf], { type: mime });
            callBack(blob, filename);
          });
*/

          return;
        }
        if (result.status === "File not found") {
          // utils.bsAlert('File not found. Could be erased by another user');
          // passhub.refreshUserData();
          return;
        }
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        window.location.href = "error_page.php?js=other";
      })
      .catch((err) => {
        progress.unlock();
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  }

  onDownload = () => {
    this.download(saveAs);
  };

  inMemoryView = (blob, filename) => {
    this.blob = blob;
    this.filename = filename;
    this.setState({ page: "ViewFile" });
  };

  onView = () => {
    this.download(this.props.inMemoryView);
    //this.download(this.inMemoryView);
  };

  onFileInputChange = (e) => {
    this.setState({
      theFile: e.target.files[0],
      title: e.target.files[0].name,
      errorMsg: "",
    });
    this.wrapperComponent.current.setTitle(e.target.files[0].name);
    const { type, size, lastModifiedDate } = e.target.files[0];
    console.log(type, size, lastModifiedDate);
  };

  onSubmit = (title, note) => {
    if (!this.props.args.item && !this.state.theFile) {
      this.setState({ errorMsg: "No file defined" });
      return;
    }

    const pData = [title, "", "", "", note];
    const options = {};

    let safe;

    if (this.props.args.safe) {
      safe = this.props.args.safe;
    } else if (this.props.args.folder.safe) {
      safe = this.props.args.folder.safe;
    } else {
      safe = this.props.args.folder;
    }

    const aesKey = safe.bstringKey;
    const SafeID = safe.id;
    const folderID = this.props.args.item
      ? this.props.args.item.folder
      : this.props.args.folder;

    /*
    const [aesKey, SafeID, folderID] = this.props.args.folder.safe
      ? [
          this.props.args.folder.safe.bstringKey,
          this.props.args.folder.safe.id,
          this.props.args.folder.id,
        ]
      : [this.props.args.folder.bstringKey, this.props.args.folder.id, 0];
*/
    const eData = passhubCrypto.encryptItem(pData, aesKey, options);

    if (this.props.args.item) {
      progress.lock(0);
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

    // progress.lock(0, 'Encrypting.');
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
      //        progress.unlock();
      //        progress.lock(0, "Uploading. ");

      const data = new FormData();
      data.append("vault", SafeID);
      data.append("folder", folderID);
      data.append("verifier", getVerifier());

      data.append("meta", eData);
      data.append("file", fileInfo);
      const ab = passhubCrypto.str2uint8(cFileContent);
      const bl = new Blob([ab]);
      data.append("blob", bl);
      progress.lock();

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

  gotoMain = () => {
    this.setState({ page: "" });
  };

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    if (typeof this.props.args.item == "undefined") {
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
    }

    if (!this.isShown) {
      this.isShown = true;
      this.state.errorMsg = "";
      if (this.props.args.item) {
        this.state.title = this.props.args.item.cleartext[0];
        this.state.edit = false;
      } else {
        this.state.title = "";
        this.state.edit = true;
      }
    }

    let modalClass = this.state.edit ? "edit" : "view";

    // const path = this.props.folder ? this.props.folder.path.join(" > ") : [];

    return (
      <React.Fragment>
        <ItemModal
          show={this.props.show}
          args={this.props.args}
          onEdit={this.onEdit}
          onClose={this.props.onClose}
          onCloseSetFolder={this.props.onCloseSetFolder}
          ref={this.wrapperComponent}
          onSubmit={this.onSubmit}
          errorMsg={this.state.errorMsg}
        >
          {!this.props.args.item ? (
            <div
              className="itemModalField"
              style={{
                marginBottom: 62,
                position: "relative",
                background: "#E6F8EF",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  margin: "12px auto",
                  color: "#009A50",
                  display: "table",
                }}
              >
                <svg width="24" height="24">
                  <use href="#f-add"></use>
                </svg>
                <b>Upload file</b>
                <div>or drag & drop it here</div>
              </div>

              <svg
                width="151"
                height="134"
                style={{ position: "absolute", top: 16, left: 32 }}
              >
                <use href="#f-dragfile"></use>
              </svg>

              <input
                type="file"
                id="inputFileModal"
                onChange={this.onFileInputChange}
              ></input>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "40px",
              }}
            >
              <svg width="105" height="132" style={{ marginBottom: "32px" }}>
                <use href="#f-file-m"></use>
              </svg>
              <div style={{ marginBottom: "24px" }}>
                <span style={{ color: "rgba(27, 27, 38, 0.5)" }}>
                  {humanReadableFileSize(this.props.args.item.file.size)}
                </span>
              </div>
              {!this.state.edit && (
                <DownloadAndViewButtons
                  onDownload={this.onDownload}
                  view={isFileViewable(this.state.title)}
                  onView={this.onView}
                ></DownloadAndViewButtons>
              )}
            </div>
          )}
        </ItemModal>
        <ViewFile
          show={this.state.page === "ViewFile"}
          gotoMain={this.gotoMain}
          filename={this.filename}
          blob={this.blob}
        />
      </React.Fragment>
    );
  }
}

export default FileModal;
