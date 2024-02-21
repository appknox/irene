import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import { waitForPromise } from '@ember/test-waiters';

import ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import parseError from 'irene/utils/parse-error';
import ScanParameterModel from 'irene/models/scan-parameter';

import styles from './index.scss';

interface ProjectSettingsViewScenarioParameterItemSignature {
  Args: {
    parameter: ScanParameterModel;
    scenario: ScanParameterGroupModel;
    reloadParameterList(): void;
  };
}

export default class ProjectSettingsViewScenarioParameterItemComponent extends Component<ProjectSettingsViewScenarioParameterItemSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked isEditing = false;
  @tracked parameterValueEditText = '';
  @tracked toggleShowSecureField = false;
  @tracked showDeleteScenarioParameter = false;
  @tracked showMaskSecureFieldModal = false;

  constructor(
    owner: unknown,
    args: ProjectSettingsViewScenarioParameterItemSignature['Args']
  ) {
    super(owner, args);

    this.parameterValueEditText = this.args.parameter.value;
  }

  get textFieldClasses() {
    return {
      formControl: styles['parameter-value-text-field-form-control'],
      root: styles['parameter-value-text-field-root'],
    };
  }

  get scenario() {
    return this.args.scenario;
  }

  get parameter() {
    return this.args.parameter;
  }

  get isNotSecure() {
    return !this.parameter.isSecure;
  }

  get hideParameterValueText() {
    return !this.isEditing && this.parameter.isSecure;
  }

  @action handleParamFieldEditing() {
    this.isEditing = true;

    if (this.parameter.isSecure) {
      this.parameterValueEditText = '';
    }
  }

  @action handleParameterEditDone() {
    const valueIsEmpty = this.parameterValueEditText === '';
    const valueIsUnchanged =
      this.parameterValueEditText === this.parameter.value;

    if (valueIsUnchanged || valueIsEmpty) {
      this.isEditing = false;
    }

    if (valueIsEmpty) {
      this.parameterValueEditText = this.parameter.value;
    }
  }

  @action handleParamFieldChange(event: Event) {
    this.parameterValueEditText = (event.target as HTMLInputElement).value;
  }

  @action showDeleteParameterModal() {
    this.showDeleteScenarioParameter = true;
  }

  @action hideDeleteParameterModal() {
    this.showDeleteScenarioParameter = false;
  }

  @action showMaskParameterValueModal() {
    if (this.parameter.isSecure) {
      return;
    }

    this.showMaskSecureFieldModal = true;
  }

  @action closeMaskParameterValueModal() {
    this.showMaskSecureFieldModal = false;
  }

  @action cancelParameterValueEdit() {
    this.parameterValueEditText = this.parameter.value;
    this.isEditing = false;
  }

  @action saveParameterValueEdit() {
    this.editParameter.perform(
      this.parameterValueEditText,
      this.parameter.isSecure
    );
  }

  @action secureParameterValue() {
    this.editParameter.perform(this.parameter.value, true);
  }

  @action deleteParameter() {
    this.deleteScenarioParameter.perform();
  }

  editParameter = task(async (value: string, isSecure: boolean) => {
    try {
      this.parameter.setProperties({
        value,
        isSecure,
      });

      const adapterOptions = { scenarioId: this.scenario.id };
      await waitForPromise(this.parameter.save({ adapterOptions }));

      this.isEditing = false;

      this.closeMaskParameterValueModal();
      this.notify.success(this.intl.t('dastAutomation.paramEditSuccess'));
      this.args.reloadParameterList();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('tSomethingWentWrong')));
    }
  });

  deleteScenarioParameter = task(async () => {
    try {
      const adapterOptions = { scenarioId: this.scenario.id };
      await waitForPromise(this.parameter.destroyRecord({ adapterOptions }));

      this.hideDeleteParameterModal();
      this.notify.success(this.intl.t('dastAutomation.paramDeleteSuccess'));
      this.args.reloadParameterList();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('tSomethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ViewScenario::ParameterItem': typeof ProjectSettingsViewScenarioParameterItemComponent;
  }
}
