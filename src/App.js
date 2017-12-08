// Team of the week: https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22page%22:1,%22quality%22:%22totw_gold%22,%22position%22:%22GK%22%7D

import React, { Component } from 'react'
import './App.css'

// Prepare API calls
const proxy = 'https://cors-anywhere.herokuapp.com/'
const urlStart = 'https://www.easports.com/uk/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B"name":"'
const urlEnd = '"%7D'
const request = new XMLHttpRequest();
request.overrideMimeType("application/json")
let requestResult
let requestResults = []

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="Settings">
          <h2 className="Sub-title">Create your lineup!</h2>
          <SearchPlayer/>
          <Results/>
        </div>
        <Pitch/>
      </div>
    )
  }
}

class SearchPlayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      results: []
    }
    // Force method binding to React component
    this.updateSearch = this.updateSearch.bind(this);
  }

  updateSearch(event) {
    this.setState({ value: event.target.value })
    // TODO: find better fix
    window.setTimeout(() => {
      this.setState({
        results: getPlayersData(this.state.value)
      })
    }, 10)
  }

  render() {
    return (
      <input
        className="Search-player"
        type="search"
        value={this.state.value}
        onChange={this.updateSearch}
        placeholder="Search for a player..."
        autoFocus
      />
    )
  }
}

class Results extends Component {
  render() {
    return (
      <div className="Results">
      </div>
    )
  }
}

class Pitch extends Component {
  render() {
    return (
      <div className="Pitch basic"></div>
    )
  }
}

const getPlayersData = (searchValue) => {
  request.open("GET", `${proxy}${urlStart}${searchValue}${urlEnd}`, true)
  request.responseType = "json"
  // Abort previous requests
  request.abort()

  request.addEventListener("readystatechange", e => {
    if (request.readyState === 4) {
      if (request.status === 200) {
        requestResult = request.response
        requestResults = [] // Reset array
        for (let i=0; i<requestResult.items.length; i++) {
          // TODO: Filter out duplicates using baseId property
          requestResults[i] = {
            name: requestResult.items[i].lastName,
            photo: requestResult.items[i].headshotImgUrl,
            flag: requestResult.items[i].nation.imageUrls.small,
            club: requestResult.items[i].club.imageUrls.normal.small
          }
        }
      }
    }
  })

  request.send()
  console.log(requestResults)
  return requestResults
}

export default App
