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

  formatDate(date: string | null) {
    return date ? dayjs(date).format('MMM DD, YYYY') : null;
  }

  // tells the reader what a card is: the same layout is used on the baseline file and
  // on the files compared with it
  get comparedHeading() {
    return this.intl.t(
      this.info.pending
        ? 'ignoreIfUnchangedHeadingWillCompare'
        : 'ignoreIfUnchangedHeadingCompared'
    );
  }

  // the file where the option was selected: one card per baseline version, newest
  // first. Any other file was compared once with one version: a single card.
  get cards() {
    const info = this.info;

    if (info.is_baseline_file && info.baseline_versions.length > 0) {
      return info.baseline_versions.map((it) => ({
        heading: this.intl.t('ignoreIfUnchangedHeadingBaselineFile'),
        fileId: it.baseline_file,
        version: it.version,
        createdBy: it.created_by,
        createdOn: this.formatDate(it.created_on),
        comment: it.comment,
        findings: it.findings,
        newFindings: [] as string[],
        showChip: true,
        isLatest: it.is_latest,
      }));
    }

    return [
      {
        heading: this.comparedHeading,
        fileId: info.baseline_file,
        version: info.version,
        createdBy: info.created_by,
        createdOn: this.formatDate(info.created_on),
        comment: info.comment,
        findings: info.baseline_findings,
        newFindings: this.isReopened ? info.new_finding_labels : [],
        showChip: false,
        isLatest: false,
      },
    ];
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
