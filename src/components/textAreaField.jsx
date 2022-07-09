import React, { Component } from "react";

class TextAreaField extends Component {
  state = {};
  render() {
    return (
      <div
        className="itemModalField"
        style={{ padding: "11px 16px", marginBottom: "16px" }}
      >
        {this.props.label && this.props.label.lenght > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "14px" }}>
              <span style={{ opacity: "0.5" }}>
                <label htmlFor={this.props.id} style={{ margin: 0 }}>
                  {this.props.value.length ? this.props.label : ""}
                </label>
              </span>
            </div>
            <div>{this.props.children}</div>
          </div>
        )}

        <div>
          <textarea
            id={this.props.id}
            onChange={this.props.onChange}
            readOnly={!this.props.edit}
            spellCheck
            value={this.props.value}
            placeholder={this.props.label}
          ></textarea>
        </div>
      </div>
    );
  }
}

export default TextAreaField;
