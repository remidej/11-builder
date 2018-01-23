import React from 'react'
import ReactDOM from 'react-dom';

export default class PlayerCard extends React.Component {
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
      const offsetX = ReactDOM.findDOMNode(this).getBoundingClientRect().width / 2
      const offsetY = ReactDOM.findDOMNode(this).getBoundingClientRect().height / 2
      this.dragStart(e.clientX - offsetX, e.clientY - offsetY)
    })
    ReactDOM.findDOMNode(this).addEventListener('mousemove', e => {
      const offsetX = ReactDOM.findDOMNode(this).getBoundingClientRect().width / 2
      const offsetY = ReactDOM.findDOMNode(this).getBoundingClientRect().height / 2
      this.dragMove(e.clientX - offsetX, e.clientY - offsetY)
    })
    ReactDOM.findDOMNode(this).addEventListener('mouseup', e => {
      const offsetX = ReactDOM.findDOMNode(this).getBoundingClientRect().width / 2
      const offsetY = ReactDOM.findDOMNode(this).getBoundingClientRect().height / 2
      this.dragEnd(e.clientX - offsetX, e.clientY - offsetY)
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
        differenceX: x - this.state.originX,
        differenceY: y - this.state.originY
      })
      ReactDOM.findDOMNode(this).style.transform = `
        translateX(${this.state.differenceX}px)
        translateY(${this.state.differenceY}px)
      `
    }
  }

  dragEnd = (x, y) => {
    this.setState({ isDragging: false })
  }

  render() {
   return(
    <div className="PlayerCard" key={this.props.player.id}>
      <img
        className="Portrait"
        src={this.props.player.photo}
        alt={this.props.player.name}
        onDragStart={e => { e.preventDefault() }}
      />
      <p>{this.props.player.shortName}</p>
    </div>
  )
 }
}