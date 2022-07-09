import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

class SuccessModal extends Component {
  render() {
    let iconId = "#f-success";
    let iconStyle = { width: "112px", height: "112px" };
    let title = "Success";
    if (this.props.error) {
      iconId = "#a-error";
      title = "Error";
    } else if (this.props.norights) {
      iconId = "#a-forbidden";
      iconStyle.fill = "red";
      iconStyle.margin = "1em";
      title = "Forbidden";
    } else if (this.props.thankyou) {
      title = "Thank you";
    } else {
      iconStyle.fill = "none";
    }

    return (
      <Modal
        show={this.props.show}
        onShow={this.onShow}
        onHide={this.props.onClose}
        animation={false}
        centered
      >
        <Modal.Body>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <svg style={iconStyle}>
              <use href={iconId}></use>
            </svg>
            <div className="h2" style={{ marginBottom: "1em" }}>
              {title}
            </div>
            <div style={{ marginBottom: "108px" }}>{this.props.children}</div>
            <Button
              variant="primary"
              type="submit"
              style={{ minWidth: "168px", marginLeft: "12px" }}
              onClick={this.props.onClose}
            >
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

export default SuccessModal;
