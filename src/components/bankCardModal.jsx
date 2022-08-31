import React, { Component } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import axios from "axios";

import * as passhubCrypto from "../lib/crypto";
import { copyToClipboard, startCopiedTimer } from "../lib/copyToClipboard";
import { getApiUrl, getVerifier, atRecordsLimits } from "../lib/utils";
import ItemModalFieldNav from "./itemModalFieldNav";
import Eye from "./eye";

import ItemModal from "./itemModal";
import PlanLimitsReachedModal from "./planLimitsReachedModal";
import { ButtonGroup } from "react-bootstrap";
import { findRenderedDOMComponentWithClass } from "react-dom/cjs/react-dom-test-utils.production.min";

const maxCardholderNameLength = 40; // ISO IEC 7813: 2 - 26 actually including spaces

const monthNumbers = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

function luhnLength(number) {
  if (number.charAt(0) === "4") {
    // visa
    return 16;
  }

  const d2 = parseInt(number.substring(0, 2));

  if (d2 == 34 || d2 == 37) {
    //amex
    return 15;
  }

  if (d2 >= 51 && d2 <= 55) {
    //mastercard (Diners Club US, Can 54, 55 )
    return 16;
  }

  const d4 = parseInt(number.substring(0, 4));
  if (d4 >= 2200 && d4 <= 2204) {
    //mir
    return 16;
  }

  if (d4 >= 2221 && d4 <= 2720) {
    //mastercard
    return 16;
  }

  return 19;
}

const twentyYears = [];
let thisYear = new Date();
thisYear = thisYear.getFullYear();
for (let i = 0; i < 20; i++) {
  twentyYears.push(thisYear + i);
}

const two = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

// https://gist.github.com/DiegoSalazar/4075533

function isValidCardNumber(aNumber) {
  // Accept only digits, dashes or spaces

  if (/[^0-9-\s]+/.test(aNumber)) return false;
  const value = aNumber.replace(/\D/g, "");
  if (value.length < 8 || value.length > 19) {
    return false;
  }

  const ll = luhnLength(value);
  if (ll > 0 && value.length != ll) {
    return false;
  }

  let sum = 0,
    even = false;

  for (let n = value.length - 1; n >= 0; n--) {
    let c = value.charAt(n),
      ci = "0123456789".indexOf(c);
    sum += even ? two[ci] : ci;
    even = !even;
  }

  return sum % 10 == 0;
}

class BankCardModal extends Component {
  state = {
    edit: false,
    ccNumber: "",
    ccName: "",
    ccExpMonth: "",
    ccExpYear: "",
    ccCSC: "",
    errorMsg: "",
    hideCSC: true,
    hideCardNumber: true,
  };

  isShown = false;

  onEdit = () => {
    this.setState({ edit: true });
  };

  onClose = () => {
    this.props.onClose();
  };

  toggleCSC = () => {
    this.setState({ hideCSC: !this.state.hideCSC });
  };

  toggleCardNumber = () => {
    this.setState({ hideCardNumber: !this.state.hideCardNumber });
  };

  onSubmit = (title, note) => {
    const pData = [
      "card",
      title,
      note,
      this.state.ccNumber,
      this.state.ccName,
      this.state.ccExpMonth,
      this.state.ccExpYear,
      this.state.ccCSC,
    ];

    const safe = this.props.args.safe;

    const aesKey = safe.bstringKey;
    const SafeID = safe.id;

    let folderID = 0;
    if (this.props.args.item) {
      folderID = this.props.args.item.folder;
    } else if (this.props.args.folder.safe) {
      folderID = this.props.args.folder.id;
    }
    const eData = passhubCrypto.encryptItem(pData, aesKey, { version: 5 });
    const data = {
      verifier: getVerifier(),
      vault: SafeID,
      folder: folderID,
      encrypted_data: eData,
    };
    if (this.props.args.item) {
      data.entryID = this.props.args.item._id;
    }
    axios
      .post(`${getApiUrl()}items.php`, data)
      .then((reply) => {
        const result = reply.data;
        if (result.status === "Ok") {
          this.props.onClose(true);
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

  copyToClipboard = (text) => {
    if (!this.state.edit) {
      copyToClipboard(text);
    }
  };

  onCscChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    value = value.substring(0, 4);
    this.setState({ ccCSC: value, errorMsg: "" });
  };

  onNumberChange = (e) => {
    let value = e.target.value;

    value = value.replace(/\D/g, "");

    const numLength = luhnLength(value);
    value = value.substring(0, numLength);
    if (numLength == 15) {
      //amex
      if (value.length > 10) {
        value = value.substring(0, 10) + " " + value.substring(10);
      }
      if (value.length > 4) {
        value = value.substring(0, 4) + " " + value.substring(4);
      }
    } else {
      const quads = Math.floor((value.length - 1) / 4);
      for (let position = quads * 4; position > 0; position -= 4) {
        value = value.substring(0, position) + " " + value.substring(position);
      }
    }

    this.setState({ ccNumber: value, errorMsg: "" });
  };
  onNameChange = (e) => {
    const value = e.target.value.substring(0, maxCardholderNameLength);
    this.setState({ ccName: value, errorMsg: "" });
  };
  onMonthSelect = (key) => this.setState({ ccExpMonth: key, errorMsg: "" });
  onYearSelect = (key) => this.setState({ ccExpYear: key, errorMsg: "" });

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    if (typeof this.props.args.item == "undefined") {
      if (atRecordsLimits()) {
        return (
          <PlanLimitsReachedModal
            show={this.props.show}
            onClose={this.props.onClose}
          ></PlanLimitsReachedModal>
        );
      }
    }

    if (!this.isShown) {
      this.isShown = true;
      this.state.errorMsg = "";
      this.state.hideCSC = true;
      this.state.hideCardNumber = true;

      this.state.showPassword = false;
      if (this.props.args.item) {
        this.state.ccNumber = this.props.args.item.cleartext[3];
        this.state.ccName = this.props.args.item.cleartext[4];
        this.state.ccExpMonth = this.props.args.item.cleartext[5];
        this.state.ccExpYear = this.props.args.item.cleartext[6];
        this.state.ccCSC = this.props.args.item.cleartext[7];
        this.state.edit = false;
      } else {
        this.state.ccNumber = "";
        this.state.ccName = "";
        this.state.ccExpMonth = "";
        this.state.ccExpYear = "";
        this.state.ccCSC = "";
        this.state.edit = true;
      }
    }

    let expDate = "";
    if (this.state.ccExpMonth !== "" && this.state.ccExpYear !== "") {
      expDate = `${this.state.ccExpMonth}/${this.state.ccExpYear.substring(2)}`;
    }
    /*
    const path = this.props.args.folder
      ? this.props.args.folder.path.join(" > ")
      : [];
*/
    return (
      <ItemModal
        show={this.props.show}
        args={this.props.args}
        onClose={this.props.onClose}
        onCloseSetFolder={this.props.onCloseSetFolder}
        onEdit={this.onEdit}
        onSubmit={this.onSubmit}
        errorMsg={this.state.errorMsg}
      >
        <div
          className="itemModalField"
          style={{
            marginBottom: 32,
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{ flexGrow: 1 }}
            onClick={() => {
              if (!this.state.edit) {
                const cc_number = this.state.ccNumber.replace(/\D/g, "");
                this.copyToClipboard(cc_number);
                document.querySelector("#ccnumber_copied").style.display =
                  "flex";
                startCopiedTimer();
              }
            }}
          >
            <ItemModalFieldNav
              copy={!this.state.edit}
              name="Card number"
              htmlFor="cc-number"
            />
            <div>
              <input
                id="cc-number"
                onChange={this.onNumberChange}
                readOnly={!this.state.edit}
                spellCheck={false}
                value={this.state.ccNumber}
                placeholder={this.state.edit ? "0000 0000 0000 0000" : ""}
              ></input>
              <div className="copied" id="ccnumber_copied">
                <div>Copied &#10003;</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-exp-csc">
          <div
            className="itemModalField"
            style={{
              marginBottom: 32,
              display: "flex",
              justifyContent: "space-between",
              overflow: "visible",
              width: "100%",
            }}
          >
            <div className="date-selector">
              <ItemModalFieldNav name="Expiration date" />
              {this.state.edit ? (
                <ButtonGroup>
                  <DropdownButton
                    variant="outline-secondary"
                    size="sm"
                    id="expMonth"
                    title={
                      this.state.ccExpMonth === ""
                        ? "Month"
                        : this.state.ccExpMonth
                    }
                    onSelect={this.onMonthSelect}
                  >
                    {[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                    ].map((m) => (
                      <Dropdown.Item eventKey={m}>{m}</Dropdown.Item>
                    ))}
                  </DropdownButton>

                  <DropdownButton
                    variant="outline-secondary"
                    size="sm"
                    id="expYear"
                    title={
                      this.state.ccExpYear === ""
                        ? "Year"
                        : this.state.ccExpYear
                    }
                    onSelect={this.onYearSelect}
                  >
                    {twentyYears.map((y) => (
                      <Dropdown.Item eventKey={y}>{y}</Dropdown.Item>
                    ))}
                  </DropdownButton>
                </ButtonGroup>
              ) : (
                expDate
              )}
            </div>
          </div>
          <div
            className="itemModalField"
            style={{
              marginBottom: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              position: "relative",
            }}
          >
            <div
              style={{ flexGrow: 1 }}
              onClick={() => {
                if (!this.state.edit) {
                  this.copyToClipboard(this.state.ccCSC);
                  document.querySelector("#cccsc_copied").style.display =
                    "flex";
                  startCopiedTimer();
                }
              }}
            >
              <ItemModalFieldNav
                name="Security code"
                htmlFor="cc-csc"
                copy={!this.state.edit}
              />
              <div style={{ display: "flex" }}>
                <input
                  id="cc-csc"
                  type={this.state.hideCSC ? "password" : "text"}
                  placeholder={this.state.edit ? "000" : ""}
                  readOnly={!this.state.edit}
                  onChange={this.onCscChange}
                  spellCheck={false}
                  value={this.state.ccCSC}
                ></input>
                <div className="copied" id="cccsc_copied">
                  <div>Copied &#10003;</div>
                </div>
              </div>
            </div>
            <Eye onClick={this.toggleCSC} hide={this.state.hideCSC} />
          </div>
        </div>

        <div
          className="itemModalField"
          style={{ marginBottom: 32, position: "relative" }}
          onClick={() => {
            if (!this.state.edit) {
              this.copyToClipboard(this.state.ccName);
              document.querySelector("#ccname_copied").style.display = "flex";
              startCopiedTimer();
            }
          }}
        >
          <ItemModalFieldNav
            copy={!this.state.edit}
            name="Name on card"
            htmlFor="cc-name"
          />
          <div>
            <input
              id="cc-name"
              onChange={this.onNameChange}
              readOnly={!this.state.edit}
              spellCheck={false}
              value={this.state.ccName}
            ></input>
            <div className="copied" id="ccname_copied">
              <div>Copied &#10003;</div>
            </div>
          </div>
        </div>
      </ItemModal>
    );
  }
}

export default BankCardModal;
