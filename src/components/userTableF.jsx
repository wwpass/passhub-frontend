import React from "react";
import UserRecord from "./userRecord";

function UserTable(props) {
  return (
    <div style={{ overflowY: "auto" }}>
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
          {props.users.map((u) => {
            const me = u._id === props.me;
            return (
              <UserRecord
                key={u.email}
                user={u}
                me={me}
                showDelDialog={props.showDelDialog}
                userStatusCB={props.userStatusCB}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
