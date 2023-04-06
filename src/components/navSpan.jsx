import React, { Component } from "react";
import axios from "axios";
import { getApiUrl, getVerifier, serverLog } from "../lib/utils";
import AccountDropDown from "./accountDropDown";
import ContactUsModal from "./contactUsModal";
import MessageModal from "./messageModal";
import UpgradeModal from "./upgradeModal";
import AccountModal from "./accountModal";
import EmailModal from "./emailModal";
import VerifyEmailModal from "./verifyEmailModal";
import DeleteAccountModal from "./deleteAccountModal";
import DeleteAccountFinalModal from "./deleteAccountFinalModal";

let wrongOrigin = 0;


class NavSpan extends Component {
  state = { showModal: "", accountData: {} };

  init = window.addEventListener(
    "message",
    (event) => {
      console.log('got message');
      console.log(event);

      if(event.origin !== window.location.origin) {
        if(wrongOrigin < 5) {
          // report warning to the server, however harmless in our case
          serverLog(`payment message orign ${event.origin}`)
          wrongOrigin++;
        }
        console.log(`payment message origin ${event.origin}`);
        return;
      }
      if (event.data == "payment_success") {
          this.getAccountData();
      }

      if (event.data == "payment_cancel") {
        serverLog("Payment cancel");

        axios
        .post(`${getApiUrl()}payments/session_cancel.php`, {verifier: getVerifier()})
        .then((reply) => {
          const result = reply.data;
          if (result.status === "Ok") {
            return;
          }
          if (result.status === "login") {
            window.location.href = "expired.php";
            return;
          }
          return;
        })
        .catch((err) => {
          this.setState({ errorMsg: "Server error. Please try again later" });
        });
      }

    },
    false
  );

  searchClear = () => {
    this.props.onSearchChange("");
  };

  onSearchChange = (e) => {
    this.props.onSearchChange(e.target.value);
  };

  getAccountData = (newData) => {
    const self = this;
    const axiosData = newData
      ? newData
      : {
          verifier: getVerifier(),
        };
    axios.post(`${getApiUrl()}account.php`, axiosData).then((reply) => {
      const result = reply.data;
      if (result.status === "Ok") {
        self.setState({ accountData: result });
        return;
      }
      if (result.status === "login") {
        window.location.href = "expired.php";
        return;
      }
    });
  };

  right = 0;

  showAccountDropDown = (e) => {
    e.stopPropagation();
    this.right =
      document.body.getBoundingClientRect().right -
      e.currentTarget.parentElement.getBoundingClientRect().right -
      27;
    if (this.right <= 16) {
      this.right = 16;
    }
    this.setState({ showModal: "AccountDropDown" });
  };

  handleMenuCommand = (cmd) => {
    if (cmd === "Contact us") {
      this.setState({ showModal: "Contact us" });
      return;
    }
    if (cmd === "Account settings") {
      this.setState({ showModal: "Account settings" });
      return;
    }
    if (cmd === "upgrade") {
      this.setState({ showModal: "upgrade" });
      return;
    }
    if (cmd === "Help") {
      window.open("https://passhub.net/doc", "passhub_doc", []);
      return;
    }
    if (cmd === "Iam") {
      this.props.gotoIam();
    }

    this.props.onMenuCommand(cmd);
  };

  render() {
    const inputBackground = this.props.searchString.trim().length
      ? "white"
      : "rgba(255, 255, 255, 0.6)";
    return (
      <React.Fragment>
        {this.props.page === "Main" && (
          <div
            className="d-none d-sm-block"
            style={{
              flexGrow: 1,
              padding: "0 36px 0 40px",
              position: "relative",
            }}
          >
            <input
              className="search_string"
              type="text"
              placeholder="Search.."
              autoComplete="off"
              onChange={this.onSearchChange}
              value={this.props.searchString}
              style={{
                width: "100%",
                background: inputBackground,
                backdropFilter: "blur(40px)",
              }}
            />

            <span className="search_clear" onClick={this.searchClear}>
              <svg width="0.7em" height="0.7em" className="item_icon">
                <use href="#cross"></use>
              </svg>
            </span>
            <span style={{ position: "absolute", left: "55px", top: "8px" }}>
              <svg
                width="24"
                height="24"
                style={{
                  opacity: 0.4,
                  verticalAlign: "text-bottom",
                }}
              >
                <use href="#f-search"></use>
              </svg>
            </span>
          </div>
        )}
        {this.props.page !== "Login" && (
          <React.Fragment>
            <div style={{ display: "flex" }}>
              <div
                onClick={this.showAccountDropDown}
                style={{
                  width: "40px",
                  height: "40px",
                  padding: "7px 0 0 0",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(40px)",
                  overflow: "hidden",
                  cursor: "pointer",
                  flex: "none",
                }}
              >
                <svg width="40" height="34" style={{ opacity: 0.8 }}>
                  <use href="#f-account"></use>
                </svg>
              </div>
              <span
                className="d-none d-sm-inline"
                onClick={this.showAccountDropDown}
                style={{ padding: "8px 0 0 0", cursor: "pointer" }}
              >
                <svg width="24" height="24" fill="white">
                  <use href="#angle"></use>
                </svg>
              </span>
            </div>

            <AccountDropDown
              show={this.state.showModal == "AccountDropDown"}
              right={this.right}
              onClose={() => this.setState({ showModal: "" })}
              onMenuCommand={this.handleMenuCommand}
              getAccountData={this.getAccountData}
              accountData={this.state.accountData}
            />

            <AccountModal
              show={this.state.showModal === "Account settings"}
              accountData={this.state.accountData}
              getAccountData={this.getAccountData}
              onClose={(dummy, next) => {
                this.setState({ showModal: next ? next : "" });
              }}
            ></AccountModal>
            <DeleteAccountModal
              show={this.state.showModal === "delete account"}
              onClose={(dummy, next) => {
                this.setState({ showModal: next ? next : "" });
              }}
            ></DeleteAccountModal>
            <DeleteAccountFinalModal
              show={this.state.showModal === "delete account final"}
              onClose={(dummy, next) => {
                this.setState({ showModal: next ? next : "" });
              }}
            ></DeleteAccountFinalModal>
            <ContactUsModal
              show={this.state.showModal === "Contact us"}
              onClose={(dummy, next) => {
                this.setState({ showModal: next ? next : "" });
              }}
            ></ContactUsModal>
            <MessageModal
              show={this.state.showModal === "success"}
              onClose={() => {
                this.setState({ showModal: "" });
              }}
            >
              Your message has been sent
            </MessageModal>
            <MessageModal
              show={this.state.showModal === "account deleted"}
              onClose={() => {
                this.setState({ showModal: "" });
                window.location.href = "logout.php";
              }}
            >
              Your account has been deleted
            </MessageModal>
            <UpgradeModal
              show={this.state.showModal === "upgrade"}
              onClose={() => {
                this.setState({ showModal: "" });
              }}
            ></UpgradeModal>
            <EmailModal
              show={this.state.showModal === "email"}
              accountData={this.state.accountData}
              onClose={(dummy, next, email) => {
                this.setState({
                  showModal: next ? "verifyEmail" : "",
                  emailToVerify: email,
                });
              }}
            ></EmailModal>
            <VerifyEmailModal
              show={this.state.showModal === "verifyEmail"}
              emailToVerify={this.state.emailToVerify}
              onClose={(dummy, next) => {
                this.setState({ showModal: next ? "Contact us" : "" });
              }}
            ></VerifyEmailModal>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default NavSpan;
