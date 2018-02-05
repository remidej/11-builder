// Team of the week: https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22page%22:1,%22quality%22:%22totw_gold%22,%22position%22:%22GK%22%7D

import React, { Component } from 'react'
import './App.css'
import SearchPlayer from './components/SearchPlayer.jsx'
import Customize from './components/Customize.jsx'
const html2canvas = require("html2canvas")

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      playersIndex: require('./data/index.json'),
      activeTactic: require('./tactics/4-3-3.json'),
      activeTacticName: "4-3-3",
      fileBackups: {}
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
    html2canvas(document.querySelector('.Pitch'), {scale: 2})
      .then(canvas => {
        // Create image download on call to action
        const button = document.querySelector(".CTA")
        button.classList.remove("disabled")
        button.download = "lineup.png"
        button.href = canvas.toDataURL("image/png")
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
          />
          <Customize
            activeTacticName={this.state.activeTacticName}
            setActiveTactic={this.setActiveTactic}
            createCanvas={this.createCanvas}
          />
        </div>
      </div>
    )
  }
}

export default App
