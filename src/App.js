// Team of the week: https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22page%22:1,%22quality%22:%22totw_gold%22,%22position%22:%22GK%22%7D

// Import components
import React from 'react'
import './App.css'
import Search from './components/Search.jsx'
import Customize from './components/Customize.jsx'
import Pitch from './components/Pitch.jsx'

// Import dependencies
const rasterizeHTML = require("rasterizehtml")
const computedToInline = require("computed-style-to-inline-style")

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playersIndex: require('./data/index.json'),
      activeTactic: require('./tactics/4-3-3.json'),
      activeTacticName: "4-3-3",
      fileBackups: {},
      selectedPlayers: [],
      results: []
    }
  }

  setActiveTactic = tacticName => {
    let newTactic = require(`./tactics/${tacticName}.json`)
    this.setState({
      activeTactic: newTactic,
      activeTacticName: tacticName
    })
    // Update rendered canvas
    if (this.state.selectedPlayers.length === 11) {
      window.setTimeout(() => {
        this.createCanvas()
      }, 400)
    }
  }

  createCanvas = () => {
    // Fix playerCard hover style by overriding inline styles
    const style = document.createElement("style")
    style.type = "text/css"
    style.innerText = ".PlayerCard {background: transparent !important;} .EditLineupName {opacity: 0 !important;}"
    document.body.appendChild(style)
    // Create canvas to draw pitch
    const canvas = document.createElement("canvas")
    const domPitch = document.querySelector(".Pitch")
    const width = domPitch.getBoundingClientRect().width * 2
    canvas.width = width
    canvas.height = width
    // Reset Pitch transform to just before screenshot
    if (window.innerWidth <= 910) {
      domPitch.classList.remove("Transform")
      domPitch.style.transform = "unset"
    }
    computedToInline(domPitch, {recursive: true})
    // Revert Pitch transform back to normal
    if (window.innerWidth <= 910) {
      domPitch.classList.add("Transform")
    }
    rasterizeHTML.drawDocument(domPitch, {zoom: 2})
      .then(renderResult => {
        // Create canvas
        const context = canvas.getContext("2d")
        context.drawImage(renderResult.image, 0, 0, width, width, 0, 0, width, width)
        // Prepare download
        const button = document.querySelector(".CTA")
        button.classList.remove("disabled")
        button.download = "lineup.png"
        button.href = canvas.toDataURL("image/png")
        // Fix hover style on textedit
        const editLineupName = document.querySelector(".Pitch .EditLineupName")
        editLineupName.addEventListener("mouseenter", () => {
          style.innerText = `
            ${style.innerText}
            .Pitch .EditLineupName {opacity: 1 !important;}
          `
        })
        editLineupName.addEventListener("mouseleave", () => {
          style.innerText = `
            ${style.innerText}
            .Pitch .EditLineupName {opacity: 0 !important;}
          `
        })
      })
  }

  removeFromIndex = playerName => {
    let newIndex = this.state.playersIndex
    delete newIndex[playerName]
    this.setState({ playersIndex: newIndex })
  }

  addToIndex = playerName => {
    let newIndex = this.state.playersIndex
    newIndex[playerName] = this.state.fileBackups[playerName]
    this.setState({ playersIndex: newIndex })
  }

  addToBackups = player => {
    let newBackups = this.state.fileBackups
    newBackups[player] = this.state.playersIndex[player]
    this.setState({ fileBackups: newBackups })
  }

  removeFromBackups = player => {
    let newBackups = this.state.fileBackups
    delete newBackups[player]
    this.setState({ fileBackups: newBackups })
  }

  getPlayerFile = playerFilePath => {
    //const file = require(`${playerFilePath}`)
    return require(`${playerFilePath}`)
  }

  selectPlayer = playerObject => {
    // Focus Search if not all players were added
    if (this.state.selectedPlayers.length < 10) {
      document.querySelector('.Search-player').focus()
    }
    let newSelection = this.state.selectedPlayers
    newSelection.push(playerObject)
    this.setState({ selectedPlayers: newSelection })
    // Remove selected player from index so it can't be added twice
    const formattedName = playerObject.name.replace(/\s/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    this.addToBackups(formattedName)
    this.removeFromIndex(formattedName)
    // Hide selected player from results
    let newResults = this.state.results
    for (let i = 0; i < this.state.results.length; i++) {
      if (this.state.results[i] === playerObject) {
        newResults.splice(i, 1)
      }
    }
    this.setState({ results: newResults })
    // Prevent adding more than 11 players
    if (this.state.selectedPlayers.length > 10) {
      this.setState({ maxPlayersAmount: true })
    }
  }

  unselectPlayer = playerObject => {
    let newSelection = this.state.selectedPlayers
    for (let i = 0; i < this.state.selectedPlayers.length; i++) {
      if (this.state.selectedPlayers[i] === playerObject) {
        newSelection.splice(i, 1)
      }
    }
    this.setState({ selectedPlayers: newSelection })
    // Put player back in index
    const formattedName = playerObject.name.replace(/\s/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    this.addToIndex(formattedName)
    this.removeFromBackups(formattedName)
    // Make room for new players
    this.setState({ maxPlayersAmount: false })
  }

  setResults = newResults => {
    this.setState({ results: newResults })
  }

  render() {
    return(
      <div className="App">
        <div className="Settings">
          <Search
            tactic={this.state.activeTactic}
            createCanvas={this.createCanvas}
            playersIndex={this.state.playersIndex}
            addToIndex={this.addToIndex}
            removeFromIndex={this.removeFromIndex}
            addToBackups={this.addToBackups}
            removeFromBackups={this.removeFromBackups}
            getPlayerFile={this.getPlayerFile}
            fileBackups={this.state.fileBackups}
            selectedPlayers={this.state.selectedPlayers}
            selectPlayer={this.selectPlayer}
            results={this.state.results}
            setResults={this.setResults}
          />
          <Customize
            activeTacticName={this.state.activeTacticName}
            setActiveTactic={this.setActiveTactic}
            createCanvas={this.createCanvas}
            playersList={this.state.selectedPlayers}
          />
        </div>
        <Pitch
          playersList={this.state.selectedPlayers}
          className="Pitch"
          unselectPlayer={this.unselectPlayer}
          tactic={this.state.activeTactic}
          createCanvas={this.createCanvas}
          selectPlayer={this.state.selectPlayer}
        />
      </div>
    )
  }
}