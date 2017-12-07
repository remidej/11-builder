// Team of the week: https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22page%22:1,%22quality%22:%22totw_gold%22,%22position%22:%22GK%22%7D

import React, { Component } from 'react'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="Settings">
          <h2 className="Sub-title">Create your lineup!</h2>
          <input className="Search-player" type="search" placeholder="Search for a player..."/>
          <Results/>
        </div>
        <div className="Pitch"></div>
      </div>
    )
  }
}

class Results extends Component {
  render() {
    return (
      <div className="Results">
        <p>This is a result</p>
      </div>
    )
  }
}

export default App
