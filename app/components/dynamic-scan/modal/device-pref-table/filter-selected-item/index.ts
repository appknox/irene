import Component from '@glimmer/component';

interface SecurityAnalysisListFilterSelectedItemArgs {
  extra: Record<'selectedItem' | 'iconName', string>;
}

export default class SecurityAnalysisListFilterSelectedItemComponent extends Component<SecurityAnalysisListFilterSelectedItemArgs> {
  get selectedItem() {
    return this.args.extra?.selectedItem;
  }

  get iconName() {
    return this.args.extra?.iconName;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'dynamic-scan/modal/device-pref-table/filter-selected-item': typeof SecurityAnalysisListFilterSelectedItemComponent;
  }
}
