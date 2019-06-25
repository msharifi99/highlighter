import React from 'react';

import { Button, ButtonGroup } from 'react-bootstrap';
import { HighlightBtn } from './Highlighter';


class ActionButtons extends React.Component {

  render() {
    return (
      <ButtonGroup vertical>
        <HighlightBtn
          color="danger"
          name="R"
          onClick={this.props.markText.bind(this, 'red')}
        />
        <HighlightBtn
          color="warning"
          name="Y"
          onClick={this.props.markText.bind(this, 'yellow')}
        />
        <HighlightBtn
          color="success"
          name="G"
          onClick={this.props.markText.bind(this, 'green')}
        />
        <HighlightBtn
          color="default"
          name="C"
          onClick={this.props.markText.bind(this, 'transparent')}
        />
        <Button
          name="note"
          bsStyle="primary"
          onClick={this.props.toggleForm}
        >
        +
        </Button>
      </ButtonGroup>
    );
  }
}

export default ActionButtons;
