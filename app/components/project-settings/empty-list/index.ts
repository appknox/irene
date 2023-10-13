import Component from '@glimmer/component';

interface ProjectSettingsEmptyListSignature {
  Element: HTMLElement;
  Args: { emptyListText?: string };
  Blocks: {
    illustration?: [];
  };
}

export default class ProjectSettingsEmptyListComponent extends Component<ProjectSettingsEmptyListSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::EmptyList': typeof ProjectSettingsEmptyListComponent;
  }
}
