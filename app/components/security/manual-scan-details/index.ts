import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { task } from 'ember-concurrency';

import parseError from 'irene/utils/parse-error';

import type IntlService from 'ember-intl/services/intl';
import type SecurityManualScanDetailModel from 'irene/models/security/manual-scan-detail';

// Mirror the limits the server enforces on these fields.
const MAX_NAMES = 20;
const MAX_NAME_LENGTH = 100;
const MAX_SCOPE_LENGTH = 10000;
const MAX_ENDPOINT_LENGTH = 2048;
const MAX_ENDPOINTS = 500;

export interface SecurityManualScanDetailsSignature {
  Args: {
    detail: SecurityManualScanDetailModel;
  };
}

export default class SecurityManualScanDetailsComponent extends Component<SecurityManualScanDetailsSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked testers: string[] = [];
  @tracked reviewers: string[] = [];
  @tracked coveredScope = '';
  @tracked exemptedScope = '';
  @tracked coveredApiEndpointsText = '';
  @tracked exemptedApiEndpointsText = '';

  maxNames = MAX_NAMES;
  maxNameLength = MAX_NAME_LENGTH;
  maxScopeLength = MAX_SCOPE_LENGTH;
  maxEndpointsTextLength = MAX_ENDPOINTS * (MAX_ENDPOINT_LENGTH + 1);

  constructor(
    owner: unknown,
    args: SecurityManualScanDetailsSignature['Args']
  ) {
    super(owner, args);

    this.loadFormFromDetail();
  }

  get detail() {
    return this.args.detail;
  }

  get coveredApiEndpoints() {
    return this.parseEndpoints(this.coveredApiEndpointsText);
  }

  get exemptedApiEndpoints() {
    return this.parseEndpoints(this.exemptedApiEndpointsText);
  }

  get coveredEndpointsHelperText() {
    return this.endpointsHelperText(this.coveredApiEndpoints.length);
  }

  get exemptedEndpointsHelperText() {
    return this.endpointsHelperText(this.exemptedApiEndpoints.length);
  }

  get formValues() {
    return {
      testers: this.testers,
      reviewers: this.reviewers,
      coveredScope: this.coveredScope.trim(),
      exemptedScope: this.exemptedScope.trim(),
      coveredApiEndpoints: this.coveredApiEndpoints,
      exemptedApiEndpoints: this.exemptedApiEndpoints,
    };
  }

  get hasChanges() {
    const form = this.formValues;

    return (Object.keys(form) as Array<keyof typeof form>).some(
      (key) => JSON.stringify(form[key]) !== JSON.stringify(this.detail[key])
    );
  }

  // One endpoint per line: trimmed, blank lines dropped, repeats collapsed.
  parseEndpoints(text: string) {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return [...new Set(lines)];
  }

  endpointsHelperText(count: number) {
    return [
      this.intl.t('securityManualScanDetails.endpointsHelper'),
      this.intl.t('securityManualScanDetails.endpointCount', { count }),
    ].join(' · ');
  }

  loadFormFromDetail() {
    const detail = this.detail;

    this.testers = [...(detail.testers ?? [])];
    this.reviewers = [...(detail.reviewers ?? [])];
    this.coveredScope = detail.coveredScope ?? '';
    this.exemptedScope = detail.exemptedScope ?? '';
    this.coveredApiEndpointsText = (detail.coveredApiEndpoints ?? []).join(
      '\n'
    );
    this.exemptedApiEndpointsText = (detail.exemptedApiEndpoints ?? []).join(
      '\n'
    );
  }

  @action
  setTesters(names: string[]) {
    this.testers = names;
  }

  @action
  setReviewers(names: string[]) {
    this.reviewers = names;
  }

  saveDetails = task({ drop: true }, async () => {
    const detail = this.detail;

    try {
      detail.setProperties(this.formValues);

      await waitForPromise(detail.save());

      // Show what the server kept (repeats dropped).
      this.loadFormFromDetail();

      this.notify.success(
        this.intl.t('securityManualScanDetails.savedSuccessfully')
      );
    } catch (error) {
      // Keep the typed text; only the record is rolled back.
      detail.rollbackAttributes();

      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::ManualScanDetails': typeof SecurityManualScanDetailsComponent;
  }
}
