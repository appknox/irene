import Component from '@glimmer/component';

interface SecurityAnalysisListFilterSelectedItemArgs {
  extra: Record<'selectedOptionLabel' | 'iconName', string>;
}

export default class SecurityAnalysisListFilterSelectedItemComponent extends Component<SecurityAnalysisListFilterSelectedItemArgs> {
  get selectedItem() {
    return this.args.extra?.selectedOptionLabel;
  }

  get iconName() {
    return this.args.extra?.iconName;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/filter-selected-item': typeof SecurityAnalysisListFilterSelectedItemComponent;
  }
}
