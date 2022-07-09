import React, { Component } from "react";

import {
  contextMenu,
  Menu,
  Item,
  theme,
  Separator,
  Submenu,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

class SafeUSer extends Component {
  state = {};

  handleRoleMenuClick = (cmd, user) => {
    let role = "readonly";
    if (cmd == "Can edit") {
      role = "editor";
    }
    if (cmd == "Safe owner") {
      role = "administrator";
    }
    if (cmd == "Remove") {
      role = "Remove";
    }
    console.log(cmd.user);
    this.props.setUserRole(user.name, role);
  };

  safeUserMenu = (
    <Menu id={"safe-user-menu"}>
      <Item
        onClick={(e) => {
          this.handleRoleMenuClick("Can view", e.props.user);
        }}
      >
        <div>
          <div>Can view</div>
          <div
            style={{
              fontSize: "13px",
              opacity: "0.5",
              maxWidth: "17em",
              whiteSpace: "break-spaces",
            }}
          >
            User can only view records and download files
          </div>
        </div>
      </Item>
      <Item
        onClick={(e) => {
          console.log(e);
          this.handleRoleMenuClick("Can edit", e.props.user);
        }}
      >
        <div>
          <div>Can Edit</div>
          <div
            style={{
              fontSize: "13px",
              opacity: "0.5",
              maxWidth: "17em",
              whiteSpace: "break-spaces",
            }}
          >
            User can edit, delete, and add files to the Safe
          </div>
        </div>
      </Item>
      <Item
        onClick={(e) => {
          this.handleRoleMenuClick("Safe owner", e.props.user);
        }}
      >
        <div>
          <div>Safe owner</div>
          <div
            style={{
              fontSize: "13px",
              opacity: "0.5",
              maxWidth: "17em",
              whiteSpace: "break-spaces",
            }}
          >
            Additionaly can share safe and manage user access rights
          </div>
        </div>
      </Item>
      <Item onClick={(e) => this.handleRoleMenuClick("Remove", e.props.user)}>
        <div style={{ color: "#B40020", fontWeight: "bold" }}>
          Revoke access
        </div>
      </Item>
    </Menu>
  );

  showSafeUserMenu = (e) => {
    contextMenu.show({
      id: "safe-user-menu",
      event: e,
      props: { user: this.props.user },
    });
  };

  render() {
    let role = "can view";
    if (this.props.user.role == "editor") {
      role = "can edit";
    }
    if (this.props.user.role == "administrator") {
      role = "owner";
    }
    return this.props.user.myself ? (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            color: "rgba(27, 27, 38, 0.7)",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          <b>Me&nbsp;&#183;</b>&nbsp;
          {this.props.user.name}
        </div>
        <div
          style={{
            marginRight: "1em",
            textAlign: "end",
            width: "7em",
          }}
        >
          {role}
        </div>
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
          {this.props.user.name}
        </div>
        {this.safeUserMenu}
        {this.props.isAdmin ? (
          <div className="roleChanger" onClick={this.showSafeUserMenu}>
            {role}

            <svg
              width="24"
              height="24"
              style={{
                verticalAlign: "top",
                fill: "#009A50",
              }}
            >
              <use href="#angle"></use>
            </svg>
          </div>
        ) : (
          <div>{role}</div>
        )}
      </div>
    );
  }
}

export default SafeUSer;
