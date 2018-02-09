import React from 'react'

export default class SearchPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: "",
      isLoading: false,
      noMatches: false
    }
  }

  getPlayersData = searchValue => {
    // Find matching players from JSON players index
    const playerFilesPaths = []
    for (const player in this.props.playersIndex) {
      const playerName = player.toLocaleLowerCase()
      // Store the 5 best matches
      if (playerName.includes(searchValue) && playerFilesPaths.length < 5) {
        playerFilesPaths.push(this.props.playersIndex[player])
        this.setState({ isLoading: false })
      }
    }
    // Display loading message if no results are found
    if (playerFilesPaths.length === 0 && !this.state.isLoading) {
      this.setState({
        noMatches: true,
        isLoading: false
      })
    }
    // Get relevant data from JSON files
    let searchResults = []
    for (const playerFilePath of playerFilesPaths) {
      let playerFile = this.props.getPlayerFile(playerFilePath)
      playerFile.shortName = playerFile.name.split(' ').slice(-1).join(' ')
      searchResults.push(playerFile)
    }
    // Sort results by players ranking
    searchResults.sort((a, b) => { return b.rating - a.rating })
    //this.setState({ results: searchResults })
    this.props.setResults(searchResults)
  }

  updateSearch = e => {
    // Display loading message
    this.setState({
      value: e.target.value,
      noMatches: false,
      isLoading: true
    })
    // Prevent adding more than 11 players
    if (this.props.selectedPlayers.length < 11) {
      // Trigger search
      this.getPlayersData(e.target.value.toLocaleLowerCase().normalize().replace(/\s/g, ''))
    }
  }

  updateValue = newValue => {
    this.setState({ value: newValue })
  }

  render() {
    return (
      <div>
        <input
          className="Search-player"
          type="search"
          value={this.state.value}
          onFocus={() => { document.querySelector('.Results').style.display = 'block' }}
          onChange={this.updateSearch}
          placeholder="Search for a player..."
          autoFocus
        />
        <div className="Results">
          {this.state.noMatches &&
            <div className="Result-player">
              <p className="Status">No matching player</p>
            </div>
          }
          {this.props.selectedPlayers.length < 11 &&
          this.state.value !== "" &&
          this.props.results.map(player => (
            // Create result list from search results
            <SearchResult
              player={player}
              selectPlayer={this.props.selectPlayer}
              updateValue={this.updateValue}
            />
          ))}
          {this.state.isLoading &&
            // Display loading messages while waiting for results
            <div className="Result-player">
              <p className="Status">Loading players...</p>
            </div>
          }
          {this.props.selectedPlayers.length >= 11 &&
            <div className="Result-player">
              <p className="Status">Can't add more players</p>
            </div>
          }
        </div>
      </div>
    )
  }
}

class SearchResult extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      picture: "./data/images/placeholders/portrait.svg",
      logo: "./data/images/placeholders/logo.svg",
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
    actualLogo.src = this.state.pictureBackup
  }

  render() {
    return(
      <div
        key={this.props.player.id}
        className="Result-player grabbable"
        onClick={() => {
          this.props.selectPlayer(this.props.player)
          this.props.updateValue("")
        }}
      >
        <img alt={this.props.player.name} src={this.state.picture} className="Photo" />
        <p className="Name">{this.props.player.name}</p>
        <img
          className="Icon"
          alt={this.props.player.club.name}
          src={this.state.logo}
        />
      </div>
    )
  }
}