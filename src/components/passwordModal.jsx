import React, { Component } from "react";

import axios from "axios";

import * as base32 from "hi-base32";

import * as passhubCrypto from "../lib/crypto";
import {
  isStrongPassword,
  getApiUrl,
  getVerifier,
  getUserData,
  limits,
  atRecordsLimits,
} from "../lib/utils";
import getTOTP from "../lib/totp";
import { copyToClipboard } from "../lib/copyToClipboard";

import ItemModalFieldNav from "./itemModalFieldNav";

import ItemModal from "./itemModal";

// import PlanLimitsReachedModal from "./planLimitsReachedModal";
import UpgradeModal from "./upgradeModal";


import Eye from "./eye";
import GeneratePasswordModal from "./generatePasswordModal";

import PasswordModalUrl from "./passwordModalUrl";

function drawTotpCircle() {
  const sec = new Date().getTime() / 1000;
  const fract = Math.ceil(((sec % 30) * 10) / 3);
  document.querySelectorAll(".totp_circle").forEach((e) => {
    // e.style.background = `conic-gradient(#c4c4c4 ${fract}%, #e7e7ee 0)`;
    e.style.background = `conic-gradient(rgba(27, 27, 38, 0.235) ${fract}%, rgba(27, 27, 38, 0.1) 0)`;
    // e.style.background = `(conic-gradient(red ${fract}%, grey 0)`;
  });
  if (Math.floor(sec % 30) == 0) {
    totpTimerListeners.forEach((f) => f());
  }
}

function startCopiedTimer() {
  setTimeout(() => {
    document
      .querySelectorAll(".copied")
      .forEach((e) => (e.style.display = "none"));
  }, 1000);
}

setInterval(drawTotpCircle, 1000);
let totpTimerListeners = [];

function totpTimerAddListener(f) {
  totpTimerListeners.push(f);
}

function totpTimerRemoveListener(f) {
  totpTimerListeners = totpTimerListeners.filter((e) => e !== f);
}

class PasswordModal extends Component {
  state = {
    edit: false,
    showPassword: false,
    username: "",
    password: "",
    url: "",
    secondaryUrl: "",
    forceTotp: false,
    totpSecret: "",
    showModal: "",
    errorMsg: "",
    unamePwdWarning: "",
    urlWarning: "",
    totpWarning: "",
  };

  timerEvent = () => {
    this.showOTP();
  };

  componentDidMount = () => {
    totpTimerAddListener(this.timerEvent);
  };

  componentWillUnmount = () => {
    totpTimerRemoveListener(this.timerEvent);
  };

  isShown = false;

  showPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  onEdit = () => {
    this.setState({ edit: true, forceTotp: false });
    // this.props.onClose();
    // this.props.args.showItemPane(this.props.args);
  };

  onUsernameChange = (e) => {
    let unamePwdWarning = "";
    const maxLength = limits.MAX_USERNAME_LENGTH;
    let newValue = e.target.value;

    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
      unamePwdWarning = `Username max length is ${maxLength} chars, truncated`;
    }
    this.setState({
      username: newValue,
      unamePwdWarning,
    });
  };

  onPasswordChange = (e) => {
    let unamePwdWarning = "";
    const maxLength = limits.MAX_PASSWORD_LENGTH;
    let newValue = e.target.value;

    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
      unamePwdWarning = `Password length is ${maxLength} chars, truncated`;
    }
    this.setState({
      password: newValue,
      unamePwdWarning,
    });
  };

  onTotpSecretChange = (e) => {
    let totpWarning = "";
    const maxLength = limits.MAX_TOTP_LENGTH;
    let newValue = e.target.value;

    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
      // totpWarning = `OTP length is ${maxLength} chars, truncated`;   // I'll do it later...
    }

    this.setState({ totpSecret: newValue.toUpperCase(), totpWarning });
  };

  onUrlChange = (e) => {
    let urlWarning = "";
    const maxLength = limits.MAX_URL_LENGTH;
    let newValue = e.target.value;

    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
      urlWarning = `URL length is ${maxLength} chars, truncated`;
    }
    this.setState({
      url: newValue,
      urlWarning,
    });
  };

  onSecondaryUrlChange = (e) => {
    let urlWarning = "";
    const maxLength = limits.MAX_URL_LENGTH;
    let newValue = e.target.value;

    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
      urlWarning = `URL length is ${maxLength} chars, truncated`;
    }
    this.setState({
      secondaryUrl: newValue,
      urlWarning,
    });
  };

  onClose = () => {
    this.props.onClose();
  };

  onSubmit = (title, note) => {

    let url = this.state.url;
    let secondaryUrl = this.state.secondaryUrl.trim();

    if(secondaryUrl.length) {
      url = [url, secondaryUrl].join('\x01');
    }

    const pData = [
      title,
      this.state.username,
      this.state.password,
      url,
      note,
    ];
    const totpSecret = this.state.totpSecret
      .replace(/-/g, "")
      .replace(/ /g, "");

    if (totpSecret.length > 0) {
      pData.push(totpSecret);
    }

    const options = {};

    const safe = this.props.args.safe;

    const aesKey = safe.bstringKey;
    const SafeID = safe.id;

    let folderID = 0;
    if (this.props.args.item) {
      folderID = this.props.args.item.folder;
    } else if (this.props.args.folder.safe) {
      folderID = this.props.args.folder.id;
    }

    /*
    const folder = this.props.args.folder;
    const [aesKey, SafeID, folderID] = folder.safe
      ? [folder.safe.bstringKey, folder.safe.id, folder.id]
      : [folder.bstringKey, folder.id, 0];
*/
    const eData = passhubCrypto.encryptItem(pData, aesKey, options);
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

  showOTP = () => {
    if (
      this.props.edit ||
      !this.props.show ||
      !this.props.args.item ||
      this.props.args.item.cleartext.length < 6
    ) {
      return;
    }

    const secret = this.props.args.item.cleartext[5];
    if (secret.length > 0) {
      const s = secret.replace(/\s/g, "").toUpperCase();
      try {
        const secretBytes = new Uint8Array(base32.decode.asBytes(s));

        window.crypto.subtle
          .importKey(
            "raw",
            secretBytes,
            { name: "HMAC", hash: { name: "SHA-1" } },
            false,
            ["sign"]
          )
          .then((key) => getTOTP(key))
          .then((six) => {
            document
              .querySelectorAll(".totp_digits")
              .forEach((e) => (e.innerText = six));
          });
      } catch (err) {
        document
          .querySelectorAll(".totp_digits")
          .forEach((e) => (e.innerText = "invalid TOTP secret"));
      }
    }
  };

  copyToClipboard = (text) => {
    if (!this.state.edit) {
      copyToClipboard(text);
    }
  };

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    if (typeof this.props.args.item == "undefined") {
      if (atRecordsLimits()) {

        return (
          <UpgradeModal
            show={this.props.show}
            accountData={getUserData()}
            onClose={this.props.onClose}
          ></UpgradeModal>
        );

/*        
        return (
          <PlanLimitsReachedModal
            show={this.props.show}
            onClose={this.props.onClose}
          ></PlanLimitsReachedModal>
        );
*/        
      }
    }

    let urls = this.props.args.item.cleartext[3].trim().split('\x01');
    let url = urls[0];
    let secondaryUrl = ""; 
    if(urls.length > 1) {
      secondaryUrl = urls[1]
    }
  

    if (!this.isShown) {
      this.isShown = true;
      this.state.errorMsg = "";
      this.state.unamePwdWarning = "";
      this.state.urlWarning = "";
      this.state.totplWarning = "";

      this.state.showPassword = false;
      if (this.props.args.item) {
        this.state.username = this.props.args.item.cleartext[1];
        this.state.password = this.props.args.item.cleartext[2];
        this.state.url = url;
        this.state.secondaryUrl = secondaryUrl;
        this.state.edit = false;
        this.state.totpSecret =
          this.props.args.item.cleartext.length > 5
            ? this.props.args.item.cleartext[5].toUpperCase()
            : "";
      } else {
        this.state.username = "";
        this.state.password = "";
        this.state.url = "";
        this.state.secondaryUrl = "";
        this.state.totpSecret = "";
        this.state.edit = true;
      }
    }

    let passwordType = this.state.showPassword ? "text" : "password";

    /*
    const path = this.props.args.folder
      ? this.props.args.folder.path.join(" > ")
      : [];
    */

    const { strongPassword, reason } = isStrongPassword(this.state.password);

    const passwordStrength = strongPassword ? (
      <span className="colored" style={{ opacity: "1" }}>
        <span style={{ margin: "0 .3em" }}>&#183;</span>
        Strong
      </span>
    ) : (
      <span style={{ color: "#EB6500", opacity: "1" }}>
        <span style={{ margin: "0 .3em" }}>&#183;</span>
        Weak: {reason}
      </span>
    );

    const passwordBackground =
      !this.state.edit && this.state.password.length && !strongPassword
        ? "weakPassword"
        : "";

    if (
      this.props.args.item &&
      this.props.args.item.cleartext[5] &&
      !this.state.edit
    ) {
      this.showOTP();
    }

    let totp = "";

    if (!this.state.edit) {
      if (this.props.args.item && this.props.args.item.cleartext.length > 5) {
        totp = (
          <div
            className="itemModalField"
            style={{ marginBottom: 32, position: "relative" }}
            onClick={() => {
              this.copyToClipboard(
                document.querySelector(".totp_digits").innerText
              );
              document.querySelector("#totp_copied").style.display = "flex";
              startCopiedTimer();
            }}
          >
            <ItemModalFieldNav
              margin27
              copy={!this.state.edit}
              name="Google authenticator"
            />
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="totp_circle"></div>
              <div className="totp_digits"></div>
            </div>
            <div className="copied green70" id="totp_copied">
              <div style={{ margin: "0 auto" }}>Copied &#10003;</div>
            </div>
          </div>
        );
      }
    } else {
      if (
        (this.props.args.item && this.props.args.item.cleartext.length > 5) ||
        this.state.forceTotp
      ) {
        totp = (
          <React.Fragment>
            <div
              className="itemModalField"
              style={{ marginBottom: 32 }}
              onClick={() => {
                if (!this.state.edit) {
                  this.copyToClipboard(
                    document.querySelector(".totp_digits").innerText
                  );
                }
              }}
            >
              {this.state.totpSecret.length > 0 ? (
                <ItemModalFieldNav
                  copy={!this.state.edit}
                  name="Google authenticator secret"
                />
              ) : (
                ""
              )}
              <input
                onChange={this.onTotpSecretChange}
                spellCheck={false}
                value={this.state.totpSecret}
                placeholder="Google authenticator secret"
              ></input>
            </div>
            {this.state.unamePwdWarning &&
              this.state.unamePwdWarning.length > 0 && (
                <div style={{ color: "red" }}>{this.state.unamePwdWarning}</div>
              )}
          </React.Fragment>
        );
      } else {
        totp = (
          <div
            className="itemModalPlusField"
            onClick={() => this.setState({ forceTotp: true })}
          >
            <svg width="24" height="24" fill="none">
              <use href="#f-add"></use>
            </svg>
            Add Google Authenticator
          </div>
        );
      }
    }

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
          className="itemModalField upper"
          style={{ position: "relative" }}
          onClick={() => {
            if (!this.state.edit) {
              this.copyToClipboard(this.state.username);
              document.querySelector("#username_copied").style.display = "flex";
              startCopiedTimer();
            }
          }}
        >
          <ItemModalFieldNav
            copy={!this.state.edit}
            margin27
            name="Username"
            htmlFor="username"
          />
          <div>
            <input
              id="username"
              className="lp"
              onChange={this.onUsernameChange}
              readOnly={!this.state.edit}
              spellCheck={false}
              value={this.state.username}
            ></input>
          </div>
          <div className="copied" id="username_copied">
            <div>Copied &#10003;</div>
          </div>
        </div>

        <div
          className={`itemModalField lower ${passwordBackground}`}
          style={{
            position: "relative",
            display: "flex",
            marginBottom: this.state.edit ? 0 : 32,
          }}
        >
          <div
            style={{ flexGrow: 1 }}
            onClick={() => {
              if (!this.state.edit) {
                this.copyToClipboard(this.state.password);
                document.querySelector("#password_copied").style.display =
                  "flex";
                startCopiedTimer();
              }
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: "14px" }}>
                <label htmlFor="password">
                  <span style={{ color: "#1b1b26", opacity: "0.7" }}>
                    Password
                  </span>
                  {this.state.password.length ? passwordStrength : ""}
                </label>
              </div>
              {!this.state.edit && (
                <div>
                  <span className="iconTitle">Copy</span>
                  <svg width="24" height="24" fill="none" stroke="#1b1b26">
                    <use href="#f-copy"></use>
                  </svg>
                </div>
              )}
            </div>
            <div>
              <input
                className="lp"
                id="password"
                type={passwordType}
                onChange={this.onPasswordChange}
                readOnly={!this.state.edit}
                spellCheck={false}
                value={this.state.password}
              ></input>
            </div>
            <div className="copied green70" id="password_copied">
              <div style={{ margin: "0 auto" }}>Copied &#10003;</div>
            </div>
          </div>
          <Eye onClick={this.showPassword} hide={!this.state.showPassword} />
        </div>

        {this.state.unamePwdWarning &&
          this.state.unamePwdWarning.length > 0 && (
            <div style={{ color: "red" }}>{this.state.unamePwdWarning}</div>
          )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {this.state.edit ? (
            <div
              className="green70"
              onClick={() =>
                this.setState({ showModal: "GeneratePasswordModal" })
              }
              style={{
                margin: "8px 0 16px",
                padding: "8px 0 15px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <svg width="24" height="24" fill="none">
                <use href="#f-shieldShevron"></use>
              </svg>
              <span
                style={{
                  marginLeft: "6px",
                  display: "inline-block",
                }}
              >
                Generate password
              </span>
            </div>
          ) : (
            <div></div>
          )}

          <div
            className="green70"
            onClick={this.showPassword}
            style={{
              textAlign: "right",
              margin: "8px 0 16px",
              padding: "8px 0 15px",
              fontSize: "14px",
              cursor: "pointer",
              display: "none",
            }}
          >
            <svg width="21" height="21" fill="none">
              <use href="#f-eye"></use>
            </svg>
            <span
              style={{
                marginLeft: "6px",
                width: "6.5rem",
                display: "inline-block",
              }}
            >
              {this.state.showPassword ? "Hide" : "Show"} Password
            </span>
          </div>
        </div>

        <PasswordModalUrl 
            item={this.props.args.item} 
            edit={this.state.edit} 
            url={this.state.url} 
            secondaryUrl = {this.state.secondaryUrl}
            onUrlChange = {this.onUrlChange}
            onSecondaryUrlChange = {this.onSecondaryUrlChange}
            showSecondaryUrl = {true}
          ></PasswordModalUrl>

        {this.state.urlWarning && this.state.urlWarning.length > 0 && (
          <div style={{ color: "red" }}>{this.state.urlWarning}</div>
        )}

        {totp}

        <GeneratePasswordModal
          show={this.state.showModal == "GeneratePasswordModal"}
          onClose={(dummy, newPassword) => {
            this.setState({ showModal: "" });
            if (newPassword) {
              this.setState({ password: newPassword });
            }
          }}
        ></GeneratePasswordModal>
      </ItemModal>
    );
  }
}

export default PasswordModal;





/*  now in PasswordModalUrl:

        <div
          className="itemModalField"
          style={{ display: "flex", position: "relative", marginBottom: 32 }}
        >
          <div
            style={{ flexGrow: 1, overflow: "hidden" }}
            onClick={
              !this.state.edit &&
              this.props.args.item &&
              this.props.args.item.cleartext[3].length > 0
                ? () => openInExtension(this.props.args.item)
                : () => {}
            }
          >
            <ItemModalFieldNav
              gotowebsite={!this.state.edit && this.state.url.length > 0}
              name="Website Address"
              htmlFor="websiteaddress"
            />
            {this.state.edit ? (
              <div>
                <input
                  id="websiteaddress"
                  onChange={this.onUrlChange}
                  spellCheck={false}
                  value={this.state.url}
                ></input>
              </div>
            ) : (
              <div
                className="url-span"
                style={{ overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {this.state.url}
              </div>
            )}

            <div className="copied green70" id="url_copied">
              <div style={{ margin: "0 auto" }}>Copied &#10003;</div>
            </div>
          </div>

          {!this.state.edit && this.state.url.length > 0 && (
            <div
              style={{
                display: "flex",
                cursor: "pointer",
                justifyContent: "center",
                marginLeft: "12px",
                paddingLeft: "12px",
              }}
              title="Copy URL"
              onClick={() => {
                this.copyToClipboard(this.state.url);
                document.querySelector("#url_copied").style.display = "flex";
                startCopiedTimer();
              }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#1b1b26"
                title="Copy"
              >
                <use href="#f-copy"></use>
              </svg>
            </div>
          )}
        </div>

            */
