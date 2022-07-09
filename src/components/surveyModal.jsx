import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import ModalCross from "./modalCross";

import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";

import InputField from "./inputField";
import TextAreaField from "./textAreaField";

import progress from "../lib/progress";

class SurveyModal extends Component {
  state = {
    strength: "",
    weakness: "",
    other: "",
    email: "",
    errorMsg: "",
    addDesktop: false,
    addMobile: false,
    addCardFF: false,
  };

  isShown = false;

  onStrengthChange = (e) => {
    this.setState({ strength: e.target.value, errorMsg: "" });
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  onWeaknessChange = (e) => {
    this.setState({ weakness: e.target.value, errorMsg: "" });
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  onOtherChange = (e) => {
    this.setState({ other: e.target.value, errorMsg: "" });
  };

  onEmailChange = (e) => {
    this.setState({ email: e.target.value, errorMsg: "" });
  };

  handleAddDesktop = (e) => {
    this.setState({ addDesktop: e.target.checked });
  };

  handleAddMobile = (e) => {
    this.setState({ addMobile: e.target.checked });
  };

  handleAddCardFF = (e) => {
    this.setState({ addCardFF: e.target.checked });
  };

  onSubmit = () => {
    progress.lock();
    axios
      .post(`${getApiUrl()}survey.php`, {
        verifier: getVerifier(),
        best: this.state.strength.trim(),
        improve: this.state.weakness.trim(),
        other_pm: this.state.other.trim(),
        email: this.state.email.trim(),

        add_desktop: this.state.addDesktop,
        add_mobile: this.state.addMobile,
        add_ff: this.state.addCardFF,
      })
      .then((reply) => {
        progress.unlock();
        const result = reply.data;
        if (result.status === "Ok") {
          this.props.onClose(1, "thank you");
          return;
        }
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }

        this.setState({ errorMsg: result.status });
      })
      .catch((err) => {
        progress.unlock();
        this.setState({
          errorMsg: "Error sending email. Please try again later",
        });
      });
  };

  render() {
    if (this.props.show) {
      if (!this.isShown) {
        this.isShown = true;
        this.setState({ name: "", email: "", message: "", errorMsg: "" });
      }
    } else {
      this.isShown = false;
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
          <div className="h2">PassHub.net Survey</div>
        </div>
        <Modal.Body className="edit" style={{ marginBottom: "24px" }}>
          {this.state.errorMsg.length > 0 ? (
            <div style={{ color: "red", margin: "0 16px 16px" }}>
              <svg
                style={{
                  width: "24px",
                  height: "24px",
                  fill: "red",
                  marginRight: "16px",
                }}
              >
                <use href="#a-error"></use>
              </svg>
              {this.state.errorMsg}
            </div>
          ) : (
            ""
          )}

          <p>
            Your responses to this survey will help us better understand your
            experience with the PassHub.net. Thank You!
          </p>

          <p>What do you like best about PassHub?</p>

          <TextAreaField
            value={this.state.strength}
            id="strength"
            onChange={this.onStrengthChange}
            edit
          ></TextAreaField>

          <p>What can we do to improve PassHub?</p>
          <TextAreaField
            value={this.state.weakness}
            id="weakness"
            onChange={this.onWeaknessChange}
            edit
          ></TextAreaField>

          <p>
            What are the other password managers PassHub needs to be
            interoperable with (import/export)?
          </p>
          <InputField
            value={this.state.other}
            id="survey-other-pm"
            onChange={this.onOtherChange}
            edit
          ></InputField>

          <p style={{ marginBottom: 0 }}>
            What are the features you want to see in PassHub?
          </p>

          <div>
            <Form.Group
              controlId="formBasicCheckbox"
              style={{ border: "none" }}
            >
              <Form.Check
                type="checkbox"
                label="Desktop Application"
                checked={this.state.addDesktop}
                onChange={this.handleAddDesktop}
              />
              <Form.Check
                type="checkbox"
                label="Mobile Application"
                checked={this.state.addMobile}
                onChange={this.handleAddMobile}
              />
              <Form.Check
                type="checkbox"
                label="Automatic debit/credit card form fill"
                checked={this.state.addCardFF}
                onChange={this.handleAddCardFF}
              />
            </Form.Group>
          </div>
          <p>Your contact email (optional)</p>
          <InputField
            value={this.state.email}
            id="survey-email"
            onChange={this.onEmailChange}
            edit
          ></InputField>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={this.onSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default SurveyModal;
