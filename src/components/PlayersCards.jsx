import React from 'react'

export default class PlayersCards extends React.Component {
  // constructor(props) {
  //   super(props)
  // }
  
  render() {
    return (
      <div>
        { this.props.playersList.map(player => (
          <div className="playerCard">
            <p>{player.name}</p>
          </div>
        )) }
      </div>
    )
  }
}