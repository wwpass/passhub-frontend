import React, { Component } from "react";

class Eye extends React.Component {
  state;
  render() {
    return (
      <div
        onClick={this.props.onClick}
        style={{ marginLeft: "15px", paddingLeft: "12px", cursor: "pointer" }}
      >
        <svg
          fill="none"
          style={{ width: 24, height: 24 }}
          onClick={this.props.onClick}
        >
          {this.props.hide ? (
            <use href="#eye"></use>
          ) : (
            <use href="#eye-off"></use>
          )}
        </svg>
      </div>
    );
  }
  state;
}

export default Eye;

/* 
          hide={this.props.hide}

          */
