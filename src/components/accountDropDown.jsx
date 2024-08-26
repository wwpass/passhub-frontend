import React, { Component } from "react";

import * as utils from "../lib/utils";

function perCent(part, all) {
  if (part == 0) {
    return 0;
  }

  let result = Math.floor((part * 100) / all);
  if (result < 2) {
    return 2;
  }
  if (result > 100) {
    return 100;
  }
  return result;
}

class AccountDropDown extends Component {
  isShown = false;

  handleButtonClick = (e) => {
    //console.log("button click");
    this.props.onClose();
  };

  handleBodyClick = (e) => {
    e.stopPropagation();
    //console.log("body click");
  };

  handleOuterClick = () => {
    //console.log("outer click");
    this.props.onClose();
  };

  handleLogout = () => {
    window.location = "logout.php";
  };

  handleMenuCommand = (e, cmd) => {
    e.stopPropagation();
    this.props.onClose();
    this.props.onMenuCommand(cmd);
  };

  onUpgrade = () => {
    /*
    window.open("payments/checkout.php", "passhub_payment");
    this.props.onClose();
    */
    this.props.onMenuCommand("upgrade");
  };
  componentDidMount = () => {
    //this.props.getAccountData();
    //console.log("account dropdown  mounted");
  };

  accountLoaded = false;
  componentDidUpdate = () => {
    if (!this.accountLoaded && this.props.show) {
      this.accountLoaded = true;
      this.props.getAccountData();
    }
    //console.log("account dropdown updated");
  };

  componentWillUnmount = () => {
    //console.log("account dropdown will unmount");
  };

  render() {
    const accountData = this.props.accountData;

    if (!this.props.show) {
      this.isShown = false;
      return null;
    }
    if (!this.isShown) {
      this.isShown = true;
      this.props.getAccountData();
    }

    const modalClasses = this.props.show ? "pmodal" : "pmodal d-none";
    const storage = (
      <b>
        {utils.humanReadableFileSize(accountData.used ? accountData.used : 0)}
      </b>
    );
    const records = <b>{accountData.records ? accountData.records : 0}</b>;

    return (
      <div className={modalClasses} onClick={this.handleOuterClick}>
        <div
          className="pmodal-body account"
          onClick={this.handleBodyClick}
          style={{ right: this.props.right }}
        >
          <div style={{ marginBottom: "16px" }}>
            {accountData.email && <div>{accountData.email}</div>}
            {('upgrade' in accountData) && (
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "24px",
                  color: "#979797",
                }}
              >
                Free account{" "}
                <a className="link" href="#" onClick={this.onUpgrade}>
                  Upgrade
                </a>
              </div>
            )}
          </div>

          {accountData.maxRecords ? (
            <div style={{ marginBottom: "18px" }}>
              {records} of {accountData.maxRecords} records
              <div
                style={{
                  height: "4px",
                  background: "#E7E7EE",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    height: "4px",
                    width: `${perCent(
                      accountData.records,
                      accountData.maxRecords
                    )}%`,
                    background: "#00BC62",
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "18px" }}>{records} records</div>
          )}

          {accountData.maxStorage ? (
            <div style={{ marginBottom: "24px" }}>
              {storage} of {utils.humanReadableFileSize(accountData.maxStorage)}
              <div
                style={{
                  height: "4px",
                  background: "#E7E7EE",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    height: "4px",
                    width: `${perCent(
                      accountData.used,
                      accountData.maxStorage
                    )}%`,
                    background: "#00BC62",
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "24px" }}>{storage}</div>
          )}

          {('upgrade' in accountData) && (
            <div>
              <button
                className="btn btn-primary upgrade-button"
                onClick={this.onUpgrade}
              >
                Get more
              </button>
            </div>
          )}

          <div
            className="account-menu-item"
            onClick={(e) => this.handleMenuCommand(e, "Account settings")}
          >
            <svg width="24" height="24">
              <use href="#f-nut"></use>
            </svg>
            Account settings
          </div>

          <div
            className="account-menu-item"
            onClick={(e) => {
              this.handleMenuCommand(e, "Help");
            }}
          >
            <svg width="24" height="24">
              <use href="#f-lightbulb"></use>
            </svg>
            How it works (Help)
          </div>

          <div
            className="account-menu-item"
            onClick={(e) => this.handleMenuCommand(e, "Export")}
          >
            <svg width="24" height="24">
              <use href="#f-upload"></use>
            </svg>
            Export
          </div>
          <div
            className="account-menu-item"
            onClick={(e) => this.handleMenuCommand(e, "Import")}
          >
            <svg width="24" height="24">
              <use href="#f-download"></use>
            </svg>
            Import
          </div>

          {accountData.site_admin ? (
            <div
              className="account-menu-item"
              onClick={(e) => {
                this.handleMenuCommand(e, "Iam");
              }}
            >
              <svg width="24" height="24" stroke="#5F5F67">
                <use href="#i-wrench"></use>
              </svg>
              Users
            </div>
          ) : (
            <div
              className="account-menu-item"
              onClick={(e) => this.handleMenuCommand(e, "Contact us")}
            >
              <svg width="24" height="24">
                <use href="#f-chatCircleText"></use>
              </svg>
              Contact us
            </div>
          )}
          <div
            className="account-menu-item"
            style={{
              color: "#B40020",
            }}
            onClick={this.handleLogout}
          >
            <svg width="24" height="24">
              <use href="#f-signout"></use>
            </svg>
            Log out
          </div>
        </div>
      </div>
    );
  }
}

export default AccountDropDown;
