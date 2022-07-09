import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

class IdleModal extends Component {
  onLogout = () => {
    window.location.href = "logout.php";
  };

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onClose}
        animation={false}
      >
        <Modal.Header closeButton>
          You have not used the site for a while
        </Modal.Header>
        <Modal.Body>
          <p>
            For your security, your connection will be closed if there is no
            activity within one minute. Would you like to extend your
            connection?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Extend
          </Button>
          <Button onClick={this.onLogout}>Logout</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default IdleModal;
