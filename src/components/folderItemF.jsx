import React from "react";
import { lastModified } from "../lib/utils";

function FolderItem(props) {
  const onClick = () => {
    props.onClick(props.item);
  };

  function onDrop(ev) {
    ev.currentTarget.style.background = "none";
    ev.currentTarget.style.border = "none";
    try {
      const itemDropped = JSON.parse(
        ev.dataTransfer.getData("application/json")
      );
      props.dropItem(props.item, itemDropped);
    } catch (e) {
      console.log(e);
    }
  }

  function onDragOver(ev) {
    ev.currentTarget.style.background =
      "linear-gradient(90deg, rgba(0,0,0,0.05),  rgba(0,0,0,0))";
    //ev.currentTarget.style.border = "1px solid lightgreen";
    ev.preventDefault();
  }

  function onDragLeave(ev) {
    ev.currentTarget.style.background = "none";
    ev.currentTarget.style.border = "none";
    ev.preventDefault();
  }

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
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
          <svg width="24" height="24" className="itemIcon">
            <use href="#i-folder"></use>
          </svg>
          {props.item.cleartext[0]}
          {angleIcon}
        </div>
      </td>
      <td className="d-none d-lg-table-cell                 col-lg-4 col-xl-3 column-modified">
        {lastModified(props.item)}
      </td>
    </tr>
  );
}

export default FolderItem;
