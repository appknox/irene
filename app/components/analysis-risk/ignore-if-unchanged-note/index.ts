import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type { IgnoreIfUnchanged } from 'irene/models/analysis';

export interface AnalysisRiskIgnoreIfUnchangedNoteSignature {
  Args: {
    info: IgnoreIfUnchanged;
  };
}

export default class AnalysisRiskIgnoreIfUnchangedNoteComponent extends Component<AnalysisRiskIgnoreIfUnchangedNoteSignature> {
  @service declare intl: IntlService;

  @tracked showMore = false;

  get info() {
    return this.args.info;
  }

  get isReopened() {
    return !this.info.passed && this.info.new_findings > 0;
  }

  // one plain line chosen by the state of the baseline
  get summary() {
    const info = this.info;
    const fileId = info.baseline_file;

    if (info.pending) {
      return this.intl.t('ignoreIfUnchangedPendingNote', {
        scans: this.waitingScans(info.waiting_for),
        fileId,
      });
    }

    if (this.isReopened) {
      return this.intl.t('ignoreIfUnchangedReopenedNote', {
        count: info.new_findings,
        fileId,
      });
    }

    return info.is_baseline_file
      ? this.intl.t('ignoreIfUnchangedBaselineNote', {
          count: info.baseline_findings.length,
        })
      : this.intl.t('ignoreIfUnchangedIgnoredHint', { fileId });
  }

  waitingScans(waitingFor: string[]) {
    return this.intl.formatList(
      waitingFor.map((it) => this.intl.t(it).toLowerCase())
    );
  }

  get createdOn() {
    return this.info.created_on
      ? dayjs(this.info.created_on).format('MMM DD, YYYY')
      : null;
  }

  @action
  toggleShowMore() {
    this.showMore = !this.showMore;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::IgnoreIfUnchangedNote': typeof AnalysisRiskIgnoreIfUnchangedNoteComponent;
  }
}
