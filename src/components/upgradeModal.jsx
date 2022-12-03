import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ItemModalFieldNav from "./itemModalFieldNav";
import { getApiUrl, getVerifier } from "../lib/utils";

import ModalCross from "./modalCross";

import axios from "axios";

class UpgradeModal extends Component {
  state = { discount: "", errorMsg: "" };

  isShown = false;

  onDiscountChange = (e) => {
    this.setState({
      discount: e.target.value,
      errorMsg: "",
      showDiscountInput: true,
    });
  };

  onApply = (e) => {
    if (this.state.discount.trim().length == 0) {
      return;
    }

    const data = {
      verifier: getVerifier(),
      code: this.state.discount,
    };

    axios
      .post(`${getApiUrl()}payments/discount.php`, data)
      .then((reply) => {
        const result = reply.data;
        if (result.status === "Ok") {
          this.setState({ showDiscountInput: false });
          document.querySelector("#price-after-discount span").innerText =
            "$" + result.total;
          return;
        }
        if (result.status === "Wrong discount code") {
          this.setState({ errorMsg: "Wrong discount code. Please try again" });
          return;
        }

        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        if (result.status === "expired") {
          window.location.href = "expired.php";
          return;
        }
        this.setState({ errorMsg: result.status });
        return;
      })
      .catch((err) => {
        console.log("err ", err);
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  render() {
    if (this.props.show) {
      if (!this.isShown) {
        this.isShown = true;
        this.setState({
          name: "",
          email: "",
          message: "",
          errorMsg: "",
          discount: "",
          showDiscountInput: true,
        });
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

          {this.state.showDiscountInput && (
            <div
              className="itemModalField"
              style={{
                display: "flex",
                position: "relative",
                marginBottom: 32,
              }}
            >
              <div style={{ flexGrow: 1, overflow: "hidden" }}>
                <ItemModalFieldNav
                  name="Discount code"
                  htmlFor="discount-code"
                />
                <div>
                  <input
                    id="discount-code"
                    onChange={this.onDiscountChange}
                    spellCheck={false}
                    value={this.state.discount}
                  ></input>
                </div>
              </div>
              <Button variant="primary" type="button" onClick={this.onApply}>
                Apply
              </Button>
            </div>
          )}
          {!this.state.showDiscountInput && (
            <div id="price-after-discount">
              You price tag after discount is{" "}
              <span
                style={{
                  color: "red",
                  fontSize: "larger",
                  fontWeight: "bolder",
                }}
              ></span>
            </div>
          )}

          {this.state.errorMsg.length > 0 && (
            <p style={{ color: "red" }}>{this.state.errorMsg}</p>
          )}
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
