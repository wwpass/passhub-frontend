import React, { Component, createRef } from "react";
import { saveAs } from "file-saver";

class ViewFile extends Component {
  ext = "";
  constructor(props) {
    super(props);
    this.imgRef = React.createRef();
    this.iframeRef = React.createRef();
  }

  componentWillUnmount = () => {
    // console.log("viewFile will unmount", this.ext);
  };

  componentWillUpdate = () => {
    // console.log("viewFile will update", this.props, this.ext);
  };

  componentWillMount = () => {
    // console.log("viewFile will mount", this.ext);
  };

  componentDidUpdate = () => {
    // console.log("viewFile did update", this.props, this.ext);
    if (this.props.show) {
      if (this.ext == "pdf") {
        const obj_url = URL.createObjectURL(this.props.blob);
        this.iframeRef.current.setAttribute("src", obj_url);
        URL.revokeObjectURL(obj_url);
        //    this.forceUpdate();
      } else if (this.ext != "") {
        const self = this;
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          function () {
            const imgElement = self.imgRef.current;
            imgElement.src = reader.result;
            imgElement.onload = function () {
              const { naturalHeight, naturalWidth } = imgElement;
              const { width, height } = imgElement.parentElement;
              console.log(naturalHeight, naturalWidth);
              console.log(width, height);
            };
            // set_size();
            //     this.forceUpdate();
          },
          false
        );
        reader.readAsDataURL(this.props.blob);
      }
    }
  };

  componentDidMount = () => {
    // console.log("viewFile did mount", this.ext);
    if (this.ext == "pdf") {
      const obj_url = URL.createObjectURL(this.props.blob);
      this.iframeRef.current.setAttribute("src", obj_url);
      URL.revokeObjectURL(obj_url);
      this.forceUpdate();
    } else if (this.ext != "") {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        function () {
          this.imgRef.current.src = reader.result;
          console.log(this.imgRef.current);
          // set_size();
          //this.forceUpdate();
        },
        false
      );
      reader.readAsDataURL(this.props.blob);
    }
    return;
  };

  download = () => {
    saveAs(this.props.blob, this.props.filename);
  };

  render() {
    // console.log("viewFile render", this.props, this.ext);
    if (!this.props.show) {
      return null;
    }
    const { filename } = this.props;

    const dot = filename.lastIndexOf(".");
    this.ext = filename.substring(dot + 1).toLowerCase();

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "black",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="view-file-cross" onClick={this.props.gotoMain}>
          <svg width="40" height="40">
            <use href="#f-cross"></use>
          </svg>
        </div>
        <div
          className="d-sm-none"
          style={{
            display: "flex",
            alignItems: "center",
            margin: "0 16px 0 72px",
            padding: "16px 0 16px 0",
          }}
        >
          <div className="view-file-filename">{filename}</div>
          {this.ext !== "pdf" && (
            <button
              onClick={this.download}
              className="btn btn-as-span"
              style={{
                background: "white",
                borderRadius: "12px",
                width: "48px",
              }}
            >
              <svg width="24" height="24" fill="none" stroke="black">
                <use href="#f-simple-download"></use>
              </svg>
            </button>
          )}
        </div>
        <div
          className="d-none d-sm-flex"
          style={{
            alignItems: "center",
            margin: "0 72px",
            padding: "20px 0 16px 0",
          }}
        >
          <div className="view-file-filename">{filename}</div>
          {this.ext !== "pdf" && (
            <button
              onClick={this.download}
              className="btn btn-as-span"
              style={{
                background: "white",
                color: "black",
                borderRadius: "12px",
              }}
            >
              <svg width="24" height="24" fill="none" stroke="black">
                <use href="#f-simple-download"></use>
              </svg>
              Download
            </button>
          )}
        </div>
        {this.ext == "pdf" ? (
          <div
            className="img-frame"
            style={{ flexGrow: 1, background: "none" }}
          >
            <iframe
              ref={this.iframeRef}
              style={{ width: "100%", height: "100%" }}
            ></iframe>
          </div>
        ) : (
          <div
            className="img-frame"
            style={{
              flexGrow: 1,
              background: "none",
              overflow: "hidden",
              marginBottom: "32px",
            }}
          >
            <img
              ref={this.imgRef}
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                margin: "0 auto",
                boxShadow: "0px 10px 35px rgba(0, 0, 0, 0.2)",
              }}
            ></img>
          </div>
        )}
      </div>
    );
  }
}

export default ViewFile;

/*
          <div
            className="green70"
            style={{ cursor: "pointer", margin: "16px 0 16px 0" }}
            onClick={this.props.gotoMain}
          >
            <svg
              width="24"
              height="24"
              style={{
                fill: "#009a50",
                transform: "rotate(90deg)",
              }}
            >
              <use href="#angle"></use>
            </svg>
            Back
          </div>
*/
