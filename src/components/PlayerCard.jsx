import React from 'react'
import ReactDOM from 'react-dom'

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
    ReactDOM.findDOMNode(this).addEventListener('mousedown', e => {
      this.dragStart(e.clientX, e.clientY)
    })
    // Calculate drag distance
    ReactDOM.findDOMNode(this).addEventListener('mousemove', e => {
      // Only drag if mouse is being pressed
      if (this.state.isDragging) {
        this.dragMove(e.clientX, e.clientY)
      }
    })
    // End drag
    ReactDOM.findDOMNode(this).addEventListener('mouseup', e => {
      if (this.state.isDragging) {
        this.dragEnd(e.clientX, e.clientY)
      }
    })
  }

  dragStart = (x, y) => {
    this.setState({
      isDragging: true,
      originX: x,
      originY: y,
      previousMoveX: this.state.previousMoveX,
      previousMoveY: this.state.previousMoveY
    })
    if (this.state.previousMoveX === undefined ) {
      this.setState({ previousMoveX: 0 })
    }
    if (this.state.previousMoveY === undefined ) {
      this.setState({ previousMoveY: 0 })
    }
    ReactDOM.findDOMNode(this).style.zIndex = "400"
  }

  dragMove = (x, y) => {
    const currentPos = ReactDOM.findDOMNode(this).getBoundingClientRect()
    // Prevent dragging outside of Pitch
    if (
      currentPos.left >= this.props.parentFrame.left &&
      currentPos.right <= this.props.parentFrame.right
    ) {
      this.setState({ differenceX: this.state.previousMoveX + x - this.state.originX})
    } else {
      console.log('outside x')
      // Put the card back inside the Pitch
      if (currentPos.left <= this.props.parentFrame.left) {
        console.log('left of pitch')
        this.setState({ differenceX: this.state.differenceX + 3 })
      } else if (currentPos.right >= this.props.parentFrame.right) {
        console.log('right of pitch')
        this.setState({ differenceX: this.state.differenceX - 3 })
      }
      // Prevent further dragging
      this.dragEnd()
    }
    if (
      currentPos.top >= this.props.parentFrame.top &&
      currentPos.bottom <= this.props.parentFrame.bottom
    ) {
      this.setState({ differenceY: this.state.previousMoveY + y - this.state.originY })
    } else {
      console.log('outside y')
      // Put the card back inside the Pitch
      if (currentPos.top <= this.props.parentFrame.top) {
        console.log('top of pitch')
        this.setState({ differenceY: this.state.differenceY + 3 })
      } else if (currentPos.bottom >= this.props.parentFrame.bottom) {
        console.log('bottom of pitch')
        this.setState({ differenceY: this.state.differenceY - 3 })
      }
      // Prevent further dragging
      this.dragEnd()
    }

    ReactDOM.findDOMNode(this).style.transform = `
      translateX(${this.state.differenceX}px)
      translateY(${this.state.differenceY}px)
    `
  }

  dragEnd = () => {
    this.setState({
      isDragging: false,
      previousMoveX: this.state.differenceX,
      previousMoveY: this.state.differenceY
    })
    ReactDOM.findDOMNode(this).style.zIndex = "300"
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