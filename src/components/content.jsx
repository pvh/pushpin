import React from 'react'
import PropTypes from 'prop-types'
import Debug from 'debug'

import ContentTypes from '../content-types'

const log = Debug('pushpin:content')
const FILTERED_PROPS = ['type', 'docId']

export default class Content extends React.PureComponent {
  static propTypes = {
    type: PropTypes.string.isRequired,
    docId: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)
    log('constructor')

    this.onChange = this.onChange.bind(this)

    this.handle = window.hm.openHandle(this.props.docId)

    // State directly affects the rendered view.
    this.state = {
      doc: this.handle.doc
    }
  }

  static initializeContentDoc(type, typeAttrs = {}) {
    const contentType = ContentTypes
      .list({ withUnlisted: true })
      .find(contentType => contentType.type === type)
    const documentInitializationFunction = contentType.component.initializeDocument

    let handle = window.hm.createHandle()

    documentInitializationFunction((cb) => { handle.change(cb) }, typeAttrs)

    return this.handle.docId
  }

  onChange(changeBlock) {
    // We can read the old version of th doc from this.state.doc because
    // setState is not immediate and so this.state may not yet reflect the
    // latest version of the doc.
    this.handle.change(changeBlock)
    this.setState({ doc: this.handle.doc })
    return this.handle.doc
  }

  componentDidMount() {
    this.mounted = true

    this.handle.onChange(doc => {
      if (!this.mounted) return
      this.setState({doc})
    })
  }

  componentWillUnmount() {
    this.mounted = false
  }

  filterProps(props) {
    const filtered = {}
    Object.keys(props).filter(key => !FILTERED_PROPS.includes(key)).forEach(key => {
      filtered[key] = props[key]
    })
    return filtered
  }

  render() {
    log('render')
    const contentType = ContentTypes
      .list({ withUnlisted: true })
      .find((ct) => ct.type === this.props.type)

    if (!contentType) {
      throw new Error(`Could not find component of type ${this.props.type}`)
    }

    if (!this.state.doc) {
      return null
    }

    const filteredProps = this.filterProps(this.props)

    return (
      <contentType.component
        docId={this.props.docId}
        onChange={this.onChange}
        doc={this.state.doc}
        {...filteredProps}
      />
    )
  }
}
