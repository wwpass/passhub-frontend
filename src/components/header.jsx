import React, { Component } from "react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NavSpan from "./navSpan";

class Header extends Component {
  render() {
    return (
      <React.Fragment>
        <Row>
          <Col
            style={{
              paddingLeft: 24,
              paddingRight: 16,
              margin: "20px auto 12px auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: this.props.narrowPage ? "680px" : "",
            }}
          >
            <div>
              <span
                onClick={this.props.gotoMain}
                style={{
                  cursor: this.props.page === "Main" ? "default" : "pointer",
                }}
              >
                <img
                  src="public/img/new_ph_logo.svg"
                  alt="logo"
                  style={{ width: "133px" }}
                />
              </span>
              <span className="d-md-none" id="xs_indicator"></span>
              <input id="fake_username" type="text" />
              <input id="fake_password" type="password" />
            </div>
            <NavSpan
              onSearchChange={this.props.onSearchChange}
              searchString={this.props.searchString}
              onMenuCommand={this.props.onAccountMenuCommand}
              page={this.props.page}
              gotoIam={this.props.gotoIam}
            />
          </Col>
        </Row>
        {this.props.page === "Main" && (
          <Row className="d-sm-none">
            <div
              style={{
                flexGrow: 1,
                position: "relative",
              }}
            >
              <input
                className="search_string"
                type="text"
                placeholder="Search.."
                autoComplete="off"
                onChange={(e) => this.props.onSearchChange(e.target.value)}
                value={this.props.searchString}
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(40px)",
                  height: "48px",
                  padding: "0 30px 0 10px",
                }}
              />

              <span
                className="search_clear"
                onClick={() => {
                  this.props.onSearchChange("");
                }}
              >
                <svg width="0.7em" height="0.7em" className="item_icon">
                  <use href="#cross"></use>
                </svg>
              </span>
            </div>
          </Row>
        )}
      </React.Fragment>
    );
  }
}

export default Header;
