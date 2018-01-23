import React from 'react'
import ReactDOM from 'react-dom';

export default class PlayersCards extends React.Component {
  componentDidMount() {
    ReactDOM.findDOMNode(this).addEventListener('mousedown', e => {
      this.dragStart(e.clientX, e.clientY)
    })
  }

  dragStart = (x, y) => {
    console.log(`x: ${x}, y: ${y}`)
  }

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