import React, { Component } from "react";
import axios from "axios";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import ModalCross from "./modalCross";

import InputField from "./inputField";

class VerifyEmailModal extends Component {
  state = { code: "", errorMsg: "" };
  isShown = false;

  onCodeChange = (e) => {
    this.setState({ code: e.target.value, errorMsg: "" });
  };

  contactUs = () => {
    this.props.onClose("dummy", "Contact us");
  };

  onSubmit = () => {
    const code = this.state.code.trim();
    console.log("Submit");
    if (code.length == 0) {
      this.setState({ errorMsg: "Please fill the code field" });
      return;
    }

    axios
      .post("registration_action.php", {
        code6: code,
        purpose: "change",
      })
      .then((reply) => {
        const result = reply.data;
        if (result.status === "Ok") {
          this.props.onClose();
          return;
        }
        this.setState({ errorMsg: result.status });
      })
      .catch((err) => {
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  render() {
    if (this.props.show) {
      if (!this.isShown) {
        this.isShown = true;
        this.state.code = "";
      }
    } else {
      this.isShown = false;
      return null;
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
          <div className="h2">Check your mailbox</div>
        </div>

        <Modal.Body className="edit mb24">
          <div className="mb32">
            Please enter the code we’ve sent to{" "}
            <b>{this.props.emailToVerify}</b>
          </div>
          <InputField
            id="mailModalInput"
            label="Code"
            value={this.state.code}
            edit={true}
            onChange={this.onCodeChange}
          ></InputField>
          {this.state.errorMsg.length > 0 && (
            <div className="error">{this.state.errorMsg}</div>
          )}
          <div className="dark50">
            If you do not receive this email, please check your Spam folder,
            make sure the provided email address is correct, or{" "}
            <a className="green70" href="#" onClick={this.contactUs}>
              contact us
            </a>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={this.onSubmit}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default VerifyEmailModal;
