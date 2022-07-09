import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";

class DeleteAccountModal extends Component {
  state = {};
  render() {
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
            Before shutting down your account
          </div>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <b>Be sure</b> to transfer ownership of your shared safes to your
          peers.
        </div>
        <div style={{ marginBottom: "48px" }}>
          <b>Please note</b> it is the last chance to backup (export) all your
          data.
        </div>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => this.props.onClose("dummy", "delete account final")}
          >
            Next
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteAccountModal;
