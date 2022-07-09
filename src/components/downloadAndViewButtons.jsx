import React, { Component } from "react";

class DownloadAndViewButtons extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        {this.props.view && (
          <div
            className="download-and-view view-only d-sm-none"
            style={{ marginBottom: "8px", width: "100%" }}
          >
            <button className="btn-as-span" onClick={this.props.onView}>
              <svg width="24" height="26" fill="none">
                <use href="#f-eye-grey"></use>
              </svg>
              View
            </button>
          </div>
        )}

        <div
          className="download-and-view view-only d-sm-none"
          style={{ marginBottom: "40px", width: "100%" }}
        >
          <button className="btn-as-span" onClick={this.props.onDownload}>
            <svg width="24" height="24" fill="none">
              <use href="#f-simple-download"></use>
            </svg>
            Download
          </button>
        </div>
        <div
          className="download-and-view view-only d-none d-sm-block"
          style={{ marginBottom: "74px" }}
        >
          {this.props.view && (
            <button
              className="btn-as-span"
              onClick={this.props.onView}
              style={{ borderRight: "1px solid rgba(27, 27, 38, 0.3)" }}
            >
              <svg width="24" height="26" fill="none">
                <use href="#f-eye-grey"></use>
              </svg>
              View
            </button>
          )}
          <button className="btn-as-span" onClick={this.props.onDownload}>
            <svg width="24" height="24" fill="none">
              <use href="#f-simple-download"></use>
            </svg>
            Download
          </button>
        </div>
      </React.Fragment>
    );
  }
}

export default DownloadAndViewButtons;
