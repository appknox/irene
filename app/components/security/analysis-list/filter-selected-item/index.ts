import Component from '@glimmer/component';

interface SecurityAnalysisListFilterSelectedItemArgs {
  extra?: Record<
    'optionTitle' | 'selectedItem' | 'showLabel' | 'iconName',
    unknown
  >;
}

export default class SecurityAnalysisListFilterSelectedItemComponent extends Component<SecurityAnalysisListFilterSelectedItemArgs> {
  get optionTitle() {
    return this.args.extra?.optionTitle as string;
  }

  get selectedItem() {
    return this.args.extra?.selectedItem as string;
  }

  get showLabel() {
    return this.args.extra?.showLabel as boolean;
  }

  get iconName() {
    return this.args.extra?.iconName as string;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisList::FilterSelectedItem': typeof SecurityAnalysisListFilterSelectedItemComponent;
    'security/analysis-list/filter-selected-item': typeof SecurityAnalysisListFilterSelectedItemComponent;
  }
}
