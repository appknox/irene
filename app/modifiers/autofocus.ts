import { modifier } from 'ember-modifier';

export const autofocusModifier = modifier((element: HTMLElement) =>
  element.focus()
);

export default autofocusModifier;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    autofocus: typeof autofocusModifier;
  }
}
