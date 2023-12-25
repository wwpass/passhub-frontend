import React, { Component } from "react";

class PathElement extends Component {
  render() {
    return (
      <React.Fragment>
        <div
          className="path-element"
          onClick={(e) => {
            this.props.onClick(this.props.folderid);
          }}
        >
          {this.props.name}
        </div>
        {this.props.gt ? " > " : ""}
      </React.Fragment>
    );
  }
}

export default PathElement;
