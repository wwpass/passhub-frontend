import React, { Component } from "react";

import axios from "axios";

import * as passhubCrypto from "../lib/crypto";
import { getApiUrl, getVerifier, getUserData, atRecordsLimits } from "../lib/utils";

import ItemModal from "./itemModal";
// import PlanLimitsReachedModal from "./planLimitsReachedModal";
import UpgradeModal from "./upgradeModal";


class NoteModal extends Component {
  state = {
    errorMsg: "",
  };

  isShown = false;

  onClose = () => {
    this.props.onClose();
  };

  onSubmit = (title, note) => {
    const pData = [title, "", "", "", note];
    const options = { note: 1 };

    const safe = this.props.args.safe;

    const aesKey = safe.bstringKey;
    const SafeID = safe.id;

    let folderID = 0;
    if (this.props.args.item) {
      folderID = this.props.args.item.folder;
    } else if (this.props.args.folder.safe) {
      folderID = this.props.args.folder.id;
    }

    const eData = passhubCrypto.encryptItem(pData, aesKey, options);
    const data = {
      verifier: getVerifier(),
      vault: SafeID,
      folder: folderID,
      encrypted_data: eData,
    };
    if (this.props.args.item) {
      data.entryID = this.props.args.item._id;
    }

    axios
      .post(`${getApiUrl()}items.php`, data)
      .then((reply) => {
        const result = reply.data;
        if (result.status === "Ok") {
          this.props.onClose(true);
          return;
        }
        if (result.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        if (result.status === "expired") {
          window.location.href = "expired.php";
          return;
        }
        this.setState({ errorMsg: result.status });
        return;
      })
      .catch((err) => {
        this.setState({ errorMsg: "Server error. Please try again later" });
      });
  };

  render() {
    if (!this.props.show) {
      this.isShown = false;
      return null;
    }

    if (typeof this.props.args.item == "undefined") {
      if (atRecordsLimits()) {
        return (
          <UpgradeModal
            show={this.props.show}
            accountData={getUserData()}
            onClose={this.props.onClose}
          ></UpgradeModal>
        );
/*
        
        return (
          <PlanLimitsReachedModal
            show={this.props.show}
            onClose={this.props.onClose}
          ></PlanLimitsReachedModal>
        );
*/        
      }
    }

    if (!this.isShown) {
      this.isShown = true;
      this.state.errorMsg = "";
    }

    return (
      <ItemModal
        show={this.props.show}
        args={this.props.args}
        onClose={this.props.onClose}
        onCloseSetFolder={this.props.onCloseSetFolder}
        onSubmit={this.onSubmit}
        errorMsg={this.state.errorMsg}
        isNote
      ></ItemModal>
    );
  }
}

export default NoteModal;
