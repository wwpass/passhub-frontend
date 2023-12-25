import React, { Component } from "react";

class InputField extends Component {
  state = {};
  render() {
    return (
      <div
        className="itemModalField"
        style={{
          padding: "11px 16px",
          marginBottom: "16px",
          cursor: this.props.onClick ? "pointer" : "",
        }}
        onClick={this.props.onClick}
      >
        {(this.props.value.length || this.props.children || !this.props.edit) &&
          this.props.label &&
          this.props.label.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: "14px" }}>
                <span style={{ color: "#1b1b26", opacity: "0.7" }}>
                  <label htmlFor={this.props.id} style={{ margin: 0 }}>
                    {this.props.value.length ? this.props.label : ""}
                  </label>
                </span>
              </div>
              <div>{this.props.children}</div>
            </div>
          )}

        <div>
          <input
            id={this.props.id}
            onChange={this.props.onChange}
            onKeyUp={this.props.onKeyUp}
            readOnly={!this.props.edit}
            spellCheck={false}
            value={this.props.value}
            placeholder={this.props.label}
            autoFocus={this.props.autoFocus} 
          ></input>
        </div>
      </div>
    );
  }
}

export default InputField;
