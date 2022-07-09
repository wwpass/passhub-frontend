import React, { Component } from "react";
// import DragIcon from "./dragIcon";

import { openInExtension } from "../lib/extensionInterface";
import { lastModified } from "../lib/utils";

function prepareUrl(url) {
  if (url.startsWith("www")) {
    return `<a target='_blank' href='http://${url}' rel="noreferrer noopener">${url}</a>`;
  }
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return `<a target='_blank' href='${url}' rel="noreferrer noopener">${url}</a>`;
  }
  return url;
}

class PasswordItem extends Component {
  state = {};
  showModal = () => {
    this.props.showModal(this.props.item);
  };

  render() {
    const item = this.props.item;
    /*
    let modified = "";
    if ("lastModified" in item) {
      modified = new Date(item.lastModified).toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    */

    let link_text = item.cleartext[3];
    if (link_text.startsWith("https://")) {
      link_text = link_text.substring(8);
    } else if (link_text.startsWith("http://")) {
      link_text = link_text.substring(7);
    }

    /*
    const pathToFolder =
      folder.path.length < 2
        ? ""
        : folder.path.slice(0, -1).join(" > ") + " > ";
        */

    let trClass = this.props.searchMode ? "search-mode d-flex" : "d-flex";
    return (
      <tr className={trClass} style={{ alignItems: "center" }}>
        <td
          className="col-sm-12 col-md-6 col-lg-4 col-xl-3"
          onClick={this.showModal}
          style={{ cursor: "pointer" }}
        >
          <div draggable id={`drag${item._id}`}>
            <svg width="24" height="24" className="itemIcon">
              <use href="#i-key"></use>
            </svg>
            // <DragIcon icon="#i-key"></DragIcon>
            {item.cleartext[0]}
          </div>
          {this.props.searchMode && (
            <div className="search-path">{item.path.join(" > ")}</div>
          )}
        </td>
        <td className="d-none d-md-table-cell           col-md-6 col-lg-4 col-xl-3">
          {item.cleartext[1]}
        </td>
        <td
          className="d-none d-lg-table-cell                    col-lg-4 col-xl-3 login-item-link "
          onClick={() => {
            openInExtension(this.props.item);
          }}
          style={{
            cursor: link_text.length ? "pointer" : "",
          }}
        >
          {link_text}
        </td>
        <td className="d-none d-xl-table-cell                             col-xl-3 column-modified">
          {lastModified(item)}
        </td>
      </tr>
    );
  }
}

export default PasswordItem;
