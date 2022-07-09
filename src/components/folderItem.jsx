import React, { Component } from "react";
import { lastModified } from "../lib/utils";

class FolderItem extends Component {
  state = {};

  onClick = () => {
    this.props.onClick(this.props.item);
  };

  render() {
    const item = this.props.item;

    const angleIcon = (
      <svg
        className="d-sm-none"
        width="32"
        height="32"
        style={{
          fill: "rgba(27,27,38,0.6)",
          transform: "rotate(-90deg)",
          float: "right",
        }}
      >
        <use href="#angle"></use>
      </svg>
    );

    return (
      <tr className="d-flex" style={{ alignItems: "center" }}>
        <td
          colSpan="3"
          className="col-md-12 col-lg-8 col-xl-9"
          onClick={this.onClick}
          style={{ cursor: "pointer" }}
        >
          <svg width="24" height="24" className="itemIcon">
            <use href="#i-folder"></use>
          </svg>
          {item.cleartext[0]}
          {angleIcon}
        </td>
        <td className="column-modified d-none d-xl-table-cell col-xl-3">
          {lastModified(item)}
        </td>
      </tr>
    );
  }
}

export default FolderItem;
