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
    url: PropTypes.string,
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
    const { hm } = window // still not a great idea
    const contentType = ContentTypes
      .list({ withUnlisted: true })
      .find(contentType => contentType.type === type)
    const documentInitializationFunction = contentType.component.initializeDocument

    let doc = hm.create()
    const docId = hm.getId(doc)

    const onChange = (cb) => {
      doc = hm.change(doc, cb)
    }

    documentInitializationFunction(onChange, typeAttrs)

    return docId
  }

  onChange(changeBlock) {
    // We can read the old version of th doc from this.state.doc because
    // setState is not immediate and so this.state may not yet reflect the
    // latest version of the doc.
    const doc = window.hm.change(window.hm.find(this.props.docId), changeBlock)
    this.setState({ doc })
    return doc
  }

  componentDidMount() {
    this.mounted = true

    this.handle.onChange(doc => {
      if (!this.mounted) {
        return
      }
      this.setState({ doc })
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

    let type, docId
    if (this.props.url) {
      const url = new URL(this.props.url)
      // the protocol includes a colon after it. neat.
      if (url.protocol.slice(0, -1) !== 'pushpin') {
        throw new Error("Invalid url protocol (expected pushpin:// url)", url)
      }
      // not checking if both are set because i'll retire type/docId at end of patch 

      type = url.host
      docId = url.pathname
    } else {
      type = this.props.type
      docId = this.props.docId
    }

    const contentType = ContentTypes
      .list({ withUnlisted: true })
      .find((ct) => ct.type === type)

    if (!contentType) {
      throw new Error(`Could not find component of type ${type}`)
    }

    if (!this.state.doc) {
      return null
    }

    const filteredProps = this.filterProps(this.props)

    return (
      <contentType.component
        docId={docId}
        onChange={this.onChange}
        doc={this.state.doc}
        {...filteredProps}
      />
    )
  }
}
