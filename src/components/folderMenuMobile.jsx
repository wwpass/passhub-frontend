import React, { Component } from "react";
import { contextMenu, Menu, Item, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { isCopyBufferEmpty } from "../lib/copyBuffer";

const SAFE_MENU_MOBILE_ID = "safe-menu-mobile_id";
const FOLDER_MENU_MOBILE_ID = "folder-menu-mobile_id";

class FolderMenuMobile extends Component {
  state = {};

  handleItemClick = (cmd) => {
    this.props.onMenuCmd(this.props.node, cmd);
    console.log(cmd);
  };

  folderMenu = (
    <Menu id={FOLDER_MENU_MOBILE_ID}>
      <Item
        onClick={() => {
          this.handleItemClick("rename");
        }}
      >
        Rename
      </Item>
      <Item
        onClick={() => {
          this.handleItemClick("Add folder");
        }}
      >
        Add folder
      </Item>
      <Item
        disabled={isCopyBufferEmpty}
        onClick={() => {
          this.handleItemClick("Paste");
        }}
      >
        Paste
      </Item>
      <Item
        onClick={() => {
          this.handleItemClick("export");
        }}
      >
        Export
      </Item>
      <Item
        onClick={() => {
          this.handleItemClick("delete");
        }}
      >
        Delete
      </Item>
    </Menu>
  );

  safeMenu = (
    <Menu id={SAFE_MENU_MOBILE_ID}>
      <Item
        onClick={() => {
          this.handleItemClick("Share");
        }}
      >
        Share
      </Item>
      <Item
        onClick={() => {
          this.handleItemClick("rename");
        }}
      >
        Rename
      </Item>
      <Item
        onClick={() => {
          this.handleItemClick("Add folder");
        }}
      >
        Add folder
      </Item>

      <Item
        disabled={isCopyBufferEmpty}
        onClick={() => {
          this.handleItemClick("Paste");
        }}
      >
        Paste
      </Item>
      <Item
        onClick={() => {
          this.handleItemClick("export");
        }}
      >
        Export
      </Item>
      <Item
        onClick={() => {
          this.handleItemClick("delete");
        }}
      >
        Delete
      </Item>
    </Menu>
  );

  showSafeMenu = (e) => {
    e.preventDefault();
    contextMenu.show({ id: SAFE_MENU_MOBILE_ID, event: e });
  };

  showFolderMenu = (e) => {
    e.preventDefault();
    contextMenu.show({ id: FOLDER_MENU_MOBILE_ID, event: e });
  };

  render() {
    const menu = this.props.isSafe ? this.safeMenu : this.folderMenu;
    const style = this.props.color ? { stroke: this.props.color } : {};

    return (
      <React.Fragment>
        <div
          className="menu-dots"
          onClick={this.props.isSafe ? this.showSafeMenu : this.showFolderMenu}
        >
          <svg width="24" height="24" className="safe_pane_icon" style={style}>
            <use href="#el-dots"></use>
          </svg>
        </div>
        {menu}
      </React.Fragment>
    );
  }
}

export default FolderMenuMobile;
