import React from "react"
import ReactDOM from "react-dom"

export default class PlayerCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isDragging: false,
      differenceX: 0,
      differenceY: 0,
      originX: 0,
      originY: 0,
      lastTouch: {x: 0, y: 0},
      picture: this.props.portraitPlaceholder,
      pictureBackup: this.props.player.photo
    }
  }

  componentDidMount() {
    // Count loops
    let i = -1
    // Auto position the player
    mainLoop: for (let preferredPosition of this.props.player.positions) {
      i++
      // Support for 2 central defenders
      if (preferredPosition === "DC") {
        if (this.props.occupiedPositions.find(e => e === "DC1") === undefined) {
          preferredPosition = "DC1"
        } else {
          preferredPosition = "DC2"
        }
      }
      // Support for special positions
      if (preferredPosition === "ATT") {
        preferredPosition = "BU"
      } else if (preferredPosition === "MDC" || preferredPosition === "MOC") {
        preferredPosition = "MC"
      } else if (preferredPosition === "DLG") {
        preferredPosition = "DG"
      } else if (preferredPosition === "DLD") {
        preferredPosition = "DD"
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
            this.props.positionPlayer(position, `Player${ this.props.player.id }`)
            break mainLoop
          } else if (i === this.props.player.positions.length - 1) {
            // Last loop, add player anyway
            this.findClosestPosition(preferredPosition)
            break mainLoop
          }
        }
      }
    }
    // Lazyload player picture
    const actualPicture = new Image()
    actualPicture.addEventListener("load", () => {
      // Replace placeholder with real photo once it's ready
      this.setState({ picture: actualPicture.src })
    })
    actualPicture.src = this.state.pictureBackup

    // Set hover style on desktop
    ReactDOM.findDOMNode(this).addEventListener("mouseenter", () => {
      ReactDOM.findDOMNode(this).classList.add("Selected")
    })
    // Remove hover style on desktop
    ReactDOM.findDOMNode(this).addEventListener("mouseleave", () => {
      ReactDOM.findDOMNode(this).classList.remove("Selected")
    })
    // Start drag
    ReactDOM.findDOMNode(this).addEventListener("mousedown", e => {
      this.dragStart(e.clientX, e.clientY)
    })
    ReactDOM.findDOMNode(this).addEventListener("touchstart", e => {
      this.dragStart(e.touches[0].clientX, e.touches[0].clientY)
      // Save position to prepare touchend
      this.setState({
        lastTouch: { x: e.touches[0].clientX, y: e.touches[0].clientY }
      })
      // Add hover style
      ReactDOM.findDOMNode(this).classList.add("Selected")
    })
    // Calculate drag distance
    ReactDOM.findDOMNode(this).addEventListener("mousemove", e => {
      // Only drag if mouse is being pressed
      if (this.state.isDragging) {
        this.dragMove(e.clientX, e.clientY)
      }
    })
    ReactDOM.findDOMNode(this).addEventListener("touchmove", e => {
      // Only drag if mouse is being pressed
      if (this.state.isDragging) {
        // Prevent scroll
        e.preventDefault()
        // Close keyboard
        document.querySelector('.Search-player').blur()
        // Move card around
        this.dragMove(e.touches[0].clientX, e.touches[0].clientY)
        // Save position to prepare touchend
        this.setState({
          lastTouch: { x: e.touches[0].clientX, y: e.touches[0].clientY }
        })
      }
    })
    // End drag
    ReactDOM.findDOMNode(this).addEventListener("mouseup", e => {
      if (this.state.isDragging) {
        this.dragEnd(e.clientX, e.clientY)
      }
    })
    ReactDOM.findDOMNode(this).addEventListener("touchend", e => {
      if (this.state.isDragging) {
        this.dragEnd(this.state.lastTouch.x, this.state.lastTouch.y)
        // Remove the hover style
        ReactDOM.findDOMNode(this).classList.remove("Selected")
      }
    })
  }

  findClosestPosition = preferredPosition => {
    let positionIndex = -1
    const keys = Object.keys(this.props.tactic)
    // Find index of preferred position
    for (let i=0; i<keys.length; i++) {
      if (preferredPosition === keys[i]) {
        positionIndex = i
      }
    }
    // Find closest match
    let closestPosition = -1
    for (const position of keys) {
      if (
        closestPosition === -1 ||
        Math.abs(keys.indexOf(position) - positionIndex) < Math.abs(keys.indexOf(position) - closestPosition)
      ) {
        let isAvailable = true
        for (const occupied of this.props.occupiedPositions) {
          if (occupied === position) {
            isAvailable = false
          }
        }
        if (isAvailable) {
          closestPosition = keys.indexOf(position)
        }
      }
    }
    // Add player to pitch
    this.props.positionPlayer(keys[closestPosition], `Player${this.props.player.id}`)
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
    document.querySelector(".Pitch .Trash").classList.add("visible")
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
      // Get card center relatively to Pitch
      const cardCenterPos = {}
      cardCenterPos.x = 100 * (currentPos.left + (currentPos.width / 2) - this.props.parentFrame.left) / this.props.parentFrame.width
      cardCenterPos.y = 100 * (currentPos.top + (currentPos.height / 2) - this.props.parentFrame.top) / this.props.parentFrame.height

      // Snap to position if dragged next to position indicator
      for (const indicator of Object.keys(this.props.tactic)) {
        if (
          indicator !== ReactDOM.findDOMNode(this).dataset.activePosition &&
          this.getDistance(
            this.props.tactic[indicator].x,
            this.props.tactic[indicator].y,
            cardCenterPos.x,
            cardCenterPos.y
          ) < 8
        ) {
          let isAvailable = true
          for (const occupied of this.props.occupiedPositions) {
            if (occupied === indicator) {
              isAvailable = false
            }
          }
          if (this.props.playersList.length === 11) {
            isAvailable = false
          }
          const activePosition = ReactDOM.findDOMNode(this).dataset.activePosition

          // Swap players if position is occupied
          if (!isAvailable) {
            // Do the reverse travel with the other player
            this.props.unoccupyPosition(indicator)
            const cardToMove = document.querySelector(`[data-active-position='${indicator}']`)
            this.props.positionPlayer(activePosition, cardToMove.classList[1])
          } else {
            // Prepare next drag
            this.props.unoccupyPosition(activePosition)
            this.props.unoccupyPosition(indicator)
          }
          this.setState({
            differenceX: 0,
            differenceY: 0,
          })
          this.dragEnd()
          this.props.positionPlayer(indicator, `Player${this.props.player.id}`)
        }
      }
    } else {
      // Prevent further dragging
      this.dragEnd()
      ReactDOM.findDOMNode(this).style.opacity = "0"
      const activePosition = ReactDOM.findDOMNode(this).dataset.activePosition
      // Delete player after animation end
      window.setTimeout(() => {
        this.props.unselectPlayer(this.props.player)
      }, 300)
      // Reset position indicator
      this.props.unoccupyPosition(activePosition)
      // Prevent direct downloads
      this.props.markDownloadAsObsolete()
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
    document.querySelector(".Pitch .Trash").classList.remove("visible")
    // Disable direct download
    if (this.props.playersList.length === 11) {
      this.props.markDownloadAsObsolete()
    }
    if (window.innerWidth <= 910) {
      const card = document.querySelector(".PlayerCard.Selected")
      card.classList.remove("Selected")
    }
  }

  // Calculate distance between 2 points
  getDistance = (x0, y0, x1, y1) => {
    // Using Pythagore
    const differenceX = x0 - x1
    const differenceY = y0 - y1
    return Math.sqrt(Math.pow(differenceX, 2) + Math.pow(differenceY, 2))
  }

  render() {
    return(
      <div
        className={`PlayerCard Player${this.props.player.id}`}
        key={this.props.player.id}
      >
        <img
          className="Portrait"
          src={ this.state.picture }
          alt={ this.props.player.name }
          onDragStart={ e => { e.preventDefault() } }
        />
        <p>{this.props.player.shortName}</p>
      </div>
    )
  }
}