import React from 'react'
import ReactDOM from 'react-dom'
import PlayerCard from './PlayerCard.jsx'

export default class Pitch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: ''
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

  editLineupName = (e) => {
    this.setState({
      lineupName: e.target.value
    })
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
                parentFrame={ this.state.frame }
                unselectPlayer={ this.props.unselectPlayer }
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
    console.log(ReactDOM.findDOMNode(this))
  }
  
  render() {
    return(
      <div
        className="PositionIndicator"
        data-position={ this.props.positionKey }
      ></div>
    )
  }
}