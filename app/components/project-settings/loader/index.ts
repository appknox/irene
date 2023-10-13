import Component from '@glimmer/component';

interface ProjectSettingsLoaderSignature {
  Element: HTMLElement;
  Args: null;
}

export default class ProjectSettingsLoaderComponent extends Component<ProjectSettingsLoaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Loader': typeof ProjectSettingsLoaderComponent;
  }
}
