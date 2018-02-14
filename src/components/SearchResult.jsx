import React from 'react'

export default class SearchResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      picture: this.props.portraitPlaceholder,
      logo: this.props.logoPlaceholder,
      pictureBackup: this.props.player.photo,
      logoBackup: this.props.player.club.logo
    }
  }

  componentDidMount() {
    // Lazyload player picture
    const actualPicture = new Image()
    actualPicture.addEventListener("load", () => {
      // Replace placeholder with real photo once it's ready
      this.setState({ picture: actualPicture.src })
    })
    actualPicture.src = this.state.pictureBackup
    // Lazyload club logo
    const actualLogo = new Image()
    actualLogo.addEventListener("load", () => {
      // Replace placeholder with real photo once it's ready
      this.setState({ logo: actualLogo.src })
    })
    actualLogo.src = this.state.logoBackup
  }

  render() {
    return (
      <div
        key={this.props.player.id}
        className="Result-player grabbable"
        onClick={() => {
          if (this.props.lastPlayerToAdd && window.innerWidth <= 910) {
            // Close keyboard before creating screenshot
            document.querySelector('.Search-player').blur()
            this.props.updateValue("")
            this.props.selectPlayer(this.props.player)
          } else {
            this.props.selectPlayer(this.props.player)
            this.props.updateValue("")
          }
        }}
      >
        <img alt={this.props.player.name} src={this.state.picture} className="Photo" />
        {this.props.player.rating !== "0" &&
          <p className="Name">{this.props.player.name}</p>
        }
        {this.props.player.rating === "0" &&
          <p className="Name">Add "{this.props.player.name}"</p>
        }
        <img
          className="Icon"
          alt={this.props.player.club.name}
          src={this.state.logo}
        />
      </div>
    )
  }
}