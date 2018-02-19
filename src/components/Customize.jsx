import React from 'react'

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
      this.outsideClickHandler(tacticButton)
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
      this.outsideClickHandler(colorButton)
    }
  }

  setColor = color => {
    const palette = {
      green: "#2E7D32",
      red: "#921616",
      blue: "#303F9F",
      black: "#212121"
    }
    // Apply color change
    const pitch = document.querySelector('.Pitch')
    pitch.style.background = palette[color]
    // Save color change
    this.setState({ pitchColor: color })
    // Disable direct download
    if (this.props.playersList.length === 11) {
      this.props.markDownloadAsObsolete()
    }
  }

  outsideClickHandler = button => {
    document.addEventListener('click', e => {
      const isClickInside = button.contains(e.target);
      if (!isClickInside) {
        // User clicked outside
        if (button.classList.contains('Tactic') && button.classList.contains('expanded')) {
          // Collapse tactic menu
          e.preventDefault()
          this.toggleTacticMenu()
        } else if (button.classList.contains('Pitch-style') && button.classList.contains('expanded')) {
          // Collapse tactic menu
          e.preventDefault()
          this.toggleColorMenu()
        }
      }
    });
  }

  render() {
    let DownloadButton = null
    if (this.props.downloadStatus === "disabled") {
      DownloadButton = <a
        title="Generate lineup"
        className="CTA disabled"
      >Add 11 players to create lineup</a>
    } else if (this.props.downloadStatus === "create") {
      DownloadButton = <a
        title="Generate lineup"
        className="CTA"
        onClick={() => {
          // Display loading message
          this.props.createCanvas()
        }}
      >Get my lineup</a>
    } else if (this.props.downloadStatus === "loading") {
      DownloadButton = <a
        title="Generate lineup"
        className="CTA disabled"
      >Creating lineup...</a>
    } else {
      DownloadButton = <a
        title="Generate lineup"
        className="CTA"
        download="11builder"
        href={this.props.downloadLink}
      >Donwload lineup as a PNG</a>
    }
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
          <p className="Selected">{`Tactic: ${this.props.activeTacticName}`}</p>
        </div>
        <div
          className="Pitch-style Menu"
          onClick={() => {this.toggleColorMenu()}}
        >
          <div className="Options">
            <div data-tactic="4-3-3" onClick={() => { this.setColor('green') }}>Green</div>
            <div data-tactic="4-3-3" onClick={() => { this.setColor('blue') }}>Blue</div>
            <div data-tactic="4-3-3" onClick={() => { this.setColor('red') }}>Red</div>
            <div data-tactic="4-3-3" onClick={() => { this.setColor('black') }}>Black</div>
          </div>
          <p className="Selected">{`Colour: ${this.state.pitchColor}`}</p>
        </div>
        {DownloadButton}
      </div>
    )
  }
}