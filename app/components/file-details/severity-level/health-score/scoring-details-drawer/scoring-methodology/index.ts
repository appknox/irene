import Component from '@glimmer/component';

interface FormulaItem {
  number: number;
  titleKey: string;
  answerKey: string;
}

interface AdjustmentItem {
  titleKey: string;
  descKey: string;
}

interface ScoreBand {
  range: string;
  ratingKey: string;
  chipClass: string;
}

interface ExampleItem {
  nameKey: string;
  descKey: string;
  score: string;
  badgeKey: string;
  badgeClass: string;
}

const FORMULA_ITEMS: FormulaItem[] = [
  {
    number: 1,
    titleKey: 'healthScore.scoringMethodology.q1Title',
    answerKey: 'healthScore.scoringMethodology.q1Answer',
  },
  {
    number: 2,
    titleKey: 'healthScore.scoringMethodology.q2Title',
    answerKey: 'healthScore.scoringMethodology.q2Answer',
  },
];

const ADJUSTMENTS: AdjustmentItem[] = [
  {
    titleKey: 'healthScore.scoringMethodology.adjustmentCoverageTitle',
    descKey: 'healthScore.scoringMethodology.adjustmentCoverageDesc',
  },
  {
    titleKey: 'healthScore.scoringMethodology.adjustmentAcceptedTitle',
    descKey: 'healthScore.scoringMethodology.adjustmentAcceptedDesc',
  },
  {
    titleKey: 'healthScore.scoringMethodology.adjustmentSeverityTitle',
    descKey: 'healthScore.scoringMethodology.adjustmentSeverityDesc',
  },
];

const SCORE_BANDS: ScoreBand[] = [
  {
    range: '90 – 100',
    ratingKey: 'healthScore.scoringMethodology.ratingExcellent',
    chipClass: 'excellent',
  },
  {
    range: '75 – 89',
    ratingKey: 'healthScore.scoringMethodology.ratingGood',
    chipClass: 'good',
  },
  {
    range: '60 – 74',
    ratingKey: 'healthScore.scoringMethodology.ratingFair',
    chipClass: 'fair',
  },
  {
    range: '40 – 59',
    ratingKey: 'healthScore.scoringMethodology.ratingPoor',
    chipClass: 'poor',
  },
  {
    range: '0 – 39',
    ratingKey: 'healthScore.scoringMethodology.ratingVeryPoor',
    chipClass: 'very-poor',
  },
];

const EXAMPLES: ExampleItem[] = [
  {
    nameKey: 'healthScore.scoringMethodology.exampleAppA',
    descKey: 'healthScore.scoringMethodology.exampleAppADesc',
    score: '49/100',
    badgeKey: 'healthScore.scoringMethodology.ratingPoor',
    badgeClass: 'poor',
  },
  {
    nameKey: 'healthScore.scoringMethodology.exampleAppB',
    descKey: 'healthScore.scoringMethodology.exampleAppBDesc',
    score: '87/100',
    badgeKey: 'healthScore.scoringMethodology.ratingGood',
    badgeClass: 'good',
  },
  {
    nameKey: 'healthScore.scoringMethodology.exampleAppC',
    descKey: 'healthScore.scoringMethodology.exampleAppCDesc',
    score: '27/100',
    badgeKey: 'healthScore.scoringMethodology.ratingVeryPoor',
    badgeClass: 'very-poor',
  },
];

export default class FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerScoringMethodologyComponent extends Component {
  formulaItems = FORMULA_ITEMS;
  adjustments = ADJUSTMENTS;
  scoreBands = SCORE_BANDS;
  examples = EXAMPLES;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SeverityLevel::HealthScore::ScoringDetailsDrawer::ScoringMethodology': typeof FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerScoringMethodologyComponent;
    'file-details/severity-level/health-score/scoring-details-drawer/scoring-methodology': typeof FileDetailsSeverityLevelHealthScoreScoringDetailsDrawerScoringMethodologyComponent;
  }
}
