import React, { Component } from "react";
import { lastModified } from "../lib/utils";

class NoteItem extends Component {
  state = {};
  showModal = () => {
    this.props.showModal(this.props.item);
  };

  render() {
    const item = this.props.item;

    return (
      <tr className="d-flex" style={{ alignItems: "center" }}>
        <td
          colSpan="3"
          className="col-md-12 col-lg-8 col-xl-9"
          onClick={this.showModal}
          style={{ cursor: "pointer" }}
        >
          <div>
            <svg width="24" height="24" className="itemIcon">
              <use href="#i-note"></use>
            </svg>
            {item.cleartext[0]}
          </div>
          {this.props.searchMode && (
            <div className="search-path">{item.path.join(" > ")}</div>
          )}
        </td>
        <td className="column-modified d-none d-xl-table-cell col-xl-3">
          {lastModified(item)}
        </td>
      </tr>
    );
  }
}

export default NoteItem;
