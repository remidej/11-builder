import React from 'react'
import ReactDOM from 'react-dom'

const html2canvas = require("html2canvas")

export default class Customize extends React.Component {
  render() {
    return(
      <div className="Customize">
        <div
          className="Tactic Menu"
          onClick={() => { this.toggleTacticMenu() }}
        >
          <div className="Options">
            <div data-tactic="433">4-3-3</div>
            <div data-tactic="433">4-3-3</div>
            <div data-tactic="433">4-3-3</div>
            <div data-tactic="433">4-3-3</div>
          </div>
          <p className="Selected">{`Tactic: ${this.props.activeTactic}`}</p>
        </div>
        <div className="Pitch-style Menu">Color: green</div>
        <div
          href="#"
          title="Generate lineup"
          className="CTA"
          onClick={() => {
            // Create canvas from pitch
            html2canvas(document.querySelector('.Pitch'))
              .then(canvas => {
                // TODO: download canvas
              })
          }}
        >Download your lineup as a JPEG</div>
      </div>
    )
  }
}