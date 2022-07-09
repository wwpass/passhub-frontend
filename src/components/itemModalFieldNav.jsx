import React, { Component } from "react";

class ItemModalFieldNav extends Component {
  state = {};

  render() {
    let clickAction = null;
    const style27 = this.props.margin27 ? { marginRight: "27px" } : {};

    if (this.props.copy) {
      clickAction = (
        <div>
          <span className="iconTitle" style={style27}>
            Copy
          </span>
          <svg width="24" height="24" fill="none" stroke="#1b1b26" title="Copy">
            <use href="#f-copy"></use>
          </svg>
        </div>
      );
    } else if (this.props.gotowebsite) {
      clickAction = (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="iconTitle">Go to website</div>
          <div className="gotowebsite"></div>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="label">
          <label htmlFor={this.props.htmlFor}>{this.props.name}</label>
        </div>
        {clickAction}
      </div>
    );
  }
}

export default ItemModalFieldNav;

/*
          <svg
            className="gotowebsite"
            width="40"
            height="32"
            title="Go to website"
            stroke="white"
          >
            <use href="#f-gotowebsite"></use>
          </svg>

*/
