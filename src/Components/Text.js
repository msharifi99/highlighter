import React from "react";
import { Note, Highlight } from "./Highlighter";

import "bootstrap/dist/css/bootstrap.min.css";

class Text extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      textElements: {}
    };
  }
  componentDidMount() {
    const { text } = this.props;
    const textLength = text.length;
    const id = Text.getIdFromOffset(0, textLength);
    this.setState({
      textElements: {
        [id]: this.createHighlightObject(id, "transparent", text)
      }
    });
  }
  static getCorrectOffset = ([start, end]) => {
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
    return [parseInt(start), parseInt(end)];
  };
  static getTextFromElement = element => {
    const { text } = element;
    return text;
  };
  static getTypeFromElement = (elementId, elements) => {
    const element = elements[elementId];

    const { type } = element;
    return type;
  };
  static getContainsElement = (absoluteStart, absoluteEnd, elements) => {
    return Object.values(elements)
      .filter(({ id }) => {
        const [start, end] = Text.getOffsetFromId(id);
        console.log({
          start,
          end,
          absoluteEnd,
          absoluteStart
        });
        const rightPartIn =
          start < absoluteStart && end > absoluteStart && end < absoluteEnd;
        const leftPartIn =
          start > absoluteStart && start < absoluteEnd && end > absoluteEnd;
        const completeIn = start >= absoluteStart && end <= absoluteEnd;
        return rightPartIn || leftPartIn || completeIn;
      })
      .sort(({ id: firstId }, { id: secondId }) => {
        const { getOffsetFromId } = Text;
        const [AStart] = getOffsetFromId(firstId);
        const [BStart] = getOffsetFromId(secondId);
        if (AStart < BStart) return -1;
        return 1;
      });
  };
  createHighlightObject = (id, type, text) => {
    return { id, type, text };
  };
  removeElement = id => {
    this.setState(prevState => {
      const { textElements } = prevState;
      return { ...textElements, [id]: undefined };
    });
  };
  sliceElement = (
    element,
    absoluteStart,
    absoluteEnd,
    reletiveStart,
    reletiveEnd
  ) => {
    const sourceText = element.text;
    const [parentStart, parentEnd] = Text.getOffsetFromId(element.id);
    const type = element.type;
    let result = {};
    if (parentStart !== absoluteStart) {
      console.log({ reletiveStart, parentStart, absoluteStart });
      const leftText = sourceText.substring(0, reletiveStart);
      const leftId = Text.getIdFromOffset(parentStart, absoluteStart);
      const leftParent = this.createHighlightObject(leftId, type, leftText);
      console.log({
        leftText,
        leftId,
        leftParent
      });
      result.left = {
        id: leftId,
        element: leftParent
      };
    }
    if (parentEnd !== absoluteEnd) {
      const ritghText = sourceText.substring(reletiveEnd, parentEnd);
      const rightId = Text.getIdFromOffset(absoluteEnd, parentEnd);
      const rightParent = this.createHighlightObject(rightId, type, ritghText);
      result.right = {
        id: rightId,
        element: rightParent
      };
    }
    return result;
  };
  getSibiling = (id, elements) => {
    const [startOffset] = Text.getOffsetFromId(id);
    return Object.values(elements).find(({ id }) => {
      const [, endOffset] = Text.getOffsetFromId(id);
      return startOffset === endOffset;
    });
  };
  mergeSameSibilings(element, sibiling) {
    const { text, offset, type } = element;
    const [, end] = offset;
    const [sibilingStart] = Text.getOffsetFromId(sibiling.id);
    const mergedId = Text.getIdFromOffset(sibilingStart, end);
    const mergedText = sibiling.text + text;
    return this.createHighlightObject(mergedId, type, mergedText);
  }
  handleSingleParent = ({ parentId, start, end, type }, sourceElements) => {
    const elements = { ...sourceElements };
    const [parentStart] = Text.getOffsetFromId(parentId);
    const absoluteStart = parentStart + start;
    const absoluteEnd = parentStart + end;
    const sourceText = Text.getTextFromElement(elements[parentId]);
    const splitText = sourceText.substring(start, end);
    const { left, right } = this.sliceElement(
      elements[parentId],
      absoluteStart,
      absoluteEnd,
      start,
      end
    );
    if (left) {
      const { id: leftId, element: leftParent } = left;
      elements[leftId] = leftParent;
    }
    if (right) {
      const { id: rightId, element: rightParent } = right;
      elements[rightId] = rightParent;
    }
    const id = Text.getIdFromOffset(absoluteStart, absoluteEnd);
    delete elements[parentId];
    const sibiling = this.getSibiling(id, elements);
    const isSameSibiling = sibiling && sibiling.type === type;
    const shouldElementMerge = sibiling && isSameSibiling;
    console.log({ sibiling, isSameSibiling, shouldElementMerge });
    if (shouldElementMerge) {
      const mergedElemenet = this.mergeSameSibilings(
        {
          text: splitText,
          offset: [absoluteStart, absoluteEnd],
          type
        },
        sibiling
      );
      delete elements[sibiling.id];
      elements[mergedElemenet.id] = mergedElemenet;
    } else {
      const newHighlight = this.createHighlightObject(id, type, splitText);
      elements[id] = newHighlight;
    }
    return elements;
  };
  get_new_input = (
    startElementId,
    endElementId,
    startOffset,
    endOffset,
    type,
    note
  ) => {
    this.setState(prevState => {
      let newTextElements = null;
      const { textElements: sourceTextElements } = prevState;
      const textElements = { ...sourceTextElements };

      let [reletiveStart, reletiveEnd] = [
        parseInt(startOffset),
        parseInt(endOffset)
      ];

      if (startElementId === endElementId) {
        if (reletiveStart > reletiveEnd) {
          [reletiveEnd, reletiveStart] = [reletiveStart, reletiveEnd];
        }
        newTextElements = this.handleSingleParent(
          {
            parentId: startElementId,
            start: reletiveStart,
            end: reletiveEnd,
            type
          },
          sourceTextElements
        );
      } else {
        let [leftParentStart, leftParentEnd] = Text.getOffsetFromId(
          startElementId
        );
        let [rightParentStart] = Text.getOffsetFromId(endElementId);

        if (leftParentStart > rightParentStart) {
          [startElementId, endElementId] = [endElementId, startElementId];
          [reletiveEnd, reletiveStart] = [reletiveStart, reletiveEnd];
          [leftParentStart, leftParentEnd] = Text.getOffsetFromId(
            startElementId
          );
          [rightParentStart] = Text.getOffsetFromId(endElementId);
        }
        console.log({
          startElementId,
          endElementId,
          reletiveStart,
          reletiveEnd,
          leftParentStart,
          leftParentEnd,
          rightParentStart
        });

        const absoluteStart = leftParentStart + reletiveStart;
        const absoluteEnd = rightParentStart + reletiveEnd;
        const containsElement = Text.getContainsElement(
          absoluteStart,
          absoluteEnd,
          textElements
        );
        const { left } = this.sliceElement(
          textElements[startElementId],
          absoluteStart,
          leftParentEnd,
          reletiveStart,
          undefined
        );
        const { right } = this.sliceElement(
          textElements[endElementId],
          rightParentStart,
          absoluteEnd,
          undefined,
          reletiveEnd
        );
        if (left) {
          const { element: leftOutPart } = left;
          textElements[leftOutPart.id] = leftOutPart;
        }
        if (right) {
          const { element: rightOutPart } = right;
          textElements[rightOutPart.id] = rightOutPart;
        }
        const fullParentId = Text.getIdFromOffset(absoluteStart, absoluteEnd);
        let fullParentText = "";
        console.log(containsElement);
        containsElement.forEach(({ text }, index) => {
          if (index === 0) {
            const leftParentText = textElements[startElementId].text;
            fullParentText += leftParentText.substring(
              reletiveStart,
              leftParentText.length
            );
          } else if (index === containsElement.length - 1) {
            fullParentText += textElements[endElementId].text.substring(
              0,
              reletiveEnd
            );
          } else {
            fullParentText += text;
          }
        });

        console.log(fullParentText);
        const fullParentElement = this.createHighlightObject(
          fullParentId,
          "transparent",
          fullParentText
        );
        containsElement.forEach(({ id }) => delete textElements[id]);

        textElements[fullParentId] = fullParentElement;
        newTextElements = this.handleSingleParent(
          {
            parentId: fullParentId,
            start: 0,
            end: fullParentText.length,
            type
          },
          textElements
        );
      }

      return { textElements: newTextElements };
    });
  };

  render() {
    const { textElements } = this.state;
    const result = Object.keys(textElements)
      .sort((firstId, secondId) => {
        const { getOffsetFromId } = Text;
        const [AStart] = getOffsetFromId(firstId);
        const [BStart] = getOffsetFromId(secondId);
        if (AStart < BStart) return -1;
        return 1;
      })
      .map(key => {
        const { type, text, id } = textElements[key];
        return <Highlight type={type} text={text} id={id} />;
      });
    console.log(Object.keys(textElements));
    return result;
  }
}

export default Text;
