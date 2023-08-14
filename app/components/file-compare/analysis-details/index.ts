import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import IntlService from 'ember-intl/services/intl';
import AnalysisModel from 'irene/models/analysis';

export interface FileCompareAnalysisDetailsSignature {
  Element: HTMLElement;
  Args: {
    analysis?: AnalysisModel;
    analysisStatus: string;
  };
}

export default class FileCompareAnalysisDetailsComponent extends Component<FileCompareAnalysisDetailsSignature> {
  @service declare intl: IntlService;

  get analysis() {
    return this.args.analysis || null;
  }

  get regulatoryContent() {
    return {
      owasp: this.analysis?.owasp.toArray(),
      cwe: this.analysis?.cwe.toArray(),
      asvs: this.analysis?.asvs.toArray(),
      mstg: this.analysis?.mstg.toArray(),
      gdpr: this.analysis?.gdpr.toArray(),
      pcidss: this.analysis?.pcidss.toArray(),
      hipaa: this.analysis?.hipaa.toArray(),
    };
  }

  get vulnerability() {
    return this.analysis?.vulnerability || null;
  }

  get vulnerabilityDescription() {
    if (this.analysis?.isScanning) {
      return htmlSafe(this.vulnerability?.get?.('question') || '');
    }

    if (this.analysis?.isRisky) {
      return this.vulnerability?.get?.('descriptionUnescapedd');
    }

    return htmlSafe(this.vulnerability?.get?.('successMessage') || '');
  }

  get businessImplication() {
    return htmlSafe(this.vulnerability?.get?.('businessImplication') || '');
  }

  get compliantSolution() {
    return htmlSafe(this.vulnerability?.get?.('compliant') || '');
  }

  get nonCompliantCodeExample() {
    return htmlSafe(this.vulnerability?.get?.('nonCompliant') || '');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::AnalysisDetails': typeof FileCompareAnalysisDetailsComponent;
  }
}
