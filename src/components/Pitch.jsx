import React from 'react'
import PlayersCards from './PlayersCards.jsx'

export default class Pitch extends React.Component {
  render() {
    return (
      <div className="Pitch basic">
        <PlayersCards playersList={this.props.playersList} />
      </div>
    )
  }
}
