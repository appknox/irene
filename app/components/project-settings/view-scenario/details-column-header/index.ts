import Component from '@glimmer/component';

export default class ProjectSettingsViewScenarioDetailsColumnHeaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ViewScenario::DetailsColumnHeader': typeof ProjectSettingsViewScenarioDetailsColumnHeaderComponent;
  }
}
