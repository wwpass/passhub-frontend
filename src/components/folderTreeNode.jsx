import React, { Component } from "react";

import FolderMenu from "./folderMenu";

const sharedFolderIcon = (
  <svg width="24" height="24" className="safe_pane_icon">
    <use href="#i-folder_shared"></use>
  </svg>
);

const folderIcon = (
  <svg width="24" height="24" className="safe_pane_icon">
    <use href="#i-folder"></use>
  </svg>
);

class FolderTreeNode extends Component {
  getClass = () => {
    return this.props.node.id === this.props.activeFolder.id
      ? "folder active_folder"
      : "folder";
  };

  handleMenuCmd = (node, cmd) => {
    this.props.onMenuCmd(this.props.node, cmd);
  };

  menuDots = (
    <FolderMenu
      node={this.props.node}
      onMenuCmd={this.handleMenuCmd}
      isSafe={this.props.isSafe}
    />
  );

  componentDidMount() {}

  render() {
    const icon = this.props.node.users > 1 ? sharedFolderIcon : folderIcon;
    const menuDotsHere =
      this.props.node.id === this.props.activeFolder.id ? this.menuDots : "";

    const padding = this.props.padding ? this.props.padding : 0;
    if ("folders" in this.props.node && this.props.node.folders.length > 0) {
      const folders = this.props.open
        ? this.props.node.folders.map((s) => (
            <FolderTreeNode
              onSelect={this.props.onSelect}
              key={s.id}
              node={s}
              padding={padding + 20}
              open={this.props.open.has(s.id) && this.props.open}
              onOpen={this.props.onOpen}
              activeFolder={this.props.activeFolder}
              onMenuCmd={this.props.onMenuCmd}
            />
          ))
        : "";
      const angleIcon = (
        <svg
          width="24"
          height="24"
          style={{
            fill: "white",
            transform: this.props.open ? false : "rotate(-90deg)",
          }}
          onClick={(e) => {
            // e.preventDefault();
            e.stopPropagation();
            this.props.onOpen(this.props.node);
          }}
        >
          <use href="#angle"></use>
        </svg>
      );

      return (
        <div>
          <div
            className={this.getClass()}
            onClick={() => this.props.onSelect(this.props.node)}
            style={{
              position: "relative",
              paddingLeft: padding + "px",
              outline: "none",
              display: "flex",
            }}
          >
            <div>
              {angleIcon}
              {icon}
            </div>
            <div
              style={{
                cursor: "default",
                flexGrow: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {this.props.node.name}
            </div>
            {menuDotsHere}
          </div>
          {folders}
        </div>
      );
    }

    return (
      <div
        className={this.getClass()}
        onClick={() => this.props.onSelect(this.props.node)}
        style={{
          position: "relative",
          overflow: "hidden",
          whiteSpace: "nowrap",
          paddingLeft: padding + 24 + "px",
          outline: "none",
          display: "flex",
        }}
      >
        <div style={{ cursor: "default" }}>{icon}</div>
        <div
          style={{
            cursor: "default",
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {this.props.node.name}
        </div>
        {menuDotsHere}
      </div>
    );
  }
}

export default FolderTreeNode;
