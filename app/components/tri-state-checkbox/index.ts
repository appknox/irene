import Component from '@glimmer/component';


export default class TriStateCheckboxComponent extends Component {
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    TriStateCheckbox: typeof TriStateCheckboxComponent;
  }
}