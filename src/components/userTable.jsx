import React, { Component } from "react";
import UserRecord from "./userRecord";

class UserTable extends Component {
  render() {
    return (
      <table className="iam_table">
        <thead style={{ background: "rgba(27,27,38,.86)", color: "white" }}>
          <tr>
            <th style={{ minWidth: "2em" }}></th>
            <th style={{ minWidth: "8em", paddingLeft: "1em" }}>Status</th>
            <th style={{ width: "40%" }}>Email</th>
            <th>
              Safes
              <br />
              total
            </th>
            <th>
              Safes
              <br />
              shared
            </th>
            <th
              className="d-none d-lg-table-cell"
              style={{
                minWidth: "10em",
                textAlign: "right",
                paddingRight: "1em",
              }}
            >
              Last seen <br />
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </th>
          </tr>
        </thead>
        <tbody>
          {this.props.users.map((u) => {
            const me = u._id === this.props.me;
            return (
              <UserRecord
                key={u.email}
                user={u}
                me={me}
                showDelDialog={this.props.showDelDialog}
                userStatusCB={this.props.userStatusCB}
              />
            );
          })}
        </tbody>
      </table>
    );
  }
}

export default UserTable;
