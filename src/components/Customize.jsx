import React from 'react'
//import ReactDOM from 'react-dom'

const html2canvas = require("html2canvas")

export default class Customize extends React.Component {
  constructor(props) {
    super(props)
    this.state = { pitchColor: 'green' }
  }
  
  toggleTacticMenu = () => {
    const tacticButton = document.querySelector('.Tactic')

    if (tacticButton.classList.contains('expanded')) {
      // Collapse menu
      tacticButton.classList.remove('expanded')
    } else {
      // Expand menu
      tacticButton.classList.add('expanded')
    }
  }
  
  toggleColorMenu = () => {
    const colorButton = document.querySelector('.Pitch-style')

    if (colorButton.classList.contains('expanded')) {
      // Collapse menu
      colorButton.classList.remove('expanded')
    } else {
      // Expand menu
      colorButton.classList.add('expanded')
    }
  }

  setColor = color => {
    // Apply color change
    const pitch = document.querySelector('.Pitch')
    pitch.style.background = color
    // Save color change
    this.setState({ pitchColor: color })
  }

  render() {
    return(
      <div className="Customize">
        <div
          className="Tactic Menu"
          onClick={ () => {this.toggleTacticMenu()} }
        >
          <div className="Options">
            <div data-tactic="4-3-3" onClick={() => { this.props.setActiveTactic('4-3-3') }}>4-3-3</div>
            <div data-tactic="4-3-3" onClick={() => { this.props.setActiveTactic('4-4-2') }}>4-4-2</div>
            <div data-tactic="4-3-3" onClick={() => { this.props.setActiveTactic('3-5-2') }}>3-5-2</div>
            <div data-tactic="4-3-3" onClick={() => { this.props.setActiveTactic('3-4-3') }}>3-4-3</div>
          </div>
          <p className="Selected">{`Tactic: ${this.props.activeTactic}`}</p>
        </div>
        <div
          className="Pitch-style Menu"
          onClick={() => {this.toggleColorMenu()} }
        >
          <div className="Options">
            <div data-tactic="4-3-3" onClick={() => { this.setColor('blue') }}>Blue</div>
            <div data-tactic="4-3-3" onClick={() => { this.setColor('red') }}>Red</div>
            <div data-tactic="4-3-3" onClick={() => { this.setColor('orange') }}>Orange</div>
            <div data-tactic="4-3-3" onClick={() => { this.setColor('black') }}>Black</div>
          </div>
          <p className="Selected">{`Colour: ${this.state.pitchColor}`}</p>
        </div>
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