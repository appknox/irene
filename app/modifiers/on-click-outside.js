import { modifier } from 'ember-modifier';

// The parentSelector is the parent element selector with which the click event should be registered on.
// This is to prevent the click registration to the entire document

export default modifier((element, [callback, parentSelector]) => {
  function handleClick(event) {
    if (!element.contains(event.target)) {
      callback();
    }
  }

  document.querySelector(parentSelector).addEventListener('click', handleClick);

  return () => {
    document.removeEventListener('click', handleClick);
  };
});
