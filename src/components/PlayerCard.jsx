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
    // Start drag
    ReactDOM.findDOMNode(this).addEventListener('mousedown', this.dragStart)
    // Calculate drag distance
    ReactDOM.findDOMNode(this).addEventListener('mousemove', e => {
      const offsetX = ReactDOM.findDOMNode(this).getBoundingClientRect().width / 2
      const offsetY = ReactDOM.findDOMNode(this).getBoundingClientRect().height / 2
      this.dragMove(e.clientX - offsetX, e.clientY - offsetY)
    })
    // End drag
    ReactDOM.findDOMNode(this).addEventListener('mouseup', this.dragEnd)
    // Save drag distance
    this.setState({
      originX: ReactDOM.findDOMNode(this).getBoundingClientRect().x,
      originY: ReactDOM.findDOMNode(this).getBoundingClientRect().y,
    })
  }

  dragStart = () => {
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

  dragEnd = () => {
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