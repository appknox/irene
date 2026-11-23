import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import { humanize, secretText } from 'irene/utils/offsec-goal-verdict';
import type {
  GoalCredential,
  PentestFinding,
  PentestObservation,
} from 'irene/models/offsec-scan';

export interface GoalVerdictViewFindingsSignature {
  Args: {
    /** The findings the reviewer kept; false positives are dropped when the goal is resolved. */
    findings?: PentestFinding[];
    /** Every observation the goal reported; a finding's observation is looked up here. */
    observations?: PentestObservation[];
    /** Shown through the credentials block when the technique names no findings. */
    credentials?: GoalCredential[];
    evidence?: string;
    isSafe?: boolean;
  };
}

/** Findings of one kind ("Credential assignment · Credential"), stepped through one at a time. */
export interface FindingGroup {
  title: string;
  findings: PentestFinding[];
}

export default class GoalVerdictViewFindingsComponent extends Component<GoalVerdictViewFindingsSignature> {
  @service declare intl: IntlService;

  /** Which finding each group shows, by its title; a group not stepped through shows its first. */
  @tracked positions: Record<string, number> = {};

  /** The rows that are expanded, by title: they show arrows, the rest a count. */
  @tracked openGroups: Record<string, boolean> = {};

  /** The findings, the most severe first. */
  get rows(): PentestFinding[] {
    return [...(this.args.findings ?? [])].sort(
      (a, b) => (b.severity ?? 0) - (a.severity ?? 0)
    );
  }

  /** One row per kind of finding, in the order its most severe one ranks. */
  get groups(): FindingGroup[] {
    const groups = new Map<string, PentestFinding[]>();

    this.rows.forEach((finding) => {
      const title = this.title(finding);

      groups.set(title, [...(groups.get(title) ?? []), finding]);
    });

    return [...groups].map(([title, findings]) => ({ title, findings }));
  }

  position = (group: FindingGroup): number =>
    Math.min(this.positions[group.title] ?? 0, group.findings.length - 1);

  current = (group: FindingGroup): PentestFinding =>
    group.findings[this.position(group)] as PentestFinding;

  pageNumber = (group: FindingGroup): number => this.position(group) + 1;

  isOpen = (group: FindingGroup): boolean =>
    Boolean(this.openGroups[group.title]);

  title = (finding: PentestFinding): string =>
    [humanize(finding.pattern), humanize(finding.kind)]
      .filter(Boolean)
      .join(' · ');

  secret = (finding: PentestFinding): string => secretText(finding) ?? '';

  /** "Verified"; a status without a label of its own shows as words. */
  auditLabel = (status?: string): string => this.label('audit', status);

  exploitabilityLabel = (value?: string): string =>
    this.label('exploitability', value);

  severityReasons = (finding: PentestFinding): string =>
    (finding.severity_because ?? []).join(' ');

  places = (finding: PentestFinding): string =>
    (finding.places?.length ? finding.places : [finding.where])
      .filter(Boolean)
      .join(', ');

  observationIds = (finding: PentestFinding): number[] =>
    finding.observation_id === undefined ? [] : [finding.observation_id];

  label(group: string, value?: string): string {
    const key = `offensiveSecurity.goalView.${group}.${value}`;

    return value && this.intl.exists(key) ? this.intl.t(key) : humanize(value);
  }

  /** The arrows sit inside the row's summary; without this a click would also open or close it. */
  moveTo(group: FindingGroup, position: number, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.positions = { ...this.positions, [group.title]: position };
  }

  @action
  handleToggle(group: FindingGroup, event: Event): void {
    const { open } = event.target as HTMLDetailsElement;

    this.openGroups = { ...this.openGroups, [group.title]: open };
  }

  @action
  previous(group: FindingGroup, event?: Event): void {
    this.moveTo(group, Math.max(0, this.position(group) - 1), event);
  }

  @action
  next(group: FindingGroup, event?: Event): void {
    this.moveTo(
      group,
      Math.min(group.findings.length - 1, this.position(group) + 1),
      event
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::GoalVerdictView::Findings': typeof GoalVerdictViewFindingsComponent;
  }
}
