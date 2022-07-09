import { findByLabelText } from "@testing-library/react";
import React, { Component } from "react";

const iconStyle = {
  stroke: "white",
  opacity: "0.7",
  verticalAlign: "middle",
  marginRight: "10px",
};

const sharedFolderIcon = (
  <svg width="24" height="24" style={iconStyle}>
    <use href="#i-folder_shared"></use>
  </svg>
);

const folderIcon = (
  <svg width="24" height="24" style={iconStyle}>
    <use href="#i-folder"></use>
  </svg>
);

class MobileSafeNode extends Component {
  state = {};

  render() {
    const icon = this.props.node.users > 1 ? sharedFolderIcon : folderIcon;
    const angleIcon = (
      <svg
        width="24"
        height="24"
        style={{
          fill: "white",
          transform: "rotate(-90deg)",
          float: "right",
        }}
      >
        <use href="#angle"></use>
      </svg>
    );

    return (
      <div
        className="folder"
        onClick={() => {
          this.props.onSelect(this.props.node);
          document.querySelector("#safe_pane").classList.add("d-none");
          document.querySelector("#table_pane").classList.remove("d-none");
        }}
        style={{
          position: "relative",
          outline: "none",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
        }}
      >
        <span style={{ cursor: "default" }}>
          {icon}
          {this.props.node.name}
        </span>
        {angleIcon}
      </div>
    );
  }
}

export default MobileSafeNode;
