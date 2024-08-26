import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";

import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";

import importXML from "../lib/importXML";
import importJSON from "../lib/importJSON";
import importCSV from "../lib/importCSV";
import importMerge from "../lib/importMerge";
import { createSafeFromFolder } from "../lib/crypto";
import progress from "../lib/progress";

let bindedSetState;


class ImportModal extends Component {
  state = {
    mode: "new safe",
    errorMsg: "",
    theFile: null,
  };

  isShown = false;

  handleModeChange = (e) => {
    this.setState({
      mode: e,
    });
  };

  onFileInputChange = (e) => {
    this.setState({
      theFile: e.target.files[0],
      title: e.target.files[0].name,
      errorMsg: "",
    });
  };

  uploadImportedData = (safeArray) => {
    if (safeArray.length === 0) {
      progress.unlock();
      this.props.onClose(true);
      return;
    }
    axios
      .post(`${getApiUrl()}impex.php`, {
        verifier: getVerifier(),
        import: safeArray,
      })
      .then((reply) => {
        const result = reply.data;
        progress.unlock();
        if (result.status === "Ok") {
          this.props.onClose(true);
          return;
        }
        progress.unlock();
        this.setState({ errorMsg: result.status });
        return;
      })
      .catch((error) => {
        progress.unlock();
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  onSubmit = () => {
    const theFile = this.state.theFile;


    // not used  
    bindedSetState = this.setState.bind(this);


    if (!theFile) {
      this.setState({ errorMsg: "Please select a backup file" });
      return;
    }
    const extension = theFile.name.split(".").pop().toLowerCase();
    if ( !['csv', 'xml', 'json'].includes(extension)) {
      this.setState({
        errorMsg: "Unsupported file type, only XML, JSON and CSV are allowed",
      });
      return;
    }

    if (theFile.size > 3000000) {
      this.setState({ errorMsg: "File too large" });
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => {
      console.log(err, err.loaded, err.loaded === 0, theFile.name);
      this.setState({ errorMsg: "Error loading file" });
    };

    reader.onload = () => {
      const text = reader.result;
      let imported = {};
      try {
        if (extension === "xml") {
          imported = importXML(text);
        } else if (extension === "json") {
          imported = importJSON(text);
          imported.name = theFile.name;
        } else{
          imported.name = theFile.name;
          imported.items = [];
          const importResult = importCSV(text);
          if(typeof(importResult) == 'string') {
            progress.unlock();
            console.log('Import result ' + importResult);
            this.setState({ errorMsg: importResult });

            // bindedSetState({ errorMsg: importResult });
            return;
          }
          imported.folders = importResult;
        }
      } catch (err) {
        progress.unlock();
        bindedSetState({ errorMsg: err });
        return;
      }

      console.log(imported);

      if (this.state.mode !== "restore") {
        let importedSafe;
        if( (imported.folders.length == 1) && (imported.folders[0].name == 'lastpass')) {
          imported.folders[0].name = imported.name;
          importedSafe = createSafeFromFolder(imported.folders[0]);
        } else {
          importedSafe = createSafeFromFolder(imported);
        }
        console.log(importedSafe);
        this.uploadImportedData([importedSafe]);
      } else {
        const safeArray = importMerge(imported.folders, this.props.safes);
        this.uploadImportedData(safeArray);
      }
    };
    progress.lock();
    reader.readAsText(theFile);
  };

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    if (!this.isShown) {
      this.isShown = true;
      this.state.mode = "new safe";
      this.state.errorMsg = "";
      this.state.theFile = null;
    }

    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onClose}
        onEnter={this.onEnter}
        animation={false}
      >
        <ModalCross onClose={this.props.onClose}></ModalCross>
        <div className="modalTitle">
          <div className="h2">Import</div>
        </div>

        <Modal.Body>
          {this.state.errorMsg != "" ? (
            <p style={{ color: "red" }}>{this.state.errorMsg}</p>
          ) : (
            ""
          )}
          <div className="import-modal-file-field">
            <div
              style={{
                flexGrow: 1,
                fontSize: "18px",
                lineHeight: "24px",
                padding: "12px 0 0 12px",
              }}
            >
              {this.state.theFile ? this.state.theFile.name : "Choose file"}
            </div>
            <Button variant="primary" type="submit" onClick={this.onSubmit}>
              Browse
            </Button>

            <input
              type="file"
              accept=".xml,.csv,.json"
              id="inputFileModal"
              onChange={this.onFileInputChange}
            ></input>
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: "22px",
              color: "rgba(27, 27, 38, 0.7)",
              marginBottom: 32,
            }}
          >
            <b>Supports:</b> KeePass&nbsp;2.x&nbsp;XML, Bitwarden&nbsp;JSON, KeePassX&nbsp;CSV,
            Chrome&nbsp;passwords&nbsp;CSV, Firefox&nbsp;passwords&nbsp;CSV,
            Lastpass&nbsp;CSV, DashLane&nbsp;CSV
          </div>
          <div style={{ marginBottom: 0 }}>
            {[
              {
                mode: "restore",
                comment: "Restore. Merge into existing safes where possible",
              },
              { mode: "new safe", comment: "Import into a new safe" },
            ].map((e) => (
              <div
                key={e.mode}
                style={{ display: "flex", marginBottom: 12 }}
                onClick={() => {
                  this.handleModeChange(e.mode);
                }}
              >
                <div>
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    style={{ margin: "0 14px 3px 0" }}
                  >
                    <use
                      href={
                        this.state.mode == e.mode
                          ? "#f-radio-checked"
                          : "#f-radio"
                      }
                    ></use>
                  </svg>
                </div>
                <div style={{ cursor: "default" }}>
                  {this.state.mode == e.mode ? (
                    <div>
                      <b>{e.comment}</b>
                    </div>
                  ) : (
                    <div>{e.comment}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" onClick={this.onSubmit}>
            Import
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ImportModal;
