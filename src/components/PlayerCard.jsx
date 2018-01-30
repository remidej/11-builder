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
      lastTouch: {x: 0, y: 0},
      activePosition: ""
    }
  }

  componentDidMount() {
    // Auto position the player
    mainLoop: for (let preferredPosition of this.props.player.positions) {
      // Support for 2 central defenders
      if (preferredPosition === 'DC') {
        if (this.props.occupiedPositions.find(e => e === 'DC1') === undefined) {
          preferredPosition = "DC1"
        } else {
          preferredPosition = "DC2"
        }
      }
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
            this.positionPlayer(position)
            break mainLoop
          } else if (preferredPosition === this.props.player.positions[this.props.player.positions.length - 1]) {
            this.findClosestPosition()
            break mainLoop
          }
        }
      }
      this.findClosestPosition()
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
      // Add hover style
      ReactDOM.findDOMNode(this).style.background = 'rgba(0, 0, 0, 0.2)'
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
        // Remove the hover style
        ReactDOM.findDOMNode(this).style.background = 'transparent'
        this.dragEnd(this.state.lastTouch.x, this.state.lastTouch.y)
      }
    })
  }

  positionPlayer = position => {
    ReactDOM.findDOMNode(this).style.left = `${this.props.tactic[position].x - 8.5}%`
    ReactDOM.findDOMNode(this).style.top = `${this.props.tactic[position].y - 8.75}%`
    this.props.occupyPosition(position)
    this.setState({ activePosition: position })
    // Hide position indicator 
    document.querySelector(`[data-position='${position}']`).style.opacity = 0
  }

  findClosestPosition = () => {
    let positionIndex = -1
    const keys = Object.keys(this.props.tactic)
    for (let i=0; i<keys.length; i++) {
      if (this.props.player.positions[0] === keys[i]) {
        positionIndex = i
      }
    }
    // Search in both directions at the same time
    let closestPosition = -1
    let i = positionIndex
    let j = positionIndex
    if (positionIndex > 0) {
      i--
    }
    if (positionIndex < 10) {
      j++
    }
    while (closestPosition < 0) {
      // Check if next positions are available
      for (const position of this.props.occupiedPositions) {
        if (position !== keys[i]) {
          closestPosition = i
        } else if (position !== keys[j]) {
          closestPosition = j
        } else {
          // Check further positions
          if (i>0) {
            i--
          }
          if (j<10) {
            j++
          }
        }
      }
      // Prevent infinite loop
      break
    }
    if (closestPosition >= 0) {
      this.positionPlayer(keys[closestPosition])
    }
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
        // Reset position indicator
        this.props.unoccupyPosition(this.state.activePosition)
        document.querySelector(`[data-position='${this.state.activePosition}']`).style.opacity = 1
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