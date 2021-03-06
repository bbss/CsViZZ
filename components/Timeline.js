'use strict'

var React = require('react')
var _ = require('lodash')

var MapActionCreators = require('../actions/MapActionCreators')
var Store = require('../stores/Store')
var createStoreMixin = require('../mixins/createStoreMixin')

var Timeline = React.createClass({

  displayName: 'Timeline',

  mixins: [createStoreMixin(Store)],

  getInitialState() {
    return {
      isTimelinePlaying: false,
      playLoop: null
    }
  },

  getStateFromStores() {
    var selected_indicator = Store.getSelectedIndicator()
    var selected_year = Store.getSelectedYear()

    return {
      selected_year: selected_year,
      selected_indicator: selected_indicator
    }
  },

  componentDidMount() {
    Store.addIndicatorChangeListener(this.handleStoreChange)
    Store.addYearChangeListener(this.handleStoreChange)

    this.setState(this.getStateFromStores())
  },

  componentWillUnmount() {
    if (this.state.playLoop) window.clearInterval(this.state.playLoop)
  },

  handleStoreChange() {
    this.setState(this.getStateFromStores())
  },

  handleYearClick(e) {
    var selected_year = e.target.innerHTML
    MapActionCreators.changeSelectedYear(selected_year)
  },

  playTimeline() {
    var selected_indicator = Store.getSelectedIndicator()
    this.setState({ isTimelinePlaying: !this.state.isTimelinePlaying })

    if (this.state.isTimelinePlaying) {
      if (this.state.playLoop) window.clearInterval(this.state.playLoop)
    } else if (!this.state.isTimelinePlaying) {
      var playLoop = window.setInterval(function() {
        var current_year = parseInt(Store.getSelectedYear())
        if (current_year >= parseInt(_.last(this.props.data.global.meta.indicators[selected_indicator].years))) {
          window.clearInterval(playLoop)
          this.setState({ isTimelinePlaying: false })
        } else {
          var next_year = current_year + 1
          MapActionCreators.changeSelectedYear(next_year)
        }
      }.bind(this), 1000)

      this.setState({ playLoop: playLoop })
    }

  },

  render() {
    var timeline, playButton
    var selected_indicator = Store.getSelectedIndicator()
    var selected_year = Store.getSelectedYear()

    if (this.props.data.global && selected_indicator && selected_year && this.props.data.configs.indicators[selected_indicator].years.length) {
      timeline = this.props.data.global.meta.indicators[selected_indicator].years.map(function(year) {
        return <li key={year} value={year} className={ (year == selected_year) ? 'active' : null } onClick={this.handleYearClick}>{year}</li>
      }, this)

      playButton = (
        <li className='play-button' onClick={this.playTimeline}>
          { this.state.isTimelinePlaying ?
            'Stop' :
            'Play'
          }
        </li>
      )
    }

    return (
      <div className='timeline-box'>
        <ul className='timeline'>
          {playButton}
          {timeline}
        </ul>
      </div>
    )
  }

})

module.exports = Timeline