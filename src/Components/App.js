import React from 'react';

import Content from './Content';
import ActionButtons from './ActionButtons';

import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';


class App extends React.Component {

  contentRef = React.createRef();

  toggleForm = () => {
    this.contentRef.current.toggleForm();
  }

  markText = (type) => {
    this.contentRef.current.markText(type);
  }

  render() {
    return (
      <div className="appContainer">
        <Content
          ref={this.contentRef}
          title="Lorem ipsum"
          text="A common pattern in React is for a component to return multiple elements. Fragments let you group a list of children without adding extra nodes to the DOM."
        />
        <ActionButtons
          toggleForm={this.toggleForm}
          markText={this.markText}
        />
      </div>
    );
  }
}

export default App;
