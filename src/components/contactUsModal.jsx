import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";

import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";

import InputField from "./inputField";
import TextAreaField from "./textAreaField";

import TextareaAutosize from "react-textarea-autosize";

import progress from "../lib/progress";

class ContactUsModal extends Component {
  state = { name: "", email: "", message: "", errorMsg: "" };

  isShown = false;

  onNameChange = (e) => {
    this.setState({ name: e.target.value, errorMsg: "" });
  };

  onEmailChange = (e) => {
    this.setState({ email: e.target.value, errorMsg: "" });
  };

  onMessageChange = (e) => {
    this.setState({ message: e.target.value, errorMsg: "" });
  };

  onSubmit = () => {
    if (this.state.message.trim().length == 0) {
      this.setState({ errorMsg: "please fill in the message field" });
      return;
    }
    progress.lock();
    axios
      .post(`${getApiUrl()}contact_us.php`, {
        verifier: getVerifier(),
        name: this.state.name,
        email: this.state.email,
        message: this.state.message,
      })
      .then((reply) => {
        progress.unlock();
        const result = reply.data;
        if (result.status === "Ok") {
          this.props.onClose(1, "success");
          return;
        }
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }

        this.setState({ errorMsg: result.status });
      })
      .catch((err) => {
        progress.unlock();
        this.setState({
          errorMsg: "Error sending email. Please try again later",
        });
      });
  };

  render() {
    if (this.props.show) {
      if (!this.isShown) {
        this.isShown = true;
        this.setState({ name: "", email: "", message: "", errorMsg: "" });
      }
    } else {
      this.isShown = false;
    }

    return (
      <Modal
        show={this.props.show}
        onShow={this.onShow}
        onHide={this.props.onClose}
        animation={false}
        centered
      >
        <ModalCross onClose={this.props.onClose}></ModalCross>
        <div className="modalTitle">
          <div className="h2">Contact us</div>
        </div>
        <Modal.Body className="edit" style={{ marginBottom: "24px" }}>
          {this.state.errorMsg.length > 0 ? (
            <div style={{ color: "red", margin: "0 16px 16px" }}>
              <svg
                style={{
                  width: "24px",
                  height: "24px",
                  fill: "red",
                  marginRight: "16px",
                }}
              >
                <use href="#a-error"></use>
              </svg>
              {this.state.errorMsg}
            </div>
          ) : (
            ""
          )}
          <InputField
            value={this.state.name}
            id="contact-us-name"
            label="Name"
            onChange={this.onNameChange}
            edit
          ></InputField>
          <InputField
            value={this.state.email}
            id="contact-us-email"
            label="Email"
            onChange={this.onEmailChange}
            edit
          ></InputField>

          <div className="itemNoteModalField">
            <TextareaAutosize
              id="contact-us-message"
              value={this.state.message}
              onChange={this.onMessageChange}
              placeholder="Type message here"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={this.onSubmit}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ContactUsModal;

/*

          <TextAreaField
            value={this.state.message}
            id="contact-us-message"
            label="Message"
            onChange={this.onMessageChange}
            edit
          ></TextAreaField>

*/
