import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import ModalCross from "./modalCross";
import { getUserData, totalRecords } from "../lib/utils";

class PlanLimitsReacheModal extends Component {
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

    const account = getUserData();
    const upgrade = account.plan && account.plan.toLowerCase().includes("free");

    const message = upgrade ? (
      <p>
        Maximum number of passwords, notes, and bank card records for your{" "}
        <b>{account.plan}</b> plan is <b>{account.MAX_RECORDS}</b> records. You
        already have <b>{totalRecords()}</b> records.
      </p>
    ) : (
      <p>
        Maximum number of passwords, notes, and bank card records is{" "}
        {account.MAX_RECORDS}. You already have <b>{totalRecords()}</b> records.
      </p>
    );

    const title = upgrade
      ? "Upgrade to Premium"
      : "Maximum number of records reached";

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

        <Modal.Body className="edit" style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "32px" }}>
            <p>{message}</p>
            {upgrade && (
              <p>
                Get <span style={{ fontWeight: "normal" }}>unlimited</span>{" "}
                records, <span style={{ fontWeight: "normal" }}>1GB</span> of
                storage space, and 50 MB files with <b>PREMIUM</b> plan for only
                $4 per month ($48 per year).
              </p>
            )}
          </div>
          {this.state.errorMsg.length > 0 && (
            <p style={{ color: "red" }}>{this.state.errorMsg}</p>
          )}
        </Modal.Body>
        {upgrade && (
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
        )}
      </Modal>
    );
  }
}

export default PlanLimitsReacheModal;

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
