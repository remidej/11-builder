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
    const boundings = ReactDOM.findDOMNode(this).getBoundingClientRect()
    const frame = {
      top: boundings.top,
      right: boundings.right,
      bottom: boundings.bottom,
      left: boundings.left
    }
    this.setState({ frame, lineupName: 'My team' })
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
    let newPositions = this.state.occupiedPositions
    newPositions[newPositions.length] = position
    this.setState({
      occupiedPositions: newPositions
    })
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
    card.style.top = `${this.props.tactic[position].y - 8.75}%`
    card.style.transform = 'unset'
    // Update data
    this.occupyPosition(position)
    card.dataset.activePosition = position
    // Hide position indicator 
    document.querySelector(`[data-position='${position}']`).style.opacity = 0
    // Disable direct download
    if (this.props.playersList.length === 11) {
      this.props.markDownloadAsObsolete()
    }
  }

  render() {
    // Create skeleton
    return (
      <div className="Pitch">
        <img className="Outlines" src={pitchImage} alt="Pitch outlines"/>
        <div>
          <div className="Trash">Drag out of pitch to remove player</div>
          <textarea
            className="EditLineupName"
            rows="1"
            maxLength="21"
            value={this.state.lineupName}
            onChange={this.editLineupName}
          />
          <h2 className="LineupName">{this.state.lineupName}</h2>
          { Object.keys(this.props.tactic).map(positionKey => {
            return (
              <PositionIndicator
                key={positionKey}
                position={positionKey}
                leftValue={`${this.props.tactic[positionKey].x}%`}
                topValue={`${this.props.tactic[positionKey].y}%`}
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