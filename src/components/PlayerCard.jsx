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
      originY: 0,
      toBeDeleted: false,
      lastTouch: {x: 0, y: 0}
    }
  }

  componentDidMount() {
    //console.log(this.props.occupiedPositions)
    // Auto position the player
    mainLoop: for (let preferredPosition of this.props.player.positions) {
      for (const position in this.props.tactic) {
        // Check if the position is part of the selected tactic
        if (preferredPosition === position) {
          // Check if position is available
          let isAvailable = true
          for (const occupiedPosition of this.props.occupiedPositions) {
            if (occupiedPosition === position) {
              isAvailable = false
            }
          }
          if (isAvailable) {
            // Position player where he belongs
            ReactDOM.findDOMNode(this).style.left = `${this.props.tactic[position].x - 8.5}%`
            ReactDOM.findDOMNode(this).style.top = `${this.props.tactic[position].y - 8.75}%`
            this.props.occupyPosition(position)
            break mainLoop
          }
        }
      }
    }
    // Start drag
    ReactDOM.findDOMNode(this).addEventListener('mousedown', e => {
      this.dragStart(e.clientX, e.clientY)
    })
    ReactDOM.findDOMNode(this).addEventListener('touchstart', e => {
      this.dragStart(e.touches[0].clientX, e.touches[0].clientY)
      // Save position to prepare touchend
      this.setState({
        lastTouch: { x: e.touches[0].clientX, y: e.touches[0].clientY }
      })
    })
    // Calculate drag distance
    ReactDOM.findDOMNode(this).addEventListener('mousemove', e => {
      // Only drag if mouse is being pressed
      if (this.state.isDragging) {
        this.dragMove(e.clientX, e.clientY)
      }
    })
    ReactDOM.findDOMNode(this).addEventListener('touchmove', e => {
      // Only drag if mouse is being pressed
      if (this.state.isDragging) {
        // Prevent scroll
        e.preventDefault()
        this.dragMove(e.touches[0].clientX, e.touches[0].clientY)
        // Save position to prepare touchend
        this.setState({
          lastTouch: { x: e.touches[0].clientX, y: e.touches[0].clientY }
        })
      }
    })
    // End drag
    ReactDOM.findDOMNode(this).addEventListener('mouseup', e => {
      if (this.state.isDragging) {
        this.dragEnd(e.clientX, e.clientY)
      }
    })
    ReactDOM.findDOMNode(this).addEventListener('touchend', e => {
      if (this.state.isDragging) {
        this.dragEnd(this.state.lastTouch.x, this.state.lastTouch.y)
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
    // Show bin
    document.querySelector('.Pitch .Trash').classList.add('visible')
  }

  dragMove = (x, y) => {
    const currentPos = ReactDOM.findDOMNode(this).getBoundingClientRect()
    // Prevent dragging outside of Pitch
    if (
      currentPos.left >= this.props.parentFrame.left &&
      currentPos.right <= this.props.parentFrame.right &&
      currentPos.top >= this.props.parentFrame.top &&
      currentPos.bottom <= this.props.parentFrame.bottom
    ) {
      // Update data
      this.setState({
        differenceX: this.state.previousMoveX + x - this.state.originX,
        differenceY: this.state.previousMoveY + y - this.state.originY
      })
      // Move player card visually
      ReactDOM.findDOMNode(this).style.transform = `
        translateX(${this.state.differenceX}px)
        translateY(${this.state.differenceY}px)
      `
    } else {
      // Prevent further dragging
      this.dragEnd()
      ReactDOM.findDOMNode(this).style.background = 'rgba(255, 0, 0, 0.5)'
      window.setTimeout(() => {
        // Delete player
        this.props.unselectPlayer(this.props.player)
      }, 500)
    }
  }

  dragEnd = () => {
    this.setState({
      isDragging: false,
      previousMoveX: this.state.differenceX,
      previousMoveY: this.state.differenceY
    })
    ReactDOM.findDOMNode(this).style.zIndex = "300"
    // Hide bin
    document.querySelector('.Pitch .Trash').classList.remove('visible')
  }

  render() {
    return(
      <div className="PlayerCard" key={this.props.player.id}>
        <img
          className="Portrait"
          src={ this.props.player.photo }
          alt={ this.props.player.name }
          onDragStart={ e => { e.preventDefault() } }
        />
        <p>{this.props.player.shortName}</p>
      </div>
    )
  }
}