import React, { Component } from "react";
import axios from "axios";
import { getApiUrl, getVerifier } from "../lib/utils";

import { fromArrays } from '../lib/csv';
import { saveAs } from "file-saver";


import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";


import InviteDiv from "./inviteDiv";
//import UserTable from "./userTableF";
import UserTable from "./userTableF";
import DelUserModal from "./delUserModal";





function cmp(o1, o2) {
  const u1 = o1.email.toUpperCase();
  const u2 = o2.email.toUpperCase();
  if (u1 < u2) {
    return -1;
  }
  if (u1 > u2) {
    return 1;
  }
  return 0;
}

class UserManagementPage extends Component {
  state = {
    users: [],
    licensedUsers: null,
    me: "",
    errorMsg: "",
    searchString: "",
    delDialogData: { email: "", id: "", show: false },
  };


  onSearchChange = (e) => {
    this.setState({searchString: e.target.value});
  }

  searchClear = () => {
    this.setState({searchString: ""});
  }

  onNewMail = (email) => {
    this.setState({ email });
    this.getPageData();
    // console.log(email);
  };

  onExport = () => {
    let csv = 'email, role, lastSeen\r\n';

    for(let user of this.state.users) {
      let status = user.status;
      if(user.disabled) {
        status = "disabled";
      }

      if(!status) {
        status = user.site_admin ? "admin":"active";
      }
      csv += fromArrays([[user.email, status, user.lastSeen]])
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, "passhub-users.csv");
  }

  updatePage = () => {
    this.getPageData();
  };

  showDelDialog = (data) => {
    this.setState({
      delDialogData: { email: data.email, id: data.id, show: true },
    });
  };

  hideDelDialog = () => {
    this.setState({
      delDialogData: { email: "", id: "", show: false },
    });
  };

  userStatusCB = (data) => {
    //console.log(data);
    axios
      .post(`${getApiUrl()}iam.php`, {
        verifier: getVerifier(),
        operation: data.operation,
        id: data.id,
        email: data.email,
      })
      .then((result) => {
        if (result.data.status === "Ok") {
          this.getPageData();
          return;
        }
        if (result.data.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        alert(result.data.status);
      })
      .catch((error) => {
        alert(error);
      });
  };

  getPageData = () => {
    if (window.location.href.includes("mock")) {
      return;
    }
    axios
      .post(`${getApiUrl()}iam.php`, {
        verifier: getVerifier(),
        operation: "users",
      })
      .then((result) => {
        // console.log(result);
        if (result.data.status === "Ok") {
          let users = result.data.users.sort(cmp);
          this.setState({
            users,
            me: result.data.me,
            errorMsg: "",
            delDialogData: { email: "", id: "", show: false },
            licensedUsers: result.data.LICENSED_USERS,
          });
          return;
        }
        if (result.data.status === "login") {
          window.location.href = "expired.php";
          return;
        }
        this.setState({ errorMsg: result.data.status });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  isShown = false;

  render() {
    if (!this.props.show) {
      return null;
    }

    const inputBackground = this.state.searchString.trim().length
    ? "white"
    : "rgba(255, 255, 255, 0.6)";


    if (!this.props.show) {
      this.isShown = false;
      return null;
    }
    if (!this.isShown) {
      this.isShown = true;
      this.getPageData();
    }

    let licensed = this.state.licensedUsers ? <><br></br><span> licensed users: {this.state.licensedUsers}</span></> : null;
    let users = <span>users: {this.state.users.length}</span>;

    return (
      <Card
        className="col"
        style={{ padding: 0, borderRadius: "16px", height: "100%" }}
      >
        <Card.Header
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <h1>User Management</h1>
          <button
            type="button"
            className="close"
            style={{ fontSize: "inherit" }}
            aria-label="Close"
            onClick={this.props.gotoMain}
          >
            <svg width="18" height="18" style={{ stroke: "black" }}>
              <use href="#el-x"></use>
            </svg>
          </button>
        </Card.Header>
        <Card.Body style={{ display: "flex", flexDirection: "column" }}>
          {this.state.errorMsg.length > 0 ? (
            <div style={{ fontSize: "32px", color: "red" }}>
              {this.state.errorMsg}
            </div>
          ) : (
            <React.Fragment>
              <DelUserModal
                data={this.state.delDialogData}
                updatePage={this.updatePage}
                hide={this.hideDelDialog}
              />
              <InviteDiv
                onNewMail={this.onNewMail}
                updatePage={this.updatePage}
                users = {this.state.users}
                licensedUsers = {this.state.licensedUsers}
              />

              <div style={{display:"flex", justifyContent:"space-between", padding: "0 16px 16px 0", alignItems:"center", background: "#eee"}}>

                  <div
                    style={{
                      padding: "0 36px 0 16px",
                      position: "relative",
                      flexGrow: 1
                    }}
                  >
                    <input
                      className="search_string"
                      type="text"
                      placeholder="Search.."
                      autoComplete="off"
                      onChange={this.onSearchChange}
                      value={this.state.searchString}
                      style={{
                        width: "100%",
                        background: inputBackground,
                        backdropFilter: "blur(40px)",
                        border:"#bbb 1px solid"
                      }}
                    />

                    <span className="search_clear" onClick={this.searchClear}>
                      <svg width="0.7em" height="0.7em" className="item_icon">
                        <use href="#cross"></use>
                      </svg>
                    </span>
                    <span style={{ position: "absolute", left: "21px", top: "8px" }}>
                      <svg
                        width="24"
                        height="24"
                        style={{
                          opacity: 0.4,
                          verticalAlign: "text-bottom",
                        }}
                      >
                        <use href="#f-search"></use>
                      </svg>
                    </span>
                  </div>

                  <div style={{background:"#f8f8f8", padding: "0 12px", borderRadius: 12}}>
                    {users}
                    {licensed}
                  </div>

                  <Button
                    className="btn btn-sm btn-primary"
                    style={{ verticalAlign: "top", marginLeft: "2em" }}
                    onClick = {this.onExport}
                  >
                    Export
                  </Button>
              </div>

              <UserTable
                users={this.state.users}
                me={this.state.me}
                showDelDialog={this.showDelDialog}
                userStatusCB={this.userStatusCB}
                searchString={this.state.searchString.toLowerCase()}
              />
            </React.Fragment>
          )}
        </Card.Body>
      </Card>
    );
  }
}

export default UserManagementPage;
