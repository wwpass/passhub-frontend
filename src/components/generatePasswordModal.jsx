import React, { Component } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalCross from "./modalCross";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import CheckBox from "./checkBox";

import {
  getApiUrl,
  getVerifier,
} from "../lib/utils";

import generatePassword from "password-generator";

class GeneratePasswordModal extends Component {
  state = {
    passwordLength: 12,
    uppercase: true,
    lowercase: true,
    digits: true,
    specialChars: false,
    redoCount: 0,
  };

  isShown = false;
  password = "";

  onShow() {
    document.querySelector(".z-index-2040 + .modal").style["z-index"] = 2050;
  }

  onSubmit = () => {
    // this.updatePreferences();
    this.props.onClose("dummy", this.password);
  };

  onSliderChange = (value) => {
    this.setState({ passwordLength: value });
  };

  updatePreferences = () => {
    const {passwordLength, uppercase, lowercase, digits, specialChars} = this.state;
    axios
    .post(`${getApiUrl()}account.php`, {
      operation: "generator",
      verifier: getVerifier(),
      value: {passwordLength, uppercase, lowercase, digits, specialChars}
    })    
  }

  genPassword = () => {
    const len = this.state.passwordLength;
    if (len < 4) {
      len = 4;
    }
    const m = false; // $("#memorable").is(':checked');
    if (m) {
      return generatePassword(len, m);
    }

    let pattern = "";
    if (this.state.digits) {
      if (this.state.uppercase || this.state.lowercase) {
        pattern += "2-9";
      } else {
        pattern += "0-9";
      }
    }
    if (this.state.specialChars) {
      pattern += "!#$%&()*+:?@^{}";
    }
    if (this.state.lowercase) {
      pattern += "a-kmp-z";
    }
    if (this.state.uppercase) {
      pattern += "A-HJ-MPZ";
    }
    if (pattern == "") {
      pattern = "A-HJ-MPZa-kmp-z";
    }
    pattern = "[" + pattern + "]";
    let p = generatePassword(len, m, pattern);
    for (let i = 0; i < 100; i++) {
      let redo = false;
      if (this.state.digits) {
        if (!p.match(/[0-9]/)) {
          redo = true;
        }
      } else if (this.state.uppercase) {
        if (!p.match(/[A-HJ-MPZ]/)) {
          redo = true;
        }
      } else if (this.state.lowercase) {
        if (!p.match(/[a-kmp-z]/)) {
          redo = true;
        }
      }
      if (!redo) {
        break;
      }
      p = generatePassword(len, m, pattern);
    }
    return p;
  };

  render() {
    if (this.props.show) {
      this.password = this.genPassword();
      if (!this.isShown) {
        this.isShown = true;
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
        dialogClassName1="z-index-2050"
        backdropClassName="z-index-2040"
        contentClassName="z-index-2050"
        centered
      >
        <ModalCross onClose={this.props.onClose}></ModalCross>
        <div className="modalTitle">
          <div className="h2">Password generator</div>
        </div>

        <Modal.Body className="edit mb32">
          <div
            style={{
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <input
              style={{
                border: "none",
                borderBottom: "1px solid #dee2e6",
                flexGrow: 1,
                marginRight: "1em",
                outline: "none",
              }}
              value={this.password}
              readonly
              spellCheck={false}
            />
            <svg
              width="64"
              height="40"
              fill="none"
              onClick={() =>
                this.setState({ redoCount: this.state.redoCount++ })
              }
            >
              <use href="#f-arrow-clockwise"></use>
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ marginRight: "1em" }}>Length:</div>
            <Slider
              value={this.state.passwordLength}
              step={1}
              min={6}
              max={32}
              onChange={this.onSliderChange}
              trackStyle={{ background: "#00BC62" }}
              handleStyle={{ borderColor: "#00BC62" }}
            ></Slider>
            <div style={{ marginLeft: "1em" }}>{this.state.passwordLength}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <CheckBox
              checked={this.state.uppercase}
              onClick={() =>
                this.setState({ uppercase: !this.state.uppercase })
              }
            >
              Uppercase
            </CheckBox>
            <CheckBox
              checked={this.state.digits}
              onClick={() => this.setState({ digits: !this.state.digits })}
            >
              Digits
            </CheckBox>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <CheckBox
              checked={this.state.lowercase}
              onClick={() =>
                this.setState({ lowercase: !this.state.lowercase })
              }
            >
              Lowercase
            </CheckBox>
            <CheckBox
              checked={this.state.specialChars}
              onClick={() =>
                this.setState({ specialChars: !this.state.specialChars })
              }
            >
              Special characters
            </CheckBox>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={this.onSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default GeneratePasswordModal;
