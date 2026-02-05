import Component from '@glimmer/component';

interface ProjectListFilterSelectedItemArgs {
  extra?: Record<string, unknown>;
}

export default class ProjectListFilterSelectedItemComponent extends Component<ProjectListFilterSelectedItemArgs> {
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

  get fontSize() {
    return this.args.extra?.['fontSize'] || 'small';
  }

  get labelClass() {
    return `trigger-label-${this.fontSize}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::FilterSelectedItem': typeof ProjectListFilterSelectedItemComponent;
    'project-list/filter-selected-item': typeof ProjectListFilterSelectedItemComponent;
  }
}
