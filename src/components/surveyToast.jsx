import Toast from "react-bootstrap/Toast";
import Button from "react-bootstrap/Button";

import React, { Component } from "react";

class SurveyToast extends Component {
  onSubmit = () => {
    this.props.onClose("showSurveyModal");
  };

  render() {
    return (
      <Toast onClose={this.props.onClose} show={this.props.show}>
        <div className="toast-header">
          <div>Help us improve PassHub</div>
          <div>
            <svg
              style={{ width: 24, height: 24, cursor: "pointer" }}
              onClick={this.props.onClose}
            >
              <use href="#f-cross24"></use>
            </svg>
          </div>
        </div>

        <Toast.Body>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              margin: "16px 0 0 0",
            }}
          >
            <Button variant="primary" type="button" onClick={this.onSubmit}>
              Take&nbsp;short&nbsp;survey
            </Button>
            <Button variant="outline-secondary" onClick={this.props.onClose}>
              Remind&nbsp;me&nbsp;later
            </Button>
          </div>
        </Toast.Body>
      </Toast>
    );
  }
}

export default SurveyToast;
