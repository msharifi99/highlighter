import React from 'react';

import {
  Tooltip,
  OverlayTrigger,
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


const colors = {
  red: '#F5B7B1',
  note: '#CCD1D1',
  green: '#ABEBC6',
  yellow: '#F9E79F',
  transparent: '#FFFFFF',
};

const HighlightBtn = (props) => {
  return (
    <Button
    name={props.name}
    bsStyle={props.color}
    onClick={props.onClick}>
      {props.name}
    </Button>
  );
}

const Highlight = (props) => {
  let hl_style = {
    backgroundColor: colors[props.type],
    padding: 0,
    margin: 0,
  };

  return (
    <mark
      id={props.id}
      style={hl_style}
    >
      {props.text}
    </mark>
  );
}

const Note = (props) => {
  let arr = props.note.split('\n');
  let note = arr.map((item, index) => (<p key={index}>{item}</p>));
  let tt_style = {
    wordWrap: 'break-word',
    padding: '10px',
  };
  let mr_style = {
    backgroundColor: colors['note'],
    padding: 0,
    margin: 0,
    cursor: 'pointer',
  };

  return (
    <OverlayTrigger
      trigger="click"
      placement="right"
      delay={0}
      overlay={
        <Tooltip
        id={`${props.id}_tooltip`}
        style={tt_style}>
          {note}
        </Tooltip>
      }
    >
      <mark
        id={props.id}
        style={mr_style}
      >
        {props.text}
      </mark>
    </OverlayTrigger>
  );
}

const Form = (props) => {
  let fr_style = {
    margin: '5%',
    padding: '1%',
  };

  return (
    <form style={fr_style}>
      <FormGroup>
        <ControlLabel>
          Enter note:
        </ControlLabel>
        <FormControl
          type="text"
          name="note_input"
          onChange={props.onChange}
        />
        <HelpBlock bsClass="text-danger">
          Please select text after you have entered the note; then press "Add" button.
        </HelpBlock>
      </FormGroup>
      <HighlightBtn
        color="success"
        name="Add"
        onClick={props.submitNote.bind(this, 'note')}
      />
    </form>
  );
}

export {Note, Highlight, HighlightBtn, Form};
