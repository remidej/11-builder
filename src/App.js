// Team of the week: https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22page%22:1,%22quality%22:%22totw_gold%22,%22position%22:%22GK%22%7D

import React, { Component } from 'react'
import './App.css'
import Pitch from './components/Pitch.jsx'

const playersIndex = require('./data/index.json')
let tactic = require('./tactics/442.json')

class App extends Component {
  render() {
    return(
      <div className="App">
        <div className="Settings">
          <SearchPlayer addPlayerToState={this.addPlayerToState}/>
          <div className="Customize">
            <select className="Tactic" defaultValue="433">
              <option value="442">4 - 4 - 2</option>
              <option value="433">4 - 3 - 3</option>
              <option value="352">3 - 5 - 2</option>
            </select>
            <select className="Pitch-style" defaultValue="simple">
              <option value="simple">Simple</option>
              <option value="futuristic">Futuristic</option>
            </select>
            <div href="#" title="Generate lineup" className="CTA">
              Download your lineup as a JPEG
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class SearchPlayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: "",
      isLoading: false,
      noMatches: false,
      results: [],
      selectedPlayers: [],
      fileBackups: {},
      maxPlayersAmount: false
    }
  }

  getPlayersData = searchValue => {
    // Find matching players from JSON players index
    const playerFilesPaths = []
    for (const player in playersIndex) {
      const playerName = player.toLocaleLowerCase()
      // Store the 5 best matches
      if (playerName.includes(searchValue) && playerFilesPaths.length < 5) {
        playerFilesPaths.push(playersIndex[player])
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
      let playerFile = require(`${playerFilePath}`)
      playerFile.shortName = playerFile.name.split(' ').slice(-1).join(' ')
      searchResults.push(playerFile)
    }
    // Sort results by players ranking
    searchResults.sort((a, b) => { return b.rating - a.rating })
    this.setState({ results: searchResults })
  }

  updateSearch = e => {
    // Display loading message
    this.setState({
      value: e.target.value,
      noMatches: false,
      isLoading: true
    })
    // Prevent adding more than 11 players
    if (this.state.selectedPlayers.length < 11) {
      // Trigger search
      this.getPlayersData(e.target.value.toLocaleLowerCase().normalize().replace(/\s/g, ''))
    } else {
      console.log('already 11')
    }
  }

  selectPlayer = playerObject => {
    let newSelection = this.state.selectedPlayers
    newSelection.push(playerObject)
    this.setState({ selectedPlayers: newSelection })
    // Remove selected player from index so it can't be added twice
    const formattedName = playerObject.name.replace(/\s/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    let newBackups = this.state.fileBackups
    newBackups[formattedName] = playersIndex[formattedName]
    this.setState({ fileBackups: newBackups })
    delete playersIndex[formattedName]
    // Hide selected player from results
    let newResults = this.state.results
    for (let i=0; i<this.state.results.length; i++) {
      if (this.state.results[i] === playerObject) {
        newResults.splice(i, 1)
      }
    }
    this.setState({ results: newResults })
    // Prevent adding more than 11 players
    if (this.state.selectedPlayers.length > 10) {
      this.setState({ maxPlayersAmount: true })
    }
    // Hide other results on mobile
    if (window.innerWidth < 910) {
      document.querySelector('.Results').style.display = 'none'
    }
  }

  unselectPlayer = playerObject => {
    console.log(playerObject)
    let newSelection = this.state.selectedPlayers
    for (let i=0; i<this.state.selectedPlayers.length; i++) {
      if (this.state.selectedPlayers[i] === playerObject) {
        newSelection.splice(i, 1)
      }
    }
    this.setState({ selectedPlayers: newSelection })
    // Put player back in index
    const formattedName = playerObject.name.replace(/\s/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    playersIndex[formattedName] = this.state.fileBackups[formattedName]
    // Make room for new players
    this.setState({ maxPlayersAmount: false })
  }

  render() {
    return (
      <div>
        <input
          className="Search-player"
          type="search"
          value={ this.state.value }
          onFocus = { () => { document.querySelector('.Results').style.display = 'block'} }
          onChange={ this.updateSearch }
          placeholder="Search for a player..."
          autoFocus
        />
        <div className="Results">
          { this.state.noMatches &&
            <div className="Result-player">
              <p className="Status">No matching player</p>
            </div>
          }
          { !this.state.maxPlayersAmount && this.state.results.map(player => (
            // Create result list from search results
            <div
              key={player.id}
              className="Result-player grabbable"
              onClick={ () => {this.selectPlayer(player)} }
            >
              <img alt={player.name} src={player.photo} className="Photo" />
              <p className="Name">{player.name}</p>
              <img
                className="Icon"
                alt={`${player.name}'s club`}
                src={player.club.logo}
              />
              <img
                className="Flag"
                alt={`${player.name}'s nation`}
                src={player.flag}
              />
            </div>
          )) }
          { this.state.isLoading &&
            // Display loading messages while waiting for results
            <div className="Result-player">
              <p className="Status">Loading players...</p>
            </div>
          }
          { this.state.maxPlayersAmount &&
            <div className="Result-player">
              <p className="Status">Can't add more players</p>
            </div>
          }
        </div>
				<Pitch
          playersList={this.state.selectedPlayers}
          className="Pitch"
          unselectPlayer={this.unselectPlayer}
          tactic={ tactic }
        />
      </div>
    )
  }
}

export default App
