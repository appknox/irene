import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type ClipboardJS from 'clipboard/src/clipboard';

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationCodeBlockSignature {
  Args: {
    label: string;
    code: string;
    testId: string;
  };
}

/** A labelled, copyable code snippet. */
export default class SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationCodeBlockComponent extends Component<SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationCodeBlockSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('copiedToClipboard'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.intl.t('pleaseTryAgain'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Remediation::CodeBlock': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationCodeBlockComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/remediation/code-block': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationCodeBlockComponent;
  }
}
