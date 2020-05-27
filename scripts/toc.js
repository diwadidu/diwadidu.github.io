/**
 * A script that analyses a post's headline structure and generates a nested
 * numbered list reflecting the document structure.
 *
 * The list is generated as HTML an includes links for the appropriate section
 * by using IDs on the headlines
 */

const TocGenerator = {

  renderInto: function (elementId) {
    const tocElement = document.getElementById('toc');
    if (tocElement) {
      const htmlId = elementId || 'toc';
      nodeTree = this.getHeadings();
      if (nodeTree.numHeadings > 2) {
        document.getElementById(htmlId).append(nodeTree.rendered);
      }
    } else console.error('No ID for table of content. Cannot render.');
  },

  getHeadings: function () {
    const allHeadings = [...document.querySelectorAll('h1,h2,h3,h4,h5')];
    const sliceFrom = allHeadings.findIndex(el => el.classList.contains('post-heading')) + 1;
    const rootElement = document.createElement('div');
    rootElement.className = 'post-headlines';
    const initialState = { level: 0, rendered: rootElement, currentRoot: rootElement };

    const storyHeadings = allHeadings
      .slice(sliceFrom)
      .map(this.extractHeadingData.bind(this))
      .reduce(this.renderEntryToHtml.bind(this), initialState);

    return storyHeadings;
  },



  extractHeadingData: function(el, a, b) {

    const cleanedId = this.cleanIdValue(el.id) ;
    el.id = cleanedId;

    return {
      level: parseInt(el.tagName.substr(1), 10),
      content: el.textContent,
      id: cleanedId,
      timesCalled: arguments[1] + 1,
    }
  },

  cleanIdValue: function(rawId) {
    return rawId.toLowerCase().replace(/[^\w\d\-]/g, '').toLowerCase();
  },

  renderEntryToHtml: function (htmlTree, nodeObj) {
    const liElement = this.renderListElement(nodeObj);

    // if level of new element is larger, insert a new level of nesting
    if (nodeObj.level > htmlTree.level) {
      this.descendOneLevel(htmlTree, liElement, nodeObj);
    } else if (nodeObj.level < htmlTree.level) {
      this.upOneLevel(nodeObj, htmlTree, liElement);
    } else {
      htmlTree.currentRoot.appendChild(liElement);
    }

    return {
      level: nodeObj.level,
      rendered: htmlTree.rendered,
      currentRoot: htmlTree.currentRoot,
      numHeadings: nodeObj.timesCalled
    }
  },

  renderListElement: function (nodeObj) {
    // create markup for the list item
    liElement = document.createElement('li');
    aElement = document.createElement('a');
    aElement.setAttribute('href', `#${ nodeObj.id }`);
    aElement.innerText = nodeObj.content;
    liElement.appendChild(aElement);
    return liElement;
  },

  descendOneLevel: function (htmlTree, liElement, nodeObj) {
    if (htmlTree.level > 0) {
      olContainer = document.createElement('li');
      olElement = document.createElement('ol');
      olContainer.appendChild(olElement);
      olElement.appendChild(liElement);
      htmlTree.currentRoot.appendChild(olContainer);
    } else {
      olElement = document.createElement('ol');
      olElement.appendChild(liElement);
      htmlTree.rendered.appendChild(olElement);
    }
    htmlTree.currentRoot = olElement;
  },

  upOneLevel: function (nodeObj, htmlTree, liElement) {
    // Otherwise, close the current Branch
    let newParentNode = htmlTree.currentRoot.parentNode.parentNode;

    htmlTree.currentRoot = newParentNode;
    htmlTree.currentRoot.appendChild(liElement);
  },
}
