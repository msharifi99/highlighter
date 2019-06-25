import React from 'react';

import Text from './Text';
import { Form } from './Highlighter';

import './Content.css';


class Content extends React.Component {

  textRef = React.createRef();

  state = {
    formIsOpen: false,
    note: '',
  };

  prevent = (e) => {
    e.preventDefault();
    return true;
  }

  passage_read_only = (e) => {
    if([16, 17, 18, 20, 27, 36, 37, 38, 39, 40].indexOf(e.keyCode) === -1) {
      e.preventDefault();
      setTimeout(function() {
        document.querySelector("#passage").blur();
      }, 0);
      return false;
    }
  }

  markText = (type) => {
    if(window.getSelection().toString().length === 0) {
      return;
    }
    const startOffset = document.getSelection().anchorOffset;
    const endOffset = document.getSelection().extentOffset;
    const startElementId = document.getSelection().anchorNode.parentElement.id;
    const endElementId = document.getSelection().focusNode.parentElement.id;
    this.textRef.current.get_new_input(
      startElementId,
      endElementId,
      startOffset,
      endOffset,
      type,
      this.state.note,
    );
  }

  submitNote = (type) => {
    this.markText(type);
    this.toggleForm();
  }

  toggleForm = () => {
    this.setState((prevState) => ({
      formIsOpen: !prevState.formIsOpen,
    }));
  }

  handleChange = (e) => {
    this.setState({
      note: e.target.value,
    });
  }

  render() {
    return (
      <div className="contentContainer">

        <h1 className="contentHeader">{this.props.title}</h1>

        <div suppressContentEditableWarning contentEditable
          onDrop={this.prevent} onCut={this.prevent} onPaste={this.prevent}
          id="passage"
          style={{outline: 0, textAlign: "justify", fontSize: "1.3em"}} onKeyDown={this.passage_read_only}
          spellCheck={false}
        >
          <Text text={this.props.text} ref={this.textRef}/>
        </div>

        {this.state.formIsOpen &&
          <Form
            onChange={this.handleChange}
            submitNote={this.submitNote}
          />
        }
      </div>
    );
  }
}

export default Content;
