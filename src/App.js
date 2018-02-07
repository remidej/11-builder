// Team of the week: https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22page%22:1,%22quality%22:%22totw_gold%22,%22position%22:%22GK%22%7D

import React from 'react'
import './App.css'
import SearchPlayer from './components/SearchPlayer.jsx'
import Customize from './components/Customize.jsx'
import Pitch from './components/Pitch.jsx'
//const html2canvas = require("html2canvas")
const rasterizeHTML = require("rasterizehtml")

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
  }

  createCanvas = () => {
    // Generate canvas from pitch
    // html2canvas(document.querySelector('.Pitch'), {scale: 2})
    //   .then(canvas => {
    //     // Create image download on call to action
    //     const button = document.querySelector(".CTA")
    //     button.classList.remove("disabled")
    //     button.download = "lineup.png"
    //     button.href = canvas.toDataURL("image/png")
    //     document.body.appendChild(canvas)
    //   })
    // Create canvas
    const canvas = document.createElement("canvas")
    canvas.width = "540"
    canvas.height = "540"
    document.body.appendChild(canvas)
    const pitch = document.querySelector(".Pitch")
    let newPitch = document.createElement("div")
    var copyComputedStyle = function (from, to) {
      var computed_style_object = false;
      //trying to figure out which style object we need to use depense on the browser support
      //so we try until we have one
      computed_style_object = from.currentStyle || document.defaultView.getComputedStyle(from, null);

      //if the browser dose not support both methods we will return null
      if (!computed_style_object) return null;

      var stylePropertyValid = function (name, value) {
        //checking that the value is not a undefined
        return typeof value !== 'undefined' &&
          //checking that the value is not a object
          typeof value !== 'object' &&
          //checking that the value is not a function
          typeof value !== 'function' &&
          //checking that we dosent have empty string
          value.length > 0 &&
          //checking that the property is not int index ( happens on some browser
          value != parseInt(value)

      };

      //we iterating the computed style object and compy the style props and the values 
      for (const property in computed_style_object) {
        //checking if the property and value we get are valid sinse browser have different implementations
        if (stylePropertyValid(property, computed_style_object[property])) {
          //applying the style property to the target element
          to.style[property] = computed_style_object[property];

        }
      }

    }
    copyComputedStyle(pitch, newPitch)
    console.log(newPitch)
    rasterizeHTML.drawDocument(newPitch, canvas)
    // Prepare download
    const button = document.querySelector(".CTA")
    button.classList.remove("disabled")
    button.download = "lineup.png"
    button.href = canvas.toDataURL("image/png")
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
    // Hide other results on mobile
    if (this.state.selectedPlayers.length < 11) {
      document.querySelector('.Search-player').focus()
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
          <SearchPlayer
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