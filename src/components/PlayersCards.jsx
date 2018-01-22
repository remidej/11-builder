import React from 'react'

export default class PlayersCards extends React.Component {
  constructor(props) {
    super(props)
    for (const player in this.props.playersList) {
      player.shortName = 'lol'
      console.log(player.shortName)
    }
  }

  render() {
    return (
      <div>
        { this.props.playersList.map(player => (
          <div className="PlayerCard" key={player.id}>
            <img className="Portrait" src={player.photo} alt={player.name}/>
            <p>{player.name}</p>
          </div>
        )) }
      </div>
    )
  }
}