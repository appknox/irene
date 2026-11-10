import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import {
  goalTechniqueMetrics,
  normalizeGoalVerdict,
  techniqueTone,
  techniqueVerdict,
} from 'irene/utils/offsec-goal-verdict';
import type {
  GoalPath,
  GoalTechnique,
  GoalVerdict,
  PentestGoalResult,
} from 'irene/models/offsec-scan';

export interface GoalVerdictViewSignature {
  Args: {
    goal: PentestGoalResult;
    /** Shows the other-techniques page instead of the goal page. */
    showOthers?: boolean;
    onOpenOtherTechniques: () => void;
  };
}

export type GoalLayout = 'exploit' | 'weakness' | 'proof';

export type OtherFilter = 'all' | 'confirmed' | 'not_tested' | 'safe';

const OTHER_FILTERS: OtherFilter[] = ['all', 'confirmed', 'not_tested', 'safe'];

const OTHER_FILTER_LABEL: Record<OtherFilter, string> = {
  all: 'filterAll',
  confirmed: 'filterConfirmed',
  not_tested: 'filterNotTested',
  safe: 'filterSafe',
};

// weaknesses first, then what never ran, then what came back clean
const OTHER_RANK: Record<string, number> = {
  confirmed: 0,
  not_tested: 1,
  safe: 2,
};

export interface TechniqueCard {
  technique: GoalTechnique;
  /** The pill's words, from the technique's result. */
  verdict: GoalVerdict;
  /** The pill's colour; a confirmed weakness is amber on a technique, though blue on a goal. */
  tone: GoalVerdict;
  /** Set when the card is one step of a chained path. */
  chainStep?: { step: number; total: number };
}

export interface PathPage {
  path: GoalPath;
  isChain: boolean;
  cards: TechniqueCard[];
}

const LAYOUT_BY_VERDICT: Record<GoalVerdict, GoalLayout> = {
  exploited: 'exploit',
  partial: 'exploit',
  weakness: 'weakness',
  untested: 'proof',
  held: 'proof',
};

export default class OffensiveSecurityScanResultsGoalVerdictViewComponent extends Component<GoalVerdictViewSignature> {
  @service declare intl: IntlService;

  @tracked pageIndex = 0;
  @tracked otherIndex = 0;
  @tracked otherFilter: OtherFilter = 'all';

  get verdict(): GoalVerdict {
    return normalizeGoalVerdict(this.args.goal.verdict) ?? 'untested';
  }

  /** Exploited and partly exploited share one layout; the other verdicts each have their own. */
  get layout(): GoalLayout {
    return LAYOUT_BY_VERDICT[this.verdict];
  }

  get isExploitLayout(): boolean {
    return this.layout === 'exploit';
  }

  get isWeaknessLayout(): boolean {
    return this.layout === 'weakness';
  }

  get isProofLayout(): boolean {
    return this.layout === 'proof';
  }

  get isUntestedGoal(): boolean {
    return this.verdict === 'untested';
  }

  get techniques(): GoalTechnique[] {
    return this.args.goal.techniques ?? [];
  }

  get techniquesById(): Map<string, GoalTechnique> {
    return new Map(
      this.techniques.map((technique) => [technique.id, technique])
    );
  }

  get pathPages(): PathPage[] {
    return (this.args.goal.paths ?? []).map((path) => {
      const ids = [...new Set(path.steps.map((s) => s.label).filter(Boolean))];

      const techniques = ids
        .map((id) => this.techniquesById.get(id as string))
        .filter((technique): technique is GoalTechnique => Boolean(technique));

      const isChain = path.type === 'chain' && techniques.length > 1;

      return {
        path,
        isChain,
        cards: techniques.map((technique) => ({
          ...this.toCard(technique),
          // a card is numbered by where its step sits in the path
          chainStep: isChain
            ? {
                step:
                  path.steps.findIndex((s) => s.label === technique.id) + 1 ||
                  1,
                total: path.steps.length,
              }
            : undefined,
        })),
      };
    });
  }

  get weaknessCards(): TechniqueCard[] {
    return this.toCards(
      this.techniques.filter((t) => t.status === 'confirmed')
    );
  }

  get proofCards(): TechniqueCard[] {
    return this.toCards(this.techniques);
  }

  get untestedTechniquesCount(): number {
    return this.techniques.filter((t) => t.status === 'not_tested').length;
  }

  get pageCount(): number {
    if (this.isExploitLayout) {
      return this.pathPages.length;
    }

    return this.isWeaknessLayout
      ? this.weaknessCards.length
      : this.proofCards.length;
  }

  get safeIndex(): number {
    return Math.min(this.pageIndex, Math.max(0, this.pageCount - 1));
  }

  get pageNumber(): number {
    return this.safeIndex + 1;
  }

  get currentPathPage(): PathPage | undefined {
    return this.pathPages[this.safeIndex];
  }

  get currentWeakness(): TechniqueCard | undefined {
    return this.weaknessCards[this.safeIndex];
  }

  get currentProof(): TechniqueCard | undefined {
    return this.proofCards[this.safeIndex];
  }

  get metrics() {
    return goalTechniqueMetrics(this.techniques);
  }

  /** Not shown once everything is listed inline (not vulnerable, untested) or when nothing else was attempted. */
  get showOtherTechniques(): boolean {
    return !this.isProofLayout && this.metrics.total > this.metrics.exploited;
  }

  get otherTechniquesLabelKey(): string {
    return this.metrics.exploited > 0
      ? 'offensiveSecurity.goalView.otherTechniquesCta'
      : 'offensiveSecurity.goalView.techniquesAttemptedCta';
  }

  get noFindKey(): string {
    const key = {
      held: 'noFindHeld',
      untested: 'noFindUntested',
    }[this.verdict as string];

    return `offensiveSecurity.goalView.${key ?? 'noFindOther'}`;
  }

  get proofTitleKey(): string {
    return `offensiveSecurity.goalView.${
      this.isUntestedGoal ? 'triedUntestedTitle' : 'triedHeldTitle'
    }`;
  }

  /** What the agent did for a technique, with a generic line when the API gave none. */
  triedText = (technique: GoalTechnique): string =>
    technique.tried ||
    this.intl.t('offensiveSecurity.goalView.probedDefault', {
      category: technique.category,
    });

  /** The reason behind a technique's result on the "What was tried" cards. */
  proofReason = (technique: GoalTechnique): string => {
    const tried = this.triedText(technique);

    if (technique.status === 'safe') {
      return this.join(
        tried,
        technique.safe_result ??
          this.intl.t('offensiveSecurity.goalView.safeDefaultResult'),
        technique.safe_conclusion ??
          this.intl.t('offensiveSecurity.goalView.safeDefaultConclusion')
      );
    }

    if (technique.status === 'not_tested') {
      return this.join(
        tried,
        this.intl.t('offensiveSecurity.goalView.notTestedResult')
      );
    }

    return this.join(tried, technique.outcome ?? '');
  };

  /** What the agent found for a weakness: what it tried and what came of it. */
  foundText = (technique: GoalTechnique): string =>
    this.join(this.triedText(technique), technique.outcome ?? '');

  weaknessText = (technique: GoalTechnique): string =>
    this.join(technique.description ?? technique.flaw, technique.impact ?? '');

  /** Everything assessed beyond the exploited paths; a weakness-only goal already lists its weaknesses. */
  get allOthers(): GoalTechnique[] {
    const skipConfirmed = this.verdict === 'weakness';

    return this.techniques
      .filter(
        (t) =>
          t.status !== 'exploited' &&
          !(skipConfirmed && t.status === 'confirmed')
      )
      .sort(
        (a, b) => (OTHER_RANK[a.status] ?? 3) - (OTHER_RANK[b.status] ?? 3)
      );
  }

  get otherFilterOptions() {
    return OTHER_FILTERS.map((key) => ({
      key,
      labelKey: `offensiveSecurity.otherTechniques.${OTHER_FILTER_LABEL[key]}`,
      count:
        key === 'all'
          ? this.allOthers.length
          : this.allOthers.filter((t) => t.status === key).length,
      isActive: this.activeOtherFilter === key,
    })).filter((option) => option.key === 'all' || option.count > 0);
  }

  /** The chosen chip, or All when its technique count is zero. */
  get activeOtherFilter(): OtherFilter {
    const hasAny =
      this.otherFilter === 'all' ||
      this.allOthers.some((t) => t.status === this.otherFilter);

    return hasAny ? this.otherFilter : 'all';
  }

  get otherCards(): TechniqueCard[] {
    const filter = this.activeOtherFilter;

    return this.toCards(
      filter === 'all'
        ? this.allOthers
        : this.allOthers.filter((t) => t.status === filter)
    );
  }

  get otherSafeIndex(): number {
    return Math.min(this.otherIndex, Math.max(0, this.otherCards.length - 1));
  }

  get currentOther(): TechniqueCard | undefined {
    return this.otherCards[this.otherSafeIndex];
  }

  get otherKickerKey(): string {
    return this.metrics.exploited > 0
      ? 'offensiveSecurity.otherTechniques.kickerOther'
      : 'offensiveSecurity.otherTechniques.kickerAll';
  }

  /** The reason behind an other technique's result, with the default outcome and conclusion for its status. */
  otherReason = (technique: GoalTechnique): string => {
    const tried = this.triedText(technique);
    const key = (name: string) => `offensiveSecurity.otherTechniques.${name}`;

    if (technique.status === 'safe') {
      return this.join(
        tried,
        technique.safe_result ?? this.intl.t(key('outcomeSafe')),
        technique.safe_conclusion ?? this.intl.t(key('conclusionSafe'))
      );
    }

    return this.join(
      tried,
      this.intl.t(key('outcomeNotTested')),
      this.intl.t(key('conclusionNotTested'))
    );
  };

  @action
  setOtherFilter(filter: OtherFilter): void {
    this.otherFilter = filter;
    this.otherIndex = 0;
  }

  @action
  otherPrevious(): void {
    this.otherIndex = Math.max(0, this.otherSafeIndex - 1);
  }

  @action
  otherNext(): void {
    this.otherIndex = Math.min(
      this.otherCards.length - 1,
      this.otherSafeIndex + 1
    );
  }

  @action
  previous(): void {
    this.pageIndex = Math.max(0, this.safeIndex - 1);
  }

  @action
  next(): void {
    this.pageIndex = Math.min(this.pageCount - 1, this.safeIndex + 1);
  }

  private toCards(techniques: GoalTechnique[]): TechniqueCard[] {
    return techniques.map((technique) => this.toCard(technique));
  }

  private toCard(technique: GoalTechnique): TechniqueCard {
    return {
      technique,
      verdict: techniqueVerdict(technique.status),
      tone: techniqueTone(technique.status),
    };
  }

  private join(...parts: string[]): string {
    return parts.filter(Boolean).join(' ');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::GoalVerdictView': typeof OffensiveSecurityScanResultsGoalVerdictViewComponent;
  }
}
