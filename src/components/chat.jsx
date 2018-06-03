import React from 'react'
import PropTypes from 'prop-types'
import ReactToggle from 'react-toggle'

import ContentTypes from '../content-types'
import Content from './content'

export default class Chat extends React.PureComponent {
  static propTypes = {
    doc: PropTypes.shape({
      messages: PropTypes.array,
    }).isRequired,
    onChange: PropTypes.func.isRequired
  }

  static initializeDocument(onChange) {
    onChange((doc) => {
      doc.messages = []
    })
  }

  state = {
    message: ""
  }

  render() {
    return (
      <div style={css.wrapper}>
        <div style={css.messages} onScroll={this.scroll}>
          {this.props.doc.messages.map(this.renderMessage)}
        </div>
        <input 
          style={css.input}
          value={this.state.message}
          onKeyDown={this.keyDown}
          onInput={this.input}
          placeholder="Say something..."
        />
      </div>
    )
  }

  renderMessage = ({authorId, content}, idx, msgs) => {
    const prev = msgs[idx - 1] || {}

    return (
      <div style={css.message} key={idx}>
        { prev.authorId === authorId
          ? null
          : <div className="ListMenu" style={css.avatar}>
              <Content
                type="contact"
                docId={authorId}
              />
            </div>
        }
        <div style={css.content}>{content}</div>
      </div>
    )
  }

  scroll = e => {
    e.stopPropagation()
  }

  input = e => {
    this.setState({
      message: e.target.value
    })
  }

  keyDown = e => {
    e.stopPropagation()
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      this.props.onChange(doc => {
        doc.messages.push({
          authorId: window.selfId,
          content: this.state.message
        })
      })

      this.setState({
        message: ""
      })
    }
  }
}

ContentTypes.register({
  component: Chat,
  type: 'chat',
  name: 'Chat',
  icon: 'group',
})

const css = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    flexGrow: 1,
    minWidth: 288,
    minHeight: 480,
  },
  messages: {
    overflow: 'auto',
    flexGrow: '1',
    padding: '5px 5px 0 5px',
  },
  message: {
    
  },
  avatar: {

  },
  content: {
    marginLeft: 56,
  },
  input: {
    flexShrink: "0",
    margin: 4,
  },
}