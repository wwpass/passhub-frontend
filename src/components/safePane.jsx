import React, { Component } from "react";
import Col from "react-bootstrap/Col";

import FolderNameModal from "./folderNameModal";
import DeleteFolderModal from "./deleteFolderModal";
import ExportFolderModal from "./exportFolderModal";
import ShareModal from "./shareModal";

import FolderTreeNode from "./folderTreeNodeF";
import MobileSafeNode from "./mobileSafeNode";

class SafePane extends Component {
  state = {
    showModal: "",
    folderNameModalArgs: {},
    shareModalArgs: null,
  };

  modalKey = 1;

  handleSelect = (folder) => {
    this.props.setActiveFolder(folder);
  };

  onAccountMenuCommand(cmd) {
    if (cmd === "Export") {
      this.setState({
        showModal: "ExportFolderModal",
        exportFolderModalArgs: this.props.safes,
      });
    }
    /*
    if (cmd === "Import") {
      this.setState({
        showModal: "ImportModal",
      });
    }
    */
  }

  onFolderMenuCmd = (node, cmd) => {
    if (cmd === "delete") {
      this.modalKey++;

      this.setState({
        showModal: "DeleteFolderModal",
        deleteFolderModalArgs: node,
      });
    }

    if (cmd === "rename") {
      this.setState({
        showModal: "FolderNameModal",
        folderNameModalArgs: { folder: node },
      });
    }

    if (cmd === "Paste") {
      //       this.pasteItem(node);
      this.props.pasteItem(node);
    }

    if (cmd === "export") {
      this.setState({
        showModal: "ExportFolderModal",
        exportFolderModalArgs: node,
      });
    }

    if (cmd === "Add folder") {
      this.setState({
        showModal: "FolderNameModal",
        folderNameModalArgs: { parent: node },
      });
    }
    if (cmd === "Share") {
      this.setState({
        showModal: "ShareModal",
        shareModalArgs: { folder: node, email: this.props.email },
      });
    }
  };

  render() {
    if (!this.props.show) {
      return null;
    }
    /*
    if (this.props.activeFolder && this.props.activeFolder.safe) {
      let parentId = this.props.activeFolder.parent;
      while (parentId) {
        if (!this.state.openNodes.has(parentId)) {
          this.state.openNodes.add(parentId);
        }
        const parentNode = getFolderById(
          this.props.activeFolder.safe.folders,
          parentId
        );
        parentId = parentNode.parent;
      }

      if (!this.state.openNodes.has(this.props.activeFolder.safe.id)) {
        this.state.openNodes.add(this.props.activeFolder.safe.id);
      }
    }
*/

    return (
      <Col
        className="col-xl-3 col-lg-4 col-md-5 col-sm-6 col d-sm-block safe_pane"
        id="safe_pane"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            // marginRight: "0.3em",
          }}
        >
          {/*<div className="folder">Recent and favorities</div> */}
          <div className="folders-header">SAFES</div>
          <div className="safe_scroll_control custom-scroll d-sm-none">
            {this.props.safes.map((s) => (
              <MobileSafeNode
                key={s.id}
                node={s}
                onSelect={this.handleSelect}
              />
            ))}
          </div>

          <div className="safe_scroll_control custom-scroll d-none d-sm-block">
            {this.props.safes.map((s) => (
              <FolderTreeNode
                key={s.id}
                onSelect={this.handleSelect}
                onOpen={this.props.handleOpenFolder}
                dropItem={this.props.dropItem}
                node={s}
                open={this.props.openNodes.has(s.id) && this.props.openNodes}
                activeFolder={this.props.activeFolder}
                isSafe={true}
                onMenuCmd={this.onFolderMenuCmd}
                padding={20}
              />
            ))}
          </div>
          <div
            className="add_safe"
            onClick={() => {
              this.setState({
                folderNameModalArgs: {},
                showModal: "FolderNameModal",
              });
            }}
          >
            Add safe
          </div>
        </div>
        <FolderNameModal
          show={this.state.showModal == "FolderNameModal"}
          args={this.state.folderNameModalArgs}
          onClose={(refresh = false, newFolderID) => {
            this.setState({ showModal: "" });
            if (refresh === true) {
              this.props.refreshUserData({ newFolderID });
            }
          }}
        ></FolderNameModal>
        <DeleteFolderModal
          show={this.state.showModal == "DeleteFolderModal"}
          folder={this.state.deleteFolderModalArgs}
          key={`deleteFolderModal${this.modalKey}`}
          onClose={(refresh = false) => {
            this.setState({ showModal: "" });
            if (refresh === true) {
              this.props.refreshUserData();
            }
          }}
        ></DeleteFolderModal>
        <ExportFolderModal
          show={this.state.showModal == "ExportFolderModal"}
          folder={this.state.exportFolderModalArgs}
          onClose={() => {
            this.setState({ showModal: "" });
          }}
        ></ExportFolderModal>
        <ShareModal
          show={this.state.showModal == "ShareModal"}
          args={this.state.shareModalArgs}
          onClose={(refresh = false) => {
            this.setState({ showModal: "" });
            if (refresh === true) {
              this.props.refreshUserData();
            }
          }}
        ></ShareModal>
      </Col>
    );
  }
}

export default SafePane;
