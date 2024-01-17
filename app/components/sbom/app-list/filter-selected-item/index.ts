import Component from '@glimmer/component';

interface SbomAppListFilterSelectedItemArgs {
  extra?: Record<string, unknown>;
}

export default class SbomAppListFilterSelectedItemComponent extends Component<SbomAppListFilterSelectedItemArgs> {
  get optionTitle() {
    return this.args.extra?.['optionTitle'];
  }

  get selectedItem() {
    return this.args.extra?.['selectedItem'];
  }

  get showLabel() {
    return this.args.extra?.['showLabel'];
  }

  get iconName() {
    return this.args.extra?.['iconName'];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::FilterSelectedItem': typeof SbomAppListFilterSelectedItemComponent;
  }
}
