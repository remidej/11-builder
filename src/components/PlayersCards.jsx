import React from 'react'
import ReactDOM from 'react-dom';

export default class PlayersCards extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isDragging: false,
      differenceX: 0,
      differenceY: 0,
      originX: 0,
      originY: 0
    }
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this).addEventListener('mousedown', e => {
      this.dragStart(e.clientX, e.clientY)
    })
    ReactDOM.findDOMNode(this).addEventListener('mousemove', e => {
      this.dragMove(e.clientX, e.clientY)
    })
    ReactDOM.findDOMNode(this).addEventListener('mouseup', e => {
      this.dragEnd(e.clientX, e.clientY)
    })
    this.setState({
      originX: ReactDOM.findDOMNode(this).getBoundingClientRect().x,
      originY: ReactDOM.findDOMNode(this).getBoundingClientRect().y,
    })
  }

  dragStart = (x, y) => {
    this.setState({ isDragging: true })
  }

  dragMove = (x, y) => {
    if (this.state.isDragging) {
      this.setState({
        differenceX:  x - this.state.originX,
        differenceY:  y - this.state.originY
      })
      ReactDOM.findDOMNode(this).querySelector('div').style.transform = `
        translateX(${this.state.differenceX}px)
        translateY(${this.state.differenceY}px)
      `
      ReactDOM.findDOMNode(this).querySelector('div').style.background = 'magenta'
    }

  }

  dragEnd = (x, y) => {
    this.setState({ isDragging: false })
    ReactDOM.findDOMNode(this).querySelector('div').style.background = 'red'
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