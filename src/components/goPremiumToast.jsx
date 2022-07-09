import Toast from "react-bootstrap/Toast";
import Button from "react-bootstrap/Button";

import React, { Component } from "react";

class GoPremiumToast extends Component {
  onSubmit = () => {
    window.open("payments/checkout.php", "passhub_payment");
    this.props.onClose();
  };

  render() {
    return (
      <Toast
        onClose={this.props.onClose}
        show={this.props.show}
        className="go-premium-toast toast-ph"
      >
        <div className="toast-header">
          <div>Get PassHub Premium</div>
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
          <div>
            Includes 1 GB of secure data storage and unlimited password records.
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              margin: "16px 0 0 0",
            }}
          >
            <Button variant="primary" type="button" onClick={this.onSubmit}>
              Upgrade to Premium
            </Button>
            <Button variant="outline-secondary" onClick={this.props.onClose}>
              Cancel
            </Button>
          </div>
        </Toast.Body>
      </Toast>
    );
  }
}

export default GoPremiumToast;
