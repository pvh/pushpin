import React from 'react'
import PropTypes from 'prop-types'
import Debug from 'debug'

import ContentTypes from '../../content-types'

const log = Debug('pushpin:github-issue')

export default class GithubIssueInList extends React.PureComponent {
  static propTypes = {
    docId: PropTypes.string.isRequired
  }

  static initializeDocument = (urlDoc, { stuff = '' }) => {
    // don't need this yet
  }

  static minWidth = 9
  static minHeight = 9
  static defaultWidth = 12
  // static defaultHeight = 18
  static maxWidth = 24
  static maxHeight = 32

  componentWillMount = () => this.refreshHandle(this.props.docId)
  componentWillUnmount = () => this.handle.release()
  componentDidUpdate = (prevProps, prevState, snapshot) => {
    if (prevProps.docId !== this.props.docId) {
      this.refreshHandle(this.props.docId)
    }
  }
  refreshHandle = (docId) => {
    if (this.handle) {
      this.handle.release()
    }
    this.handle = window.hm.openHandle(docId)
    this.handle.onChange(this.onChange)
  }

  onChange = (doc) => {
    this.setState({ ...doc })
  }

  render = () => {
    const { contents } = this.state
    if (!contents) {
      return (
        <div style={css.issueCard}>
          Loading
        </div>
      )
    }
    return (
      <div style={css.issueCard}>
        <h1>{contents.title}</h1>
        <small>#{contents.number} {contents.state}ed at {contents.created_at}</small>
      </div>
    )
  }
}

ContentTypes.register({
  component: GithubIssueInList,
  type: 'github-issue',
  name: 'GitHub Issue',
  icon: 'github',
  resizable: true
})

const css = {
  issueCard: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    overflow: 'auto',
    position: 'relative',
    padding: 12,
    flex: '1 1 auto',
    border: '1px solid var(--colorPaleGrey)'
  },
}
