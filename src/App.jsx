// Import components
import React from 'react'
import './App.css'
import Search from './components/Search.jsx'
import Customize from './components/Customize.jsx'
import Pitch from './components/Pitch.jsx'
import fonts from "./data/fonts.js"

// Import dependencies
const rasterizeHTML = require("rasterizehtml")
const computedToInline = require("computed-style-to-inline-style")

// Save placeholder images for offline use
const portraitPlaceholder = require("./data/placeholders/portrait.svg")
const logoPlaceholder = require("./data/placeholders/logo.svg")

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playersIndex: require('./data/index.json'),
      activeTactic: require('./tactics/4-3-3.json'),
      activeTacticName: "4-3-3",
      fileBackups: {},
      selectedPlayers: [],
      results: [],
      downloadStatus: "disabled",
      downloadLink: ""
    }
  }

  componentDidMount() {
    document.body.prepend(fonts.fontsStyle)
  }

  setActiveTactic = tacticName => {
    let newTactic = require(`./tactics/${tacticName}.json`)
    this.setState({
      activeTactic: newTactic,
      activeTacticName: tacticName
    })
    // Disable direct download
    if (this.state.selectedPlayers.length === 11) {
      this.markDownloadAsObsolete()
    }
  }

  createCanvas = () => {
    // Loading message
    this.setState({ downloadStatus: "loading" })
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
    const names = document.querySelectorAll(".PlayerCard p")
    for (const name of names) {
      name.style.fontSize = `${window.getComputedStyle(name).fontSize} !important`
    }
    domPitch.prepend(fonts.fontsStyle)
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
        this.setState({
          downloadStatus: "download",
          downloadLink: canvas.toDataURL("image/png")
        })
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

  markDownloadAsObsolete = () => {
    this.setState({ downloadStatus: "create" })
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
      // Enable donwload button
      this.setState({ downloadStatus: "create" })
    }
    // Reset results
    this.setResults([])
  }

  unselectPlayer = playerObject => {
    let newSelection = this.state.selectedPlayers
    for (let i = 0; i < this.state.selectedPlayers.length; i++) {
      if (this.state.selectedPlayers[i] === playerObject) {
        newSelection.splice(i, 1)
      }
    }
    this.setState({
      selectedPlayers: newSelection,
      downloadStatus: "disabled"
    })
    // Put player back in index
    const formattedName = playerObject.name.replace(/\s/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    this.addToIndex(formattedName)
    this.removeFromBackups(formattedName)
  }

  setResults = newResults => {
    this.setState({ results: newResults })
  }

  hideNameInput = () => {
    // Remove focus on lineup name
    document.querySelector(".EditLineupName").style.opacity = "0 !important"
    document.querySelector(".EditLineupName").blur()
  }

  render() {
    return(
      <div className="App">
        <div className="Settings">
          <Search
            tactic={this.state.activeTactic}
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
            logoPlaceholder={logoPlaceholder}
            portraitPlaceholder={portraitPlaceholder}
          />
          <Customize
            activeTacticName={this.state.activeTacticName}
            setActiveTactic={this.setActiveTactic}
            playersList={this.state.selectedPlayers}
            markDownloadAsObsolete={this.markDownloadAsObsolete}
            downloadStatus={this.state.downloadStatus}
            createCanvas={this.createCanvas}
            downloadLink={this.state.downloadLink}
          />
        </div>
        <Pitch
          playersList={this.state.selectedPlayers}
          className="Pitch"
          unselectPlayer={this.unselectPlayer}
          tactic={this.state.activeTactic}
          markDownloadAsObsolete={this.markDownloadAsObsolete}
          portraitPlaceholder={portraitPlaceholder}
          hideNameInput={this.hideNameInput}
        />
      </div>
    )
  }
}