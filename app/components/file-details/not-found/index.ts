import Component from '@glimmer/component';

export default class FileDetailsNotFoundComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::NotFound': typeof FileDetailsNotFoundComponent;
  }
}
