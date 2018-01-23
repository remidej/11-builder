import React from 'react'
import PlayerCard from './PlayerCard.jsx'

export default class Pitch extends React.Component {
  render() {
    return (
      <div className="Pitch basic">
        <div>
          {this.props.playersList.map(player => (
            <PlayerCard player={player} key={player.id}/>
          ))}
        </div>
      </div>
    )
  }
}
