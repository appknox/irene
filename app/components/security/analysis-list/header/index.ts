// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import { isEmpty } from '@ember/utils';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';

import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type { Owner } from '@ember/test-helpers/build-owner';

import type SecurityFileModel from 'irene/models/security/file';
import type VulnerabilityModel from 'irene/models/vulnerability';
import type IreneAjaxService from 'irene/services/ajax';

type VulnerabilityQueryResponse =
  DS.AdapterPopulatedRecordArray<VulnerabilityModel> & {
    meta: { count: number };
  };

export interface SecurityAnalysisListHeaderComponentSignature {
  Args: {
    file: SecurityFileModel;
    reloadAnalysesList(): void;
  };

  Blocks: {
    analysesFilter: [];
  };
}

export default class SecurityAnalysisListHeaderComponent extends Component<SecurityAnalysisListHeaderComponentSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare ajax: IreneAjaxService;

  @tracked selectedVulnerability: number | null = null;
  @tracked showPurgeAPIAnalysisConfirmBox = false;
  @tracked showAddAnalysisModal = false;

  @tracked vulnerabilitiesResponse: VulnerabilityQueryResponse | null = null;

  constructor(
    owner: Owner,
    args: SecurityAnalysisListHeaderComponentSignature['Args']
  ) {
    super(owner, args);

    this.getVulnerabilities();
  }

  get file() {
    return this.args.file;
  }

  get fileId() {
    return this.file.id;
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get isManualScanEnabled() {
    return this.file.project.get('isManualScanAvailable');
  }

  get projectId() {
    return this.file.project.get('id');
  }

  get vulnerabilities() {
    return this.vulnerabilitiesResponse?.slice() || [];
  }

  @action openAddAnalysisModal() {
    this.showAddAnalysisModal = true;
  }

  @action closeAddAnalysisModal() {
    this.showAddAnalysisModal = false;
  }

  @action selectVulnerabilty(value: number) {
    this.selectedVulnerability = value;
  }

  @action openPurgeAPIAnalysisConfirmBox() {
    this.showPurgeAPIAnalysisConfirmBox = true;
  }

  @action confirmPurgeAPIAnalysisConfirmBox() {
    this.confirmPurge.perform();
  }

  @action addAnalysis() {
    this.doAddAnalysis.perform();
  }

  @action
  getVulnerabilities() {
    this.vulnerabilitiesResponse = this.store.peekAll(
      'vulnerability'
    ) as VulnerabilityQueryResponse;
  }

  confirmPurge = task(async () => {
    const url = `${ENV.endpoints['files']}/${this.fileId}/${ENV.endpoints['purgeAPIAnalyses']}`;

    try {
      await this.ajax.post(url, { namespace: 'api/hudson-api' });

      this.store.findRecord('security/file', this.fileId);
      this.notify.success('Successfully Purged the Analysis');

      this.showPurgeAPIAnalysisConfirmBox = false;
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  doAddAnalysis = task(async () => {
    const vulnerability = this.selectedVulnerability;
    const file = this.file;

    if (isEmpty(vulnerability)) {
      return this.notify.error('Please select a vulnerability');
    }

    const analysis = this.store.createRecord('security/analysis', {
      vulnerability: vulnerability,
      file: file,
    });

    try {
      await waitForPromise(analysis.save());

      this.showAddAnalysisModal = false;
      this.selectedVulnerability = null;

      this.notify.success('Analysis Added Successfully');
      this.args.reloadAnalysesList();
    } catch (err) {
      await analysis?.destroyRecord();
      analysis.unloadRecord();

      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisList::Header': typeof SecurityAnalysisListHeaderComponent;
  }
}
