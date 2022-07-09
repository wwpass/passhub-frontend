import React, { Component } from "react";
class CheckBox extends Component {
  render() {
    let icon = this.props.checked ? "#f-checkbox-on" : "#f-checkbox-off-hover";
    return (
      <div
        onClick={this.props.onClick}
        style={{
          minWidth: "8em",
          cursor: "pointer",
          height: "48px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg width="24" height="24" fill="none">
          <use href={icon}></use>
        </svg>
        {this.props.children}
      </div>
    );
  }
}

export default CheckBox;
