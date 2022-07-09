import React, { Component } from "react";
import axios from "axios";
import { getApiUrl, getVerifier, getHostname } from "../lib/utils";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";

import InputField from "./inputField";

import progress from "../lib/progress";

class EmailModal extends Component {
  state = { email: "", errorMsg: "" };
  isShown = false;

  onSubmit = () => {
    const email = this.state.email.trim();
    if (email.length == 0) {
      this.setState({ errorMsg: "Please fill the email field" });
      return;
    }
    progress.lock();
    axios
      .post(`${getApiUrl()}change_mail.php`, {
        verifier: getVerifier(),
        email,
        host: getHostname(),
      })
      .then((reply) => {
        progress.unlock();
        const result = reply.data;
        if (result.status === "Ok") {
          this.props.onClose("dummy", "verifyEmail", email);
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
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  onEmailChange = (e) => {
    this.setState({ email: e.target.value, errorMsg: "" });
  };

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    if (!this.isShown) {
      this.isShown = true;
      this.state.email = this.props.accountData.email;
      this.state.errorMsg = "";
    }

    let title = "Add your email address";
    if (
      this.props.accountData.email &&
      this.props.accountData.email.length > 0
    ) {
      title = "Change email address";
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
          <div className="h2">{title}</div>
        </div>

        <Modal.Body className="edit mb32">
          <InputField
            id="mailModalInput"
            label="Email"
            value={this.state.email}
            edit={true}
            onChange={this.onEmailChange}
          ></InputField>
          {this.state.errorMsg.length > 0 && (
            <div className="error">{this.state.errorMsg}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={this.onSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EmailModal;
