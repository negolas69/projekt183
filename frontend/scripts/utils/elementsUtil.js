import {
  CLASS_DROPDOWN_CHOSEN,
  CLASS_BUTTON,
  CLASS_BUTTON_ICON,
  CLASS_BUTTON_ROTATE,
  CLASS_SECTION_CONTENT,
  CLASS_FORM_CONTENT,
  CLASS_DO_NOT_DISPLAY,
} from '../utils/classesForStyling.js';

function createAddButton(addCallback) {
  return createButton(
    `${CLASS_BUTTON} ${CLASS_BUTTON_ICON}`,
    '&#128930;',
    addCallback
  );
}

function createOkButton(okCallback) {
  return createButton(
    `${CLASS_BUTTON} ${CLASS_BUTTON_ICON}`,
    '&#128504;',
    okCallback
  );
}

function createDeleteButton(deleteCallback) {
  return createButton(
    `${CLASS_BUTTON} ${CLASS_BUTTON_ICON} ${CLASS_BUTTON_ROTATE}`,
    '&#128930;',
    deleteCallback
  );
}

function createButton(classes, innerHtml, clickCallback) {
  const elBtn = createElement(
    'button',
    [{ name: 'class', value: classes }],
    innerHtml
  );
  elBtn.addEventListener('click', clickCallback);
  return elBtn;
}

function createDropdown(placeholderText, options) {
  const elSelect = document.createElement('select');
  elSelect.innerHTML = `
    <option value="" disabled selected hidden>
        ${placeholderText}
    </option>
    ${options
      .map(
        (option) =>
          createElement(
            'option',
            [{ name: 'value', value: option.value }],
            option.textContent
          ).outerHTML
      )
      .join('')}`;
  elSelect.addEventListener('change', () => {
    elSelect.setAttribute('class', CLASS_DROPDOWN_CHOSEN);
  });
  return elSelect;
}

function createElement(tagName, attributes, innerHtml) {
  const element = document.createElement(tagName);
  attributes.forEach((attribute) => {
    element.setAttribute(attribute.name, attribute.value);
  });
  if (innerHtml) {
    element.innerHTML = innerHtml;
  }
  return element;
}

function replaceElement(parentNode, idToReplace, ...elements) {
  const elToReplace = parentNode.querySelector(`#${idToReplace}`);
  if (elements[0]) {
    elToReplace.replaceWith(...elements);
  } else {
    elToReplace.remove();
  }
}

function removeContentForm() {
  const elForm = document.querySelector(
    `.${CLASS_SECTION_CONTENT} .${CLASS_FORM_CONTENT}`
  );
  if (elForm) {
    elForm.remove();
  }
}

function displayError(errorMsg, elError) {
  elError.classList.remove(CLASS_DO_NOT_DISPLAY);
  elError.textContent = errorMsg;
}

function getCounter(count) {
  return {
    next: () => count++,
  };
}

export {
  createElement,
  createButton,
  createAddButton,
  createOkButton,
  createDeleteButton,
  createDropdown,
  replaceElement,
  removeContentForm,
  displayError,
  getCounter,
};
