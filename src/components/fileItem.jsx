import React, { Component } from "react";
import { humanReadableFileSize, lastModified } from "../lib/utils";

class FileItem extends Component {
  state = {};
  showModal = () => {
    this.props.showModal(this.props.item);
  };

  render() {
    const item = this.props.item;
    /*
    const modified = new Date(item.lastModified).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    */
    return (
      <tr className="d-flex" style={{ alignItems: "center" }}>
        <td
          colSpan="2"
          className="col-md-12 col-lg-8 col-xl-6"
          onClick={this.showModal}
          style={{ cursor: "pointer" }}
        >
          <div>
            <svg width="24" height="24" className="itemIcon">
              <use href="#i-file"></use>
            </svg>
            {item.cleartext[0]}
          </div>
          {this.props.searchMode && (
            <div className="search-path">{item.path.join(" > ")}</div>
          )}
        </td>
        <td className="rightAlign d-none d-lg-table-cell col-lg-4 col-xl-3">
          {humanReadableFileSize(item.file.size)}
        </td>
        <td className="column-modified d-none d-xl-table-cell col-xl-3">
          {lastModified(item)}
        </td>
      </tr>
    );
  }
}

export default FileItem;
