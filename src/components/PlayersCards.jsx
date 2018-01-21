import React from 'react'

export default class PlayersCards extends React.Component {
  render() {
    return (
      <div>
        { this.props.playersList.map(player => (
          <div className="playerCard" key={player.id}>
            <p>{player.name}</p>
          </div>
        )) }
      </div>
    )
  }
}