import React, { Component } from "react";

class ItemViewIcon extends Component {
  render() {
    return (
      <span
        className="itemViewIcon"
        title={this.props.title}
        onClick={this.props.onClick}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="#1B1B26"
          style={{
            verticalAlign: "unset",
          }}
        >
          <use href={this.props.iconId}></use>
        </svg>
      </span>
    );
  }
}

export default ItemViewIcon;
