import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';

import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';
import { BufferedChangeset } from 'ember-changeset/types';
import { validatePresence } from 'ember-changeset-validations/validators';

import ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import parseError from 'irene/utils/parse-error';

import styles from './index.scss';

type ChangesetBufferProps = Partial<BufferedChangeset> & {
  parameterValue: string;
  parameterType: string;
};

const ChangeValidator = {
  parameterValue: [validatePresence(true)],
  parameterType: [validatePresence(true)],
};

interface ProjectSettingsViewScenarioAddParameterSignature {
  Args: {
    scenario: ScanParameterGroupModel;
    reloadParameterList(): void;
  };
}

export default class ProjectSettingsViewScenarioAddParameterComponent extends Component<ProjectSettingsViewScenarioAddParameterSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked changeset: ChangesetBufferProps | null = null;

  model = {};

  constructor(
    owner: unknown,
    args: ProjectSettingsViewScenarioAddParameterSignature['Args']
  ) {
    super(owner, args);

    this.changeset = Changeset(
      this.model,
      lookupValidator(ChangeValidator),
      ChangeValidator
    ) as ChangesetBufferProps;
  }

  get scenario() {
    return this.args.scenario;
  }

  get addScenarioTextFieldClassess() {
    return {
      root: styles['add-parameter-text-field-form-root'],
    };
  }

  get disableAddBtn() {
    return !this.changeset?.parameterType || !this.changeset.parameterValue;
  }

  get parameterInputTypeError() {
    return this.changeset?.error?.['parameterType']?.validation as string;
  }

  get parameterInputTypeHasError() {
    return !!this.parameterInputTypeError;
  }

  @action handleClearParameterValue() {
    this.changeset?.set?.('parameterValue', '');
  }

  @action handleClearParameterType() {
    this.changeset?.set?.('parameterType', '');
  }

  createScanParameter = task(async () => {
    await this.changeset?.validate?.();

    if (!this.changeset?.isValid) {
      return;
    }

    try {
      const parameter = this.store.createRecord('scan-parameter', {
        name: this.changeset.parameterType,
        value: this.changeset.parameterValue,
      });

      const adapterOptions = { scenarioId: this.scenario.id };
      await parameter.save({ adapterOptions });

      this.changeset?.set?.('parameterValue', '');
      this.changeset?.set?.('parameterType', '');
      this.changeset?.rollbackProperty?.('parameterType'); // To clear error of the parameter type

      this.notify.success(this.intl.t('dastAutomation.parameterAdded'));
      this.args.reloadParameterList();
    } catch (err) {
      const errors = err as any;

      if (errors?.errors?.[0]?.source?.pointer === '/data/attributes/name') {
        this.changeset?.addError?.(
          'parameterType',
          errors?.errors?.[0]?.detail
        );

        return;
      }

      this.notify.error(parseError(errors, this.intl.t('tSomethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ViewScenario::AddParameterForm': typeof ProjectSettingsViewScenarioAddParameterComponent;
  }
}
