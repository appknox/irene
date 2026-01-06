import { modifier } from 'ember-modifier';

// The parentSelector is the parent element selector with which the click event should be registered on.
// This is to prevent the click registration to the entire document

export default modifier(
  (element: HTMLElement, [callback, parentSelector]: [() => void, string]) => {
    function handleClick(event: Event) {
      if (!element.contains(event?.target as Node)) {
        callback();
      }
    }

    document
      ?.querySelector(parentSelector)
      ?.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }
);
