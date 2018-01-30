import React from 'react'
import ReactDOM from 'react-dom'
import PlayerCard from './PlayerCard.jsx'

export default class Pitch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
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

  editLineupName = e => {
    this.setState({
      lineupName: e.target.value
    })
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
    console.log(`unoccupy ${this.state.occupiedPositions.length - newPositions.length}`)
    this.setState({ occupiedPositions: newPositions })
  }

  render() {
    // Create skeleton
    return (
      <div className="Pitch">
        <div>
          <div className="Trash">Drag out of pitch to remove player</div>
          <textarea
            className="EditLineupName"
            rows="1"
            maxLength="21"
            value={ this.state.lineupName }
            onChange={ this.editLineupName }
          />
          <h2 className="LineupName">{ this.state.lineupName }</h2>
          { Object.keys(this.props.tactic).map(positionKey => {
            return (
              <PositionIndicator
                key={ positionKey }
                position={ positionKey }
                leftValue={ `${this.props.tactic[positionKey].x}%` }
                topValue={ `${this.props.tactic[positionKey].y}%` }
              />
            )
          }) }
          { this.props.playersList.map(player => {
            return(
              <PlayerCard
                player={ player }
                key={ player.id }
                tactic={ this.props.tactic }
                parentFrame={ this.state.frame }
                unselectPlayer={ this.props.unselectPlayer }
                occupiedPositions={ this.state.occupiedPositions }
                occupyPosition={ this.occupyPosition }
                unoccupyPosition={ this.unoccupyPosition }
              />
            )
          }) }
        </div>
      </div>
    )
  }
}

class PositionIndicator extends React.Component {
  componentDidMount() {
    ReactDOM.findDOMNode(this).style.left = this.props.leftValue
    ReactDOM.findDOMNode(this).style.top = this.props.topValue
  }
  
  render() {
    return(
      <div
        className="PositionIndicator"
        data-position={ this.props.position }
      ></div>
    )
  }
}