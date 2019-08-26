import React, { Component } from 'react'
import ExampleComponent from './node_modules/discovery-components-react'

export default class App extends Component {
  render () {
    return (
      <div>
        <ExampleComponent text='Modern React component module' />
      </div>
    )
  }
}
