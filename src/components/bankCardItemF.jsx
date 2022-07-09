import React from "react";
import { lastModified } from "../lib/utils";

function BankCardItem(props) {
  const item = props.item;

  const showModal = () => {
    props.showModal(props.item);
  };

  function dragStart(ev) {
    // Change the source element's background color to signify drag has started
    // ev.currentTarget.style.border = "dashed";
    ev.dataTransfer.setData("application/json", JSON.stringify(item));
    // Tell the browser both copy and move are possible
    ev.effectAllowed = "copyMove";
  }

  const trClass = props.searchMode ? "search-mode d-flex" : "d-flex";
  return (
    <tr className={trClass} style={{ alignItems: "center" }}>
      <td
        draggable
        id={`drag${item._id}`}
        onDragStart={dragStart}
        colSpan="3"
        className="col-md-12 col-lg-8 col-xl-9"
        onClick={showModal}
        style={{ cursor: "pointer" }}
      >
        <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          <svg
            width="24"
            height="24"
            className="itemIcon"
            style={{ stroke: "none", opacity: "0.5", cursor: "move" }}
          >
            <use href="#credit_card"></use>
          </svg>
          {item.cleartext[1]}
        </div>
        {props.searchMode && (
          <div className="search-path">{item.path.join(" > ")}</div>
        )}
      </td>
      <td className="column-modified d-none d-xl-table-cell col-xl-3">
        {lastModified(item)}
      </td>
    </tr>
  );
}

export default BankCardItem;
