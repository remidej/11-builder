import React from 'react'
import ReactDOM from 'react-dom'
import PlayerCard from './PlayerCard.jsx'

export default class Pitch extends React.Component {
  componentDidMount() {
    const boundings = ReactDOM.findDOMNode(this).getBoundingClientRect()
    const frame = {
      top: boundings.top,
      right: boundings.right,
      bottom: boundings.bottom,
      left: boundings.left
    }
    this.setState({ frame })
  }
  render() {
    return (
      <div className="Pitch">
        <div>
          <h2 className="LineupName">My lineup</h2>
          {this.props.playersList.map(player => (
            <PlayerCard
              player={player}
              key={player.id}
              parentFrame={this.state.frame}
            />
          ))}
        </div>
      </div>
    )
  }
}
