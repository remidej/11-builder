import React from 'react'

export default class PlayersCards extends React.Component {
  render() {
    return (
      <div>
        { this.props.playersList.map(player => (
          <div className="PlayerCard" key={player.id}>
            <img
              className="Portrait"
              src={player.photo}
              alt={player.name}
              onDragStart={(event) => { event.preventDefault() }}
            />
            <p>{player.shortName}</p>
          </div>
        )) }
      </div>
    )
  }
}