import React from 'react'
import ReactDOM from 'react-dom'
import PlayerCard from './PlayerCard.jsx'

export default class Pitch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: ''
    }
  }

  componentDidMount() {
    const boundings = ReactDOM.findDOMNode(this).getBoundingClientRect()
    const frame = {
      top: boundings.top,
      right: boundings.right,
      bottom: boundings.bottom,
      left: boundings.left
    }
    this.setState({ frame, lineupName: 'My team' })
  }

  editLineupName = (e) => {
    this.setState({
      lineupName: e.target.value
    })
  }

  render() {
    return (
      <div className="Pitch">
        <div>
          <textarea
            className="EditLineupName"
            rows="1"
            maxLength="40"
            value={ this.state.lineupName }
            onChange={ this.editLineupName }
          />
          <h2 className="LineupName">{ this.state.lineupName }</h2>
          {this.props.playersList.map(player => (
            <PlayerCard
              player={player}
              key={player.id}
              parentFrame={this.state.frame}
            />
          ))}
        </div>
      </div>
    )
  }
}
