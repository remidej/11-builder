import React from "react"

export default class PositionIndicator extends React.Component {
  render() {
    return (
      <div
        className="PositionIndicator"
        data-position={this.props.position}
        style={{
          left: this.props.leftValue,
          top: this.props.topValue,
          opacity: this.props.occupied ? "0" : "1"
        }}
      ></div>
    )
  }
}