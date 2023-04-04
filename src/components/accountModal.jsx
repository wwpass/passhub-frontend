import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";

import InputField from "./inputField";
import { getVerifier } from "../lib/utils";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

class AccountModal extends Component {
  state = { inactiveTimeout: 15 };

  isShown = false;

  onUpgrade = (e) => {
    this.props.onClose(e, "upgrade");
    /*
    window.open("payments/checkout.php", "passhub_payment");
    this.props.onClose();
    */
  };

  onMailClick = () => {
    if (!this.props.accountData.business) {
      this.props.onClose("dummy", "email");
    }
  };

  onSliderChange = (value) => {
    console.log("Slider ", value);
    // restartIdleTimers(value);
    this.props.getAccountData({
      verifier:  getVerifier(),
      operation: "setInactivityTimeout",
      value: value * 60,
    });
  };

  cancelSubscription = () => {
    this.props.getAccountData({
        verifier: getVerifier(),
        operation: "cancelSubscription",
    });
  }

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

    const accountData = this.props.accountData;

    const marks = { 15: "15 min", 60: "1 hour", 240: "4 hours" };

    let slider_position = 240;
    const { desktop_inactivity } = accountData;
    if (desktop_inactivity) {
      if (desktop_inactivity < 50 * 60) {
        slider_position = 15;
      } else if (desktop_inactivity < 110 * 60) {
        slider_position = 60;
      }
    }

    const showUpgrade =
      accountData.plan &&
      (accountData.plan.toUpperCase() == "FREE");

    let accountType = "";

    if(!accountData.business) {
      if(showUpgrade) {
        accountType = "FREE";
      } else {
        accountType = "PREMIUM"
      } 
    }
     
    let premiumDiv = null;

    if(typeof accountData.expires == "number") {
      let premiumComment = '';
      if(accountData.autorenew) {
            premiumComment = 'Subscription next autorenew date';
        } else {
            premiumComment = 'expires at';
        }
        

        premiumDiv = (
          <div style={{padding: "1em", marginBottom: "1em", borderRadius: "12px", border: "1px solid gray"}}>
            <div>{premiumComment}<br></br>{`${new Date(accountData.expires * 1000)}`}</div>

            {(accountData.autorenew || accountData.receipt_url) &&  (
              <div style={{marginTop: "1em", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "2em;", marginTop: "2em"}}>
                <div>
                  { accountData.receipt_url && (
                    <a href={accountData.receipt_url} style={{color: "#007b40"}} target='_blank'>Your latest payment receipt</a>
                  )}
                </div>
                <div>
                  { accountData.autorenew && (
                    <button className="btn btn-danger" onClick={this.cancelSubscription}>Cancel Subscription</button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
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
          <div className="h2">Account settings</div>
        </div>

        <Modal.Body style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: 32 }}>
            Accout type:{" "}
            <b>{accountType}</b>
          </div>
          { (accountData.plan.toUpperCase() == "PREMIUM") && premiumDiv } 

          <div style={{ margin: "0 0 12px 0" }}>Inactvity timeout</div>
          <div style={{ marginBottom: "64px", padding: "0 32px" }}>
            <Slider
              value={slider_position}
              min={15}
              max={240}
              marks={marks}
              step={null}
              onChange={this.onSliderChange}
              trackStyle={{ background: "#00BC62" }}
              handleStyle={{ borderColor: "#00BC62" }}
            ></Slider>
          </div>
          {accountData.email.length ? (
            <InputField
              label="Email"
              readonly
              value={accountData.email}
              onClick={this.onMailClick}
            >
              {!accountData.business && (
                <div>
                  <span className="iconTitle">Edit</span>
                  <svg
                    width="24"
                    height="24"
                    title="Edt"
                    style={{ opacity: "0.5", stroke: "black", fill: "none" }}
                  >
                    <use href="#f-edit"></use>
                  </svg>
                </div>
              )}
            </InputField>
          ) : (
            <div
              className="itemModalField"
              style={{
                marginBottom: 62,
                position: "relative",
                background: "#E6F8EF",
                cursor: "pointer",
              }}
              onClick={this.onMailClick}
            >
              <div
                style={{
                  margin: "12px auto",
                  color: "#009A50",
                  display: "table",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <svg width="24" height="24" style={{ marginRight: "10px" }}>
                    <use href="#f-add"></use>
                  </svg>
                  Add email
                </div>
                <div style={{ fontSize: "14px" }}>
                  an email is needed so that other users can share safes with
                  you, as well as to subscribe to news and updates
                </div>
              </div>
            </div>
          )}
          <div
            onClick={() => {
              this.props.onClose("dummy", "delete account");
            }}
          >
            <div
              style={{
                color: "#B40020",
                marginTop: "32px",
                cursor: "pointer",
              }}
            >
              <svg width="24" height="24" style={{ marginRight: "8px" }}>
                <use href="#f-trash-red"></use>
              </svg>
              Delete Account
            </div>
            <div style={{ color: "rgba(27, 27, 38, 0.7)", fontSize: "14px" }}>
              Once deleted, your records, files, safes and folders cannot be
              recovered
            </div>
          </div>
          {false && (
            <div style={{ marginBottom: "32px" }}>
              <p>
                Your <b>{accountData.plan.toUpperCase()}</b> account
                is limited to 200 records and 100 MB storage.
              </p>
              <p>
                Get <span style={{ fontWeight: "normal" }}>unlimited</span>{" "}
                records and <span style={{ fontWeight: "normal" }}>1GB</span> of
                storage space with <b>PREMIUM</b> plan for only $4 per month
                ($48 per year).
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Close
          </Button>
          {showUpgrade && (
            <Button variant="primary" onClick={this.onUpgrade}>
              Upgrade to Premium
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
}

export default AccountModal;
