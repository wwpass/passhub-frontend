import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";

import ModalCross from "./modalCross";
class DelUserModal extends Component {
  state = {
    errorMsg: "",
  };

  closeModal = () => {
    this.props.hide();
  };

  submit = () => {
    const self = this;
    axios
      .post(`${getApiUrl()}iam.php`, {
        verifier: getVerifier(),
        operation: "delete",
        email: self.props.data.email,
        id: self.props.data.id,
      })
      .then((result) => {
        if (result.data.status === "Ok") {
          self.props.updatePage();
          return;
        }
        if (result.data.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        self.setState({ errorMsg: result.data.status });
      })
      .catch((error) => {
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  render() {
    return (
      <Modal show={this.props.data.show} onHide={this.closeModal}>
        <ModalCross onClose={this.closeModal}></ModalCross>
        <div className="modalTitle">
          <div className="h2">Delete User Account</div>
        </div>

        <Modal.Body>
          <div>email: {this.props.data.email}</div>
          <div>id: {this.props.data.id}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.closeModal}>
            Cancel
          </Button>
          <Button onClick={this.submit}>Ok</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DelUserModal;
