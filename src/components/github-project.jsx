import React from 'react'
import PropTypes from 'prop-types'
import Debug from 'debug'

import ContentTypes from '../content-types'
import Content from './content'

const log = Debug('pushpin:github-project')

export default class GithubProject extends React.PureComponent {
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

  setCurrentIssue = (url) => {
    this.setState({ currentIssue: url })
  }

  render = () => {
    const { issues = [], currentIssue } = this.state

    const noneFound = (
      <div className="ListMenu__item">
        <div className="ContactListItem">
          <i className="Badge ListMenu__thumbnail fa fa-exclamation-point" style={{ backgroundColor: 'var(--colorPaleGrey)' }} />
          <div className="Label">
            <p className="Type--primary">No issues here</p>
            <p className="Type--secondary">Guess you're all done.</p>
          </div>
        </div>
      </div>
    )

    const noCurrent = (
      <div>
        Select an issue on the left.
      </div>
    )
    const issueContents = issues.map(url => (
      <div key={url} className="ListMenu__item" onClick={(e) => this.setCurrentIssue(url)}>
        <Content
          context="list"
          url={url}
        />
      </div>
    ))

    return (
      <div className="GithubProject" style={css.githubProject}>
        <div className="ListMenu__section">
          { issues.length !== 0 ? issueContents : noneFound}
        </div>
        <div className="CurrentIssue" style={css.currentIssue}>
          { currentIssue ? <Content url={currentIssue} /> : noCurrent }
        </div>
      </div>
    )
  }
}

ContentTypes.register({
  component: GithubProject,
  type: 'github-project',
  name: 'GitHub Project',
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
  githubProject: {
    display: 'flex',
    flexDirection: 'row',
  },
  issueList: {
    width: '200px'
  },
  currentIssue: {
    flexGrow: 1
  }
}
