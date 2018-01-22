import React from 'react'
import PlayersCards from './PlayersCards.jsx'

export default class Pitch extends React.Component {
  dragStart = (x, y) => {
    console.log(`x: ${x}, y: ${y}`)
  }
  render() {
    return (
      <div className="Pitch basic">
        <PlayersCards
          playersList={this.props.playersList}
          onMouseDown={e => {this.dragStart(e.clientX, e.clientY)}}
        />
      </div>
    )
  }
}
