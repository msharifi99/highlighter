import React from "react";
import { Note, Highlight } from "./Highlighter";

import "bootstrap/dist/css/bootstrap.min.css";

class Text extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      textElements: {},
    };
  }
  componentDidMount() {
    const { text } = this.props;
    const textLength = text.length;
    const id = Text.getIdFromOffset(0, textLength);
    this.setState({
      textElements: {
        [id]: <Highlight id={id} type="transparent" text={text} />,
      },
    });
  }
  static getCorrectOffset = (start, end) => {
    if (start > end) {
      return [end, start];
    } else {
      return [start, end];
    }
  };
  static getIdFromOffset = (start, end) => {
    return `index_${start}_${end}`;
  };
  static getOffsetFromId = id => {
    const [, start, end] = id.split("_");
    return [start, end];
  };
  static getTextFromElement = (elementId, elements) => {
    const element = elements[elementId];

    const {
      props: { text },
    } = element;
    return text;
  };
  static getTypeFromElement = (elementId, elements) => {
    const element = elements[elementId];

    const {
      props: { type },
    } = element;
    return type;
  };
  addHighlight = (id, type, text) => {
    const highlightElement = <Highlight id={id} type={type} text={text} />;
    this.setState(prevState => {
      return {
        textElements: {
          ...prevState.textElements,
          [id]: highlightElement,
        },
      };
    });
  };
  removeElement = id => {
    this.setState(prevState => {
      const { textElements } = prevState;
      return { ...textElements, [id]: undefined };
    });
  };
  sliceElement = (start, end) => {
    const { textElements } = this.state;
    const ids = Object.keys(textElements);
    const parentId = ids.find(id => {
      const [startId, endId] = Text.getOffsetFromId(id);
      if (startId < start && endId > end) return true;
    });
    const sourceText = Text.getTextFromElement(parentId, textElements);
    const [parentStart, parentEnd] = Text.getOffsetFromId(parentId);
    const leftText = sourceText.substring(parentStart, start);
    const ritghText = sourceText.substring(end, parentEnd);
    const leftId = Text.getIdFromOffset(parentStart, start);
    const rightId = Text.getIdFromOffset(end, parentEnd);
    const type = Text.getTypeFromElement(parentId, textElements);
    console.log({ type, ritghText, leftText, leftId, rightId });
    this.addHighlight(leftId, type, leftText);
    this.addHighlight(rightId, type, ritghText);
    this.removeElement(parentId);
  };
  get_new_input = (
    startElementId,
    endElementId,
    startOffset,
    endOffset,
    type,
    note,
  ) => {
    const { textElements } = this.state;
    const [start, end] = Text.getCorrectOffset(startOffset, endOffset);
    const id = Text.getIdFromOffset(start, end);
    const sourceText = Text.getTextFromElement(startElementId, textElements);
    const splitText = sourceText.substring(start, end);
    this.sliceElement(start, end);
    this.addHighlight(id, type, splitText);
  };

  render() {
    const { textElements } = this.state;
    console.log(textElements);
    return Object.values(textElements);
  }
}

export default Text;
