import React, { Component } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import ItemModalFieldNav from "./itemModalFieldNav";
import ItemViewIcon from "./itemViewIcon";
import ModalCross from "./modalCross";

import { putCopyBuffer } from "../lib/copyBuffer";
import TextareaAutosize from "react-textarea-autosize";

import { limits } from "../lib/utils";

class ItemModal extends Component {
  state = {
    edit: true,
    title: "",
    note: "",
    errorMsg: "",
  };

  isShown = false;

  constructor(props) {
    super(props);
    this.titleInput = React.createRef();
    this.textAreaRef = React.createRef();
  }

  onTitleChange = (e) => {
    let errorMsg = "";
    const maxLength = limits.MAX_TITLE_LENGTH;
    let newValue = e.target.value;

    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
      errorMsg = `Title max length is ${maxLength} chars, truncated`;
    }
    this.setState({
      title: newValue,
      errorMsg,
    });
  };

  onNoteChange = (e) => {
    let errorMsg = "";
    const maxLength = limits.MAX_NOTE_LENGTH;
    let newValue = e.target.value;

    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
      errorMsg = `Notes max length is ${maxLength} chars, truncated`;
    }
    this.setState({
      note: newValue,
      errorMsg,
    });

    /* text area
    e.target.style.height = "auto";
    console.log(e.target.scrollHeight);
    e.target.style.height = e.target.scrollHeight + "px";
    */
  };

  onNoteInput = (e) => {
    this.setState({ note: e.target.innerHTML });
  };

  onShow = () => {
    this.state.edit && this.titleInput.current.focus();
  };

  onClose = () => {
    this.props.onClose();
  };

  onSubmit = () => {
    this.state.title = this.state.title.trim();
    if (this.state.title == "") {
      this.setState({ errorMsg: "Please set a title" });
      return;
    }
    this.props.onSubmit(this.state.title, this.state.note);
  };

  onEdit = () => {
    this.setState({ edit: true });
    if (this.props.onEdit) {
      this.props.onEdit();
    }
  };

  setTitle = (aTitle) => {
    this.setState({ title: aTitle });
  };

  handleMove = () => {
    putCopyBuffer({ item: this.props.args.item, operation: "move" });
    this.props.onClose();
  };

  handleCopy = () => {
    putCopyBuffer({ item: this.props.args.item, operation: "copy" });
    this.props.onClose();
  };

  onView = () => {};

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    let path = [];
    let folderName = "";
    let lastModified = "";

    if (this.props.args.item) {
      path = this.props.args.item.path;
      if (this.props.args.item.lastModified) {
        lastModified = new Date(this.props.args.item.lastModified);
        lastModified = lastModified.toLocaleString();
      }
    } else if (this.props.args.folder) {
      path = this.props.args.folder.path;
    }

    folderName = path[path.length - 1];

    const pathString = path.join(" > ");
    /*
    if (this.props.args.folder) {
      path = this.props.args.folder.path.join(" > ");
      folderName =
        this.props.args.folder.path[this.props.args.folder.path.length - 1];
    }
*/

    if (!this.isShown) {
      this.isShown = true;
      this.state.errorMsg = "";
      if (this.props.args.item) {
        this.state.title = this.props.args.item.cleartext[0];
        this.state.note = this.props.args.item.cleartext[4];
        if (this.props.args.item.version == 5) {
          this.state.title = this.props.args.item.cleartext[1];
          this.state.note = this.props.args.item.cleartext[2];
        }
        this.state.edit = false;
      } else {
        this.state.title = "";
        this.state.note = "";
        this.state.edit = true;
      }
    }

    let modalClass = this.state.edit ? "edit" : "view";

    const maxHeight = this.props.isNote ? "" : "150px";

    return (
      <Modal
        show={this.props.show}
        onShow={this.onShow}
        onHide={this.onClose}
        animation={false}
        centered
      >
        <ModalCross onClose={this.props.onClose}></ModalCross>
        <div
          className="d-sm-none green70"
          style={{ cursor: "pointer", margin: "18px 0" }}
          onClick={() => {
            this.props.onClose();
            /*
            if (this.props.searchMode) {
              this.props.onSearchClear();
            }

            if (folder.SafeID) {
              this.props.openParentFolder(folder);
            } else {
              document.querySelector("#safe_pane").classList.remove("d-none");
              document.querySelector("#table_pane").classList.add("d-none");
            }
            */
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
          {folderName}
        </div>

        <div className="itemModalNav">
          <div
            className="itemModalPath d-none d-sm-block set-active-folder"
            onClick={this.props.onCloseSetFolder}
          >
            {pathString}
          </div>
          {!this.state.edit ? (
            <div className="itemModalTools">
              {/*
                <ItemViewIcon iconId="#f-history" opacity="1" title="History" />
                */}
              <ItemViewIcon
                iconId="#f-move"
                title="Move"
                onClick={this.handleMove}
              />
              {!("file" in this.props.args.item) && (
                <ItemViewIcon
                  iconId="#f-copy"
                  title="Copy"
                  onClick={this.handleCopy}
                />
              )}
              <ItemViewIcon
                iconId="#f-trash"
                title="Delete"
                onClick={this.props.args.openDeleteItemModal}
              />
              <div className="itemModalEditButton" onClick={this.onEdit}>
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="#00BC62"
                  style={{
                    verticalAlign: "unset",
                    marginRight: "10px",
                  }}
                >
                  <use href="#f-edit"></use>
                </svg>
                <span style={{ verticalAlign: "top" }}>Edit</span>
              </div>
            </div>
          ) : (
            <div className="itemModalTools edit">
              <div className="itemModalEditButton" onClick={this.onSubmit}>
                <span style={{ verticalAlign: "top" }}>Save</span>
              </div>
            </div>
          )}
        </div>

        {this.state.edit ? (
          <Form.Control
            className="ModalTitle h2"
            ref={this.titleInput}
            type="text"
            onChange={this.onTitleChange}
            value={this.state.title}
            spellCheck="false"
            placeholder="Title"
          />
        ) : (
          <React.Fragment>
            <div className="itemModalTitle">
              <div className="h2">{this.state.title}</div>
            </div>
            <div
              style={{
                // position: "absolute",
                width: "100%",
                height: "1px",
                // left: 0,
                // top: "130px",
                background: "#E7E7EE",
              }}
            ></div>
            <div
              style={{
                color: "#1b1b26",
                opacity: 0.7,
                fontStyle: "italic",
                textAlign: "end",
              }}
            >
              {lastModified}
            </div>
          </React.Fragment>
        )}

        <Modal.Body className={modalClass}>
          {this.state.errorMsg && (
            <div style={{ color: "red", marginBottom: 16 }}>
              {this.state.errorMsg}
            </div>
          )}
          {this.props.children}

          <div className="itemNoteModalField">
            <ItemModalFieldNav name="Note" htmlFor="notes" />
            <div className="xxx">
              {this.state.edit ? (
                <TextareaAutosize
                  id="notes"
                  value={this.state.note}
                  onChange={this.onNoteChange}
                  placeholder="Type notes here"
                />
              ) : (
                <div className="note-view">{this.state.note}</div>
              )}
            </div>
          </div>
        </Modal.Body>
        {this.props.errorMsg && this.props.errorMsg.length > 0 && (
          <div style={{ color: "red" }}>{this.props.errorMsg}</div>
        )}

        {this.state.edit && (
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={this.onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={this.onSubmit}>
              Save
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    );
  }
}

export default ItemModal;

/*
                <textarea
                  id="notes"
                  className="notes"
                  readOnly={!this.state.edit}
                  spellCheck={false}
                  value={this.state.note}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: this.props.isNote ? "430px" : "180px",
                  }}
                  onChange={this.onNoteChange}
                  placeholder="Type notes here"
                  ref={this.textAreaRef}
                ></textarea>

                <div
                  contentEditable="true"
                  onChange={this.onNoteChange}
                  onInput={this.onNoteInput}
                  style={{
                    outline: "none",
                    overflow: "auto",
                    maxHeight: this.props.isNote ? "430px" : "180px",
                  }}
                >
                  {this.state.note}
                </div>

                <ContentEditable
                  html={this.state.note}
                  onChange={this.onNoteChange}
                  style={{ outline: "none" }}
                />



                */
