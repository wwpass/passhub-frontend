import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ItemModalFieldNav from "./itemModalFieldNav";
import { getApiUrl, getVerifier, totalStorage, totalRecords, atStorageLimits, atRecordsLimits, humanReadableFileSize } from "../lib/utils";

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

  /*
  getPlans = ()  => {
    axios
      .get(`${getApiUrl()}payments/plans.php`)
      .then(reply => {
        const result = reply.data;
        console.log(result);
        if (result.status === "Ok") {
        }
      });
  }
  */;

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

  sizeLimits = (size) => {
    if(size == 0) return "0";
    if (size < 1024) return `${size} B`;
    const i = Math.floor(Math.log(size) / Math.log(1024));
    let num = (size / Math.pow(1024, i));
    const round = Math.round(num);
//      num = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round
    return `${round} ${'KMGTPEZY'[i-1]}B`;
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
          showDiscountInput: false,
//          showDiscountInput: true,
        });
//        this.getPlans();
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
           {atStorageLimits() && (
            <p style={{color: "red"}}>
                  Maximum storage size for your FREE plan is {this.sizeLimits(this.props.accountData.maxStorage)}. You have alreaady used {humanReadableFileSize(totalStorage())}.
            </p>
           )}
           {atRecordsLimits() && (
              <p style={{color: "red"}}>
                  Maximum number of passwords, notes, and bank card records for your{" "}
                  <b>FREE</b> plan is <b>{this.props.accountData.maxRecords}</b> records. You
                  already have <b>{totalRecords()}</b> records.              
              </p>
           )}

           {!atStorageLimits() && !atRecordsLimits() && (
            <p>
              Your <b>FREE</b> account is limited to {this.props.accountData.maxRecords} records,{" "}
              {this.sizeLimits(this.props.accountData.maxStorage)} storage, and&nbsp;{this.sizeLimits(this.props.accountData.maxFileSize)} file size.
            </p>
           )}
            <p>Get <b>PREMIUM</b> plan for:</p>
            <ul>
              <li>unlimited records</li>
              <li>{this.sizeLimits(this.props.accountData.upgrade.maxStorage)} of storage space</li>
              <li>{this.sizeLimits(this.props.accountData.upgrade.maxFileSize)} max file size</li>
            </ul>
            <p>for only</p> 
            <div>
              <span style={{fontSize: "36px", fontWeight: 700}}> ${(this.props.accountData.upgrade.price/12).toFixed(2)}</span><b> /month</b>.
            </div>
            <div style={{color: "grey"}}>
              ${this.props.accountData.upgrade.price}.00 billed annualy
            </div>
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
          {false && !this.state.showDiscountInput && (
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
