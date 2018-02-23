import React from "react"
import ReactDOM from "react-dom"
import PlayerCard from "./PlayerCard.jsx"
import PositionIndicator from "./PositionIndicator.jsx"

// Cache pitch image for offline use
import pitchImage from "../data/pitch.svg"

export default class Pitch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: "",
      occupiedPositions: []
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.getPitchCoords)
    this.getPitchCoords()
    this.setState({ lineupName: 'My team' })
    // Hide lineup name field on every click outside of it
    document.addEventListener("touchstart", e => {
      if (e.target !== document.querySelector(".EditLineupName")) {
        this.props.hideNameInput()
      }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    // Only trigger if tactic is changed
    if (this.props.tactic !== prevProps.tactic) {
      // Save occupied positions before rearranging positions
      const lockedOccupiedPositions = Array.from(this.state.occupiedPositions)
      for (const position of lockedOccupiedPositions) {
        const cardToMove = document.querySelector(`[data-active-position='${position}']`)
        this.unoccupyPosition(position)
        this.positionPlayer(position, cardToMove.classList[1])
      }
    }
  }

  getPitchCoords = () => {
    const frame = ReactDOM.findDOMNode(this).getBoundingClientRect()
    this.setState({ frame })
  }

  editLineupName = e => {
    this.setState({
      lineupName: e.target.value
    })
    // Disable direct download
    if (this.props.playersList.length === 11) {
      this.props.markDownloadAsObsolete()
    }
  }

  occupyPosition = position => {
    if (typeof (this.state.occupiedPositions.find(e => e === position)) === "undefined") {
      let newPositions = this.state.occupiedPositions
      newPositions.push(position)
      this.setState({
        occupiedPositions: newPositions
      })
    }
  }

  unoccupyPosition = position => {
    let newPositions = this.state.occupiedPositions
    // Delete selected position from array
    for (let i=0; i<this.state.occupiedPositions.length; i++) {
      if (this.state.occupiedPositions[i] === position) {
        newPositions.splice(i, 1)
      }
    }
    this.setState({ occupiedPositions: newPositions })
  }

  positionPlayer = (position, selector) => {
    const card = document.querySelector(`.${selector}`)
    // Position card
    card.style.left = `${this.props.tactic[position].x - 8.5}%`
    card.style.top = `${this.props.tactic[position].y - 7.5}%`
    card.style.transform = 'unset'
    // Update data
    this.occupyPosition(position)
    card.dataset.activePosition = position
    // Disable direct download
    if (this.props.playersList.length === 11) {
      this.props.markDownloadAsObsolete()
    }
  }

  showNameInput = () => {
    if (window.innerWidth >= 910 || document.querySelectorAll(".Result-player").length >= 0) {
      document.querySelector(".EditLineupName").focus()
      document.querySelector(".EditLineupName").style.opacity = "1 !important"
    }
  }

  render() {
    // Create skeleton
    return (
      <div className="Pitch">
        <img className="Outlines" src={pitchImage} alt="Pitch outlines"/>
        <div>
          <div className="Signature">11builder.com</div>
          <div className="Trash">Drag out of pitch to remove player</div>
          <textarea
            className="EditLineupName"
            rows="1"
            maxLength="21"
            value={this.state.lineupName}
            onChange={this.editLineupName}
            onMouseEnter={e => {
              e.preventDefault()
              this.showNameInput()
            }}
            onMouseLeave={() => {this.props.hideNameInput()}}
            onTouchStart={() => {this.showNameInput()}}
          />
          <h2 className="LineupName">{this.state.lineupName}</h2>
          { Object.keys(this.props.tactic).map(positionKey => {
            return (
              <PositionIndicator
                key={positionKey}
                position={positionKey}
                leftValue={`${this.props.tactic[positionKey].x}%`}
                topValue={`${this.props.tactic[positionKey].y}%`}
                occupied={
                  typeof(this.state.occupiedPositions.find(e => e===positionKey)) !== "undefined"
                }
              />
            )
          }) }
          { this.props.playersList.map(player => {
            return(
              <PlayerCard
                player={player}
                key={player.id}
                tactic={this.props.tactic}
                parentFrame={this.state.frame}
                unselectPlayer={this.props.unselectPlayer}
                occupiedPositions={this.state.occupiedPositions}
                playersList={this.props.playersList}
                occupyPosition={this.occupyPosition}
                unoccupyPosition={this.unoccupyPosition}
                positionPlayer={this.positionPlayer}
                markDownloadAsObsolete={this.props.markDownloadAsObsolete}
                portraitPlaceholder={this.props.portraitPlaceholder}
              />
            )
          }) }
        </div>
      </div>
    )
  }
}