import React, { Component } from "react";
import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";
import Button from "react-bootstrap/Button";

class InviteDiv extends Component {
  state = {
    errorMsg: "",
    email: "",
  };

  inputOnFocus = () => {
    this.setState({ errorMsg: "" });
  };

  inputOnChange = (event) => {
    this.setState({ email: event.target.value });
  };

  inputOnKeyDown = (event) => {
    if (event.key == "Enter") {
      this.setState({ email: event.target.value });
      this.submitEmail();
    }
  };

  clearInput = () => {
    this.setState({ errorMsg: "", email: "" });
  };

  submitEmail = () => {
    const self = this;
    const email = self.state.email;
    axios
      .post(`${getApiUrl()}iam.php`, {
        verifier: getVerifier(),
        operation: "newuser",
        email,
      })
      .then((result) => {
        if (result.data.status === "Ok") {
          // self.props.onNewMail(email);
          self.setState({ email: "", errorMsg: "" });
          self.props.updatePage();
          return;
        }
        if (result.data.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        self.setState({ errorMsg: result.data.status });
      })
      .catch((error) => {
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  render() {

    let licensed = this.props.licensedUsers ? <><br></br><span> licensed users: {this.props.licensedUsers}</span></> : null;
    let users = <span>users: {this.props.users.length}</span>;

    return (


      <div
        style={{
          background: "#eee",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
          <div style={{display:"none"}}>
            {users}
            {licensed}
          </div>

          <span style={{ color: "red" }}>{this.state.errorMsg}</span>


        <div style={{ display: "flex", alignItems: "center" }}>
          Authorize
          <input
            style={{
              margin: "0 -1.3em 0 0.5em",
              height: "2em",
              width: "20em",
              outline: "none",
            }}
            type="email"
            spellcheck="false"
            placeholder="Email"
            onFocus={this.inputOnFocus}
            onChange={this.inputOnChange}
            onKeyDown={this.inputOnKeyDown}
            value={this.state.email}
          />
          <svg
            onClick={this.clearInput}
            width="15"
            height="15"
            style={{
              fill: "#aaa",
              cursor: "pointer",
            }}
          >
            <use href="#circle-x"></use>
          </svg>
          <Button
            className="btn btn-sm btn-primary"
            style={{ verticalAlign: "top", marginLeft: "2em" }}
            onClick={this.submitEmail}
          >
            Ok
          </Button>
        </div>
      </div>
    );
  }
}

export default InviteDiv;
