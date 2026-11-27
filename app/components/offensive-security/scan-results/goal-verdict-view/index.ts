import Component from '@glimmer/component';
import { capitalize } from '@ember/string';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import { mergedCvssFields } from 'irene/utils/offsec-cvss';
import {
  goalDescriptionText,
  goalTechniqueMetrics,
  normalizeGoalVerdict,
  parseGoalDetail,
  readableAgentText,
  techniqueTone,
  techniqueVerdict,
  verbName,
} from 'irene/utils/offsec-goal-verdict';
import type {
  GoalPath,
  GoalPathStep,
  GoalTechnique,
  GoalVerdict,
  PentestFinding,
  ResolvedGoalResult,
} from 'irene/models/offsec-scan';

export interface GoalVerdictViewSignature {
  Args: {
    goal: ResolvedGoalResult;
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
  /** How many techniques of the same kind the card stands for, when more than one. */
  count?: number;
}

export interface PathPage {
  /** Missing when the agent reported no path; the page then shows a note above any exploited cards. */
  path?: GoalPath;
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

/** A technique that worked: exploited, or a weakness the agent confirmed. */
function isWorked(technique: GoalTechnique): boolean {
  return technique.status === 'exploited' || technique.status === 'confirmed';
}

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

  get detail() {
    return parseGoalDetail(this.args.goal.detail, this.args.goal.description);
  }

  get description(): string {
    return goalDescriptionText(this.args.goal.description);
  }

  get allPaths(): GoalPath[] {
    return this.args.goal.paths ?? [];
  }

  /** Findings no technique lists; no card would show them, so they get a panel of their own. */
  get unclaimedFindings(): PentestFinding[] {
    return this.args.goal.unclaimed_findings ?? [];
  }

  /**
   * The paths that reached the goal; the rest are not shown. An
   * exploited goal without any falls back to the route its detail spells out.
   */
  get goalPaths(): GoalPath[] {
    const paths = this.allPaths.filter(
      (path) => !path.status || path.status === 'succeeded'
    );
    const { route, intro } = this.detail;

    if (paths.length || !this.isExploitLayout || !route.length) {
      return paths;
    }

    return [
      {
        type: route.length > 1 ? 'chain' : 'individual',
        steps: route,
        outcome: this.intl.t('offensiveSecurity.goalView.routeOutcome'),
        summary: intro || undefined,
      },
    ];
  }

  get techniques(): GoalTechnique[] {
    return this.args.goal.techniques ?? [];
  }

  get techniquesById(): Map<string, GoalTechnique> {
    return new Map(
      this.techniques.map((technique) => [technique.id, technique])
    );
  }

  /** Every path that reached its end shows here, whatever the goal's verdict; the rest are on the other-techniques page. */
  get showPathsPanel(): boolean {
    // older payloads send paths without a status; only an exploited goal reads those as reached
    return (
      this.isExploitLayout ||
      this.allPaths.some((path) => path.status === 'succeeded')
    );
  }

  get pathPages(): PathPage[] {
    const exploited = this.techniques.filter((t) => t.status === 'exploited');

    // with no path the page still shows the note, and any exploited cards under it
    if (!this.goalPaths.length) {
      return [{ isChain: false, cards: this.groupedCards(exploited) }];
    }

    return this.goalPaths.map((path) => {
      // a numbered path is named by the techniques tried on it, not by its steps
      if (path.number !== undefined) {
        return this.numberedPathPage(path, path.number);
      }

      const ids = [...new Set(path.steps.map((s) => s.label).filter(Boolean))];

      // a path whose steps name no technique shows the exploited ones, one card per kind
      if (!ids.length) {
        return {
          path,
          isChain: false,
          cards: this.groupedCards(exploited),
        };
      }

      return this.labelledPathPage(path, ids as string[]);
    });
  }

  /** Techniques shown as cards under a path; everything else belongs on the other-techniques page. */
  get pathTechniqueIds(): Set<string> {
    if (!this.showPathsPanel) {
      return new Set();
    }

    return new Set(
      this.pathPages.flatMap((page) => page.cards.map((c) => c.technique.id))
    );
  }

  /** A goal that was not exploited lists the weaknesses its paths turned up, not exploits. */
  get pathCardsTitleKey(): string {
    return this.isExploitLayout
      ? 'offensiveSecurity.goalView.exploitFindings'
      : 'offensiveSecurity.goalView.weaknessFindings';
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

  /** Not shown once everything is listed inline (not vulnerable, untested) or when the page would be empty. */
  get showOtherTechniques(): boolean {
    if (!this.showPathsPanel) {
      return !this.isProofLayout && this.allOthers.length > 0;
    }

    return this.allOthers.length > 0;
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
      exploited: 'noPathReported',
      partial: 'noPathReported',
    }[this.verdict as string];

    return `offensiveSecurity.goalView.${key ?? 'noFindOther'}`;
  }

  get proofTitleKey(): string {
    return `offensiveSecurity.goalView.${
      this.isUntestedGoal ? 'triedUntestedTitle' : 'triedHeldTitle'
    }`;
  }

  /** A step as the tool it called, in words; the raw step text shows under it. */
  stepName = (step: GoalPathStep): string => verbName(step.verb);

  /** Agent prose without the observation ids it cites. */
  text = (raw?: string): string => readableAgentText(raw);

  /** Steps, findings or an evidence line to show under "How it was exploited" / "Evidence". */
  hasEvidence = (technique: GoalTechnique): boolean =>
    Boolean(
      technique.repro?.length ||
      technique.findings?.length ||
      technique.evidence
    );

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

  /** What a technique checks for, starting with a capital since the API often sends it lowercase. */
  flawText = (technique: GoalTechnique): string =>
    capitalize(technique.description ?? technique.flaw ?? '');

  /** The weakness and its impact. */
  weaknessText = (technique: GoalTechnique): string =>
    this.join(this.flawText(technique), technique.impact ?? '');

  /** Everything assessed beyond the cards on the goal page; a weakness-only goal already lists its weaknesses. */
  get allOthers(): GoalTechnique[] {
    const skipConfirmed = !this.showPathsPanel && this.verdict === 'weakness';
    const shown = this.pathTechniqueIds;

    return this.techniques
      .filter(
        (t) =>
          t.status !== 'exploited' &&
          !shown.has(t.id) &&
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

  /** The techniques that worked on a numbered path, as cards. */
  private numberedPathPage(path: GoalPath, number: number): PathPage {
    const linked = this.techniques.filter((t) => t.paths?.includes(number));

    return {
      path,
      isChain: false,
      cards: this.toCards(linked.filter(isWorked)),
    };
  }

  /** A path whose steps name their techniques; a chain numbers each card by its step. */
  private labelledPathPage(path: GoalPath, ids: string[]): PathPage {
    const techniques = ids
      .map((id) => this.techniquesById.get(id))
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
                path.steps.findIndex((s) => s.label === technique.id) + 1 || 1,
              total: path.steps.length,
            }
          : undefined,
      })),
    };
  }

  /** One card per category and name, its evidence lines and credentials gathered into one. */
  private groupedCards(techniques: GoalTechnique[]): TechniqueCard[] {
    const groups = new Map<string, GoalTechnique[]>();

    techniques.forEach((technique) => {
      const key = `${technique.category}\u0000${technique.name}`;
      groups.set(key, [...(groups.get(key) ?? []), technique]);
    });

    return [...groups.values()].map((group) => {
      const [first] = group as [GoalTechnique];

      const evidence = group
        .map((t) => t.evidence)
        .filter(Boolean)
        .join('\n');

      const credentials = group.flatMap((t) => t.credentials ?? []);

      return {
        ...this.toCard({
          ...first,
          ...mergedCvssFields(group),
          evidence: evidence || undefined,
          credentials: credentials.length ? credentials : undefined,
        }),
        count: group.length > 1 ? group.length : undefined,
      };
    });
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
