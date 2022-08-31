import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";

import { saveAs } from "file-saver";

import exportXML from "../lib/exportXML";
import exportCSV from "../lib/exportCSV";

class ExportFolderModal extends Component {
  state = {
    format: "XML",
  };
  isShown = false;

  handleFormatChange = (e) => {
    this.setState({
      format: e,
    });
  };

  onClose = () => {
    this.props.onClose();
  };

  onSubmit = () => {
    if (this.state.format === "XML") {
      const blob = exportXML(this.props.folder);
      saveAs(blob, "passhub.xml");
    } else {
      const blob = exportCSV(this.props.folder);
      saveAs(blob, "passhub.csv");
    }
    this.props.onClose();
  };

  render() {
    const formatEntries = [
      { format: "XML", comment: "KeePass 2.0 compatible, RECOMMENDED" },
      { format: "CSV", comment: "Readable, Excel compatible" },
    ];

    if (this.props.show) {
      if (!this.isShown) {
        this.isShown = true;
        this.state.format = "XML";
      }
    } else {
      this.isShown = false;
    }

    let title = "Export all safes and folders";

    if (
      this.props.show &&
      this.props.folder &&
      !Array.isArray(this.props.folder)
    ) {
      const folderName =
        this.props.folder.path[this.props.folder.path.length - 1][0];
      const isSafe = this.props.folder.path.length < 2;
      const folderType = isSafe ? "Safe" : "Folder";
      title = `Export ${folderType}: ${folderName}`;
    }

    return (
      <Modal
        show={this.props.show}
        onHide={this.onClose}
        onEnter={this.onEnter}
        animation={false}
        centered
      >
        <ModalCross onClose={this.props.onClose}></ModalCross>
        <div className="modalTitle">
          <div className="h2">{title}</div>
        </div>
        <Modal.Body>
          <div style={{ marginBottom: 32 }}>
            {formatEntries.map((e) => (
              <div
                key={e.format}
                style={{ display: "flex", marginBottom: 12 }}
                onClick={() => {
                  this.handleFormatChange(e.format);
                }}
              >
                <div>
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    style={{ marginRight: "14px" }}
                  >
                    <use
                      href={
                        this.state.format === e.format
                          ? "#f-radio-checked"
                          : "#f-radio"
                      }
                    ></use>
                  </svg>
                </div>
                <div>
                  <div>{e.format}</div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>{e.comment}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", color: "#DE5F00" }}>
            <div>
              <svg
                width="39"
                height="41"
                fill="none"
                style={{ marginRight: "14px" }}
              >
                <use href="#no-files-exported"></use>
              </svg>
            </div>
            <div>
              Files and images will not be exported.<br></br> Unfortunately, you
              need to download them manually
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" onClick={this.onSubmit}>
            Export
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ExportFolderModal;
