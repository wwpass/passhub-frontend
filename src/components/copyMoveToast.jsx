import Toast from "react-bootstrap/Toast";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

import React, { Component } from "react";
import { capitalizeFirstLetter } from "../lib/utils";
import { copyBufferTimeout } from "../lib/copyBuffer";

class CopyMoveToast extends Component {
  render() {
    return (
      <Toast
        onClose={this.props.onClose}
        show={this.props.show}
        className="go-premium-toast toast-ph"
      >
        <div className="toast-header">
          <div>
            {capitalizeFirstLetter(this.props.operation)} item to another safe
          </div>
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
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: 12 }}>
              <CountdownCircleTimer
                isPlaying
                duration={copyBufferTimeout - 1}
                colors={"#ffffff"}
                trailColor={"rgb(0,188,98"}
                size={48}
                strokeWidth={4}
              >
                {({ remainingTime }) => remainingTime}
              </CountdownCircleTimer>
            </div>
            <div>
              Select target safe/folder to copy the item to.<br></br> Choose
              "Paste" in its menu.
            </div>
          </div>
        </Toast.Body>
      </Toast>
    );
  }
}

export default CopyMoveToast;

/*

        <Toast.Header>{this.props.operation} item to another safe</Toast.Header>

<div className="toast-header-ph">
            {this.props.operation} item to another safe
          </div>
              colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
              colorsTime={[copyBufferTimeout - 1, 5]}



          */
