import React from 'react'
import PropTypes from 'prop-types'

import pinBlue from './img/pinBlue.png'
import pinGreen from './img/pinGreen.png'
import pinBlueHover from './img/pinBlue-hover.png'
import pinGreenHover from './img/pinGreen-hover.png'



const imageOffset = {
  left: 15,
  top: 31
}

export default class NewMarker extends React.Component {
  static propTypes = {
    // input, passed to events
    anchor: PropTypes.array.isRequired,
    payload: PropTypes.any,
	status: PropTypes.any,
	name: PropTypes.any,

    // optional modifiers
    hover: PropTypes.bool,

    // callbacks
    onClick: PropTypes.func,
    onContextMenu: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,

    // pigeon variables
    left: PropTypes.number,
    top: PropTypes.number,

    // pigeon functions
    latLngToPixel: PropTypes.func,
    pixelToLatLng: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      hover: false
    }
  }

  // what do you expect to get back with the event
  eventParameters = (event) => ({
    event,
    anchor: this.props.anchor,
    payload: this.props.payload,
	status: this.props.status,
	name: this.props.name
  })


  // modifiers
  isHover () {
    return typeof this.props.hover === 'boolean' ? this.props.hover : this.state.hover
  }

  image () {
    return this.props.status==='Present' ? (this.isHover() ? pinBlueHover : pinBlue) : (this.isHover() ? pinGreenHover : pinGreen)
  }

  // lifecycle

  componentDidMount () {
    let images = [
      pinBlue, pinGreen, pinBlueHover,pinGreenHover
    ]

    images.forEach(image => {
      let img = new window.Image()
      img.src = image
    })
  }

  // delegators

  handleClick = (event) => {
    this.props.onClick && this.props.onClick(this.eventParameters(event))
  }

  handleContextMenu = (event) => {
    this.props.onContextMenu && this.props.onContextMenu(this.eventParameters(event))
  }

  handleMouseOver = (event) => {
    this.props.onMouseOver && this.props.onMouseOver(this.eventParameters(event))
    this.setState({ hover: true })
  }

  handleMouseOut = (event) => {
    this.props.onMouseOut && this.props.onMouseOut(this.eventParameters(event))
    this.setState({ hover: false })
  }

  // render

  render () {
    const { left, top, onClick } = this.props

    const style = {
      position: 'absolute',
      transform: `translate(${left - imageOffset.left}px, ${top - imageOffset.top}px)`,
      cursor: onClick ? 'pointer' : 'default'
    }

    return (
      <div style={style}
           className='pigeon-click-block'
           onClick={this.handleClick}
           onContextMenu={this.handleContextMenu}
           onMouseOver={this.handleMouseOver}
           onMouseOut={this.handleMouseOut}>
        <img src={this.image()} width={29} height={34} alt='' />
      </div>
    )
  }
}
