import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";

import ModalCross from "./modalCross";

class DeleteAccountFinalModal extends Component {
  state = { errorMsg: "" };
  isShown = false;

  doDeleteAccount = () => {
    axios
      .post(`${getApiUrl()}close_account.php`, {
        verifier: getVerifier(),
        operation: "delete",
      })
      .then((reply) => {
        const result = reply.data;
        if (result.status === "Ok") {
          this.props.onClose(1, "account deleted");
          return;
        }
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        this.setState({ errorMsg: result.status });
        return;
      })
      .catch((err) => {
        this.setState({
          errorMsg: "Server error. Please try again later",
        });
      });
  };

  render() {
    if (!this.props.show) {
      if (this.isShown) {
        this.setState({ errorMsg: "" });
      }
      this.isShown = false;
      return null;
    }
    this.isShown = true;

    return (
      <Modal
        show={this.props.show}
        onShow={this.onShow}
        onHide={this.props.onClose}
        animation={false}
        centered
      >
        <ModalCross onClose={this.props.onClose}></ModalCross>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "48px 0 0 0",
          }}
        >
          <svg style={{ width: 80, height: 80, fill: "red" }}>
            <use href="#a-danger"></use>
          </svg>
          <div style={{ margin: "24px 0 32px 0", fontSize: "32px" }}>
            Close my account
          </div>
        </div>

        <div style={{ marginBottom: "48px" }}>
          You are about to lose all your data stored in PassHub and you will be
          unable to restore it.
        </div>
        {this.state.errorMsg.length > 0 && (
          <div style={{ color: "red" }}>{this.state.errorMsg}</div>
        )}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={this.doDeleteAccount}>
            Close account
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteAccountFinalModal;
