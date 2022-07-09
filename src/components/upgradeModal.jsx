import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import InputField from "./inputField";
import ModalCross from "./modalCross";

class UpgradeModal extends Component {
  state = { discount: "", errorMsg: "" };

  isShown = false;

  onDiscountChange = (e) => {
    this.setState({ discount: e.target.value, errorMsg: "" });
  };

  render() {
    if (this.props.show) {
      if (!this.isShown) {
        this.isShown = true;
        this.setState({ name: "", email: "", message: "", errorMsg: "" });
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
          <div className="h2">Upgrade to Premium</div>
        </div>

        <Modal.Body className="edit" style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "32px" }}>
            <p>
              Your <b>FREE</b> account is limited to 200 records, 100 MB
              storage, and 10 MB file size
            </p>
            <p>
              Get <span style={{ fontWeight: "normal" }}>unlimited</span>{" "}
              records, <span style={{ fontWeight: "normal" }}>1GB</span> of
              storage space, and 50 MB files with <b>PREMIUM</b> plan for only
              $4 per month ($48 per year).
            </p>
          </div>
          {this.state.errorMsg.length > 0 && (
            <p style={{ color: "red" }}>{this.state.errorMsg}</p>
          )}

          <div className="payment_request" id="payment"></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.open("payments/checkout.php", "passhub_payment");
              this.props.onClose();
            }}
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default UpgradeModal;

/*

          <InputField
            value={this.state.discount}
            id="upgrade-discount"
            label="Discount"
            onChange={this.onDiscountChange}
            edit
          >
            <Button variant="primary" type="button" onClick={this.onApply}>
              Apply
            </Button>
          </InputField>

          */
