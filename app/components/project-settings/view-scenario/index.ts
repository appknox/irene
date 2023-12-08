import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import ProjectModel from 'irene/models/project';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';

interface ProjectSettingsViewScenarioSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsViewScenarioComponent extends Component<ProjectSettingsViewScenarioSignature> {
  @service declare intl: IntlService;

  @tracked scenarioInputType = '';
  @tracked scenarioInputValue = '';
  @tracked toggleShowSecureField = false;
  @tracked showDeleteScenarioParameter = false;
  @tracked scenarios = A([
    { id: '1', name: 'username', value: 'Elliot' },
    { id: '2', name: 'email', value: 'appknox@mail.com' },
    {
      id: '3',
      name: 'password',
      value: 'appknox',
      isSecured: true,
      visible: true,
    },
  ]);

  get scenarioList() {
    return this.scenarios;
  }

  inputTypeSuggestions = [
    'username',
    'password',
    'email',
    'phone',
    'phone2',
    'username2',
  ];

  get disableAddBtn() {
    return !this.scenarioInputType || !this.scenarioInputValue;
  }

  @action handleSecureFieldChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const scenarioId = target.id;

    const snCopies = [...this.scenarios];
    this.scenarios = snCopies.map((sn) => {
      if (sn.id === scenarioId) {
        sn.value = target.value;
      }

      return sn;
    });
  }

  @action handleToggleSecureFieldVisibility(snId: string) {
    this.toggleShowSecureField = !this.toggleShowSecureField;
    // const snCopies = [...this.scenarios];
    // this.scenarios = snCopies.map((sn) => {
    //   if (sn.id === snId) {
    //     sn.visible = !sn.visible;
    //   }

    //   return sn;
    // });
  }

  @action showDeleteParameterModal() {
    this.showDeleteScenarioParameter = true;
  }

  @action cancelDeleteParameter() {
    this.showDeleteScenarioParameter = false;
  }

  @action handleScenarioTypeChange(value: string) {
    this.scenarioInputType = value;
  }

  @action handleScenarioValueChange(event: Event) {
    this.scenarioInputValue = (event.target as HTMLInputElement).value;
  }

  @action handleClearScenarioValue() {
    this.scenarioInputValue = '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ViewScenario': typeof ProjectSettingsViewScenarioComponent;
  }
}
