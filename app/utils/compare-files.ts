// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import AnalysisModel from 'irene/models/analysis';
import FileModel from 'irene/models/file';
import VulnerabilityModel from 'irene/models/vulnerability';
import ENUMS from 'irene/enums';

export type FileComparisonItem = {
  vulnerability?: DS.AsyncBelongsTo<VulnerabilityModel>;
  analysis1?: AnalysisModel;
  analysis2?: AnalysisModel;
};

export type FileCompareFilterKey =
  | 'untested'
  | 'newRisks'
  | 'recurring'
  | 'resolved';

export type FileComparisonCategories = Record<
  FileCompareFilterKey,
  FileComparisonItem[]
>;

type CompareFile = FileModel | null;

// Sort order for file risks
const sortPriorityMap = {
  [ENUMS.RISK.NONE]: 0,
  [ENUMS.RISK.UNKNOWN]: 1,
  [ENUMS.RISK.LOW]: 2,
  [ENUMS.RISK.MEDIUM]: 3,
  [ENUMS.RISK.HIGH]: 4,
  [ENUMS.RISK.CRITICAL]: 5,
};

/**
 * Sorts test cases based on severity levels based file analyses
 * @param {AnalysisModel | undefined} analysis1
 * @param {AnalysisModel | undefined} analysis2
 */
const sortByFileAnalyses = (
  analysis1?: AnalysisModel,
  analysis2?: AnalysisModel
) => {
  const analysis1ComputedRisk = Number(analysis1?.computedRisk);
  const analysis2ComputedRisk = Number(analysis2?.computedRisk);

  if (isNaN(analysis1ComputedRisk)) {
    return -1;
  }

  return (
    (sortPriorityMap[analysis2ComputedRisk] as number) -
    (sortPriorityMap[analysis1ComputedRisk] as number)
  );
};

/**
 * Function to compute comparison data between two file analyses
 *
 * @param {CompareFile} file1
 * @param {CompareFile} file2
 * @return FileComparisonItem[]
 */

const compareFiles = (
  file1: CompareFile,
  file2: CompareFile
): FileComparisonItem[] => {
  const comparisons: Array<FileComparisonItem | undefined> = [];

  const file1Analyses = file1?.analyses;
  const file2Analyses = file2?.analyses;

  if (!file1Analyses || !file2Analyses) {
    return [];
  }

  file1Analyses.forEach(function (analysis) {
    const vulnerability = analysis.vulnerability;
    const vulnerability_id = parseInt(String(vulnerability.get('id')));

    let comparison = comparisons[vulnerability_id];

    if (!comparison) {
      comparison = {};
    }

    comparison['analysis1'] = analysis;
    comparison['vulnerability'] = vulnerability;
    comparisons[vulnerability_id] = comparison;
  });

  file2Analyses.forEach(function (analysis) {
    const vulnerability = analysis.vulnerability;
    const vulnerability_id = parseInt(String(vulnerability.get('id')));

    let comparison = comparisons[vulnerability_id];

    if (!comparison) {
      comparison = {};
    }

    comparison['analysis2'] = analysis;
    comparison['vulnerability'] = vulnerability;
    comparisons[vulnerability_id] = comparison;
  });

  comparisons
    .sort((a, b) => sortByFileAnalyses(a?.analysis2, b?.analysis2))
    .removeObject(undefined);

  return comparisons as FileComparisonItem[];
};

/**
 * Filter fn to get the file comparison data
 *
 * @param {Array<FileComparisonItem>} comparisons
 * @returns FileComparisonCategories
 */

const getFileComparisonCategories = (comparisons: FileComparisonItem[]) => {
  const categories: FileComparisonCategories = {
    newRisks: [],
    untested: [],
    recurring: [],
    resolved: [],
  };

  comparisons.forEach((comparison) => {
    const file1ComputedRisk = Number(comparison.analysis1?.computedRisk);
    const file2ComputedRisk = Number(comparison.analysis2?.computedRisk);

    const { untested, recurring, newRisk, resolved } = getComputedRiskCategory(
      file1ComputedRisk,
      file2ComputedRisk
    );

    // Puts comparison result in one of the categories below
    if (untested) {
      categories.untested.push(comparison);
    } else if (recurring) {
      categories.recurring.push(comparison);
    } else if (newRisk) {
      categories.newRisks.push(comparison);
    } else if (resolved) {
      categories.resolved.push(comparison);
    }
  });

  // Sort to move severities in file2 to the top of list
  categories.resolved.sort((a, b) =>
    sortByFileAnalyses(a?.analysis2, b?.analysis2)
  );

  categories.untested.sort((a, b) =>
    sortByFileAnalyses(a?.analysis2, b?.analysis2)
  );

  // Sort to move severities in file1 to the top of list
  categories.newRisks.sort((a, b) =>
    sortByFileAnalyses(a?.analysis1, b?.analysis1)
  );

  categories.recurring.sort((a, b) =>
    sortByFileAnalyses(a?.analysis1, b?.analysis1)
  );

  return categories;
};

/**
 * Function to get category of a file comparison based on the requested filter
 *
 * @param {number} file1ComputedRisk
 * @param {number} file2ComputedRisk
 *
 */

const getComputedRiskCategory = (
  file1ComputedRisk: number,
  file2ComputedRisk: number
) => {
  const file1RiskIsPassed = file1ComputedRisk === ENUMS.RISK.NONE;
  const file2RiskIsPassed = file2ComputedRisk === ENUMS.RISK.NONE;

  const severityLevels = [
    ENUMS.RISK.CRITICAL,
    ENUMS.RISK.HIGH,
    ENUMS.RISK.MEDIUM,
    ENUMS.RISK.LOW,
  ];

  // RESOLVED: If file1 risk is passed
  if (file1RiskIsPassed) {
    return { resolved: true };
  }

  // NEW: Matches the conditions below
  // CONDITION-1: file1 risk is undefined and file2 risk is a unknown, passed, or a severity
  const newCond1 =
    isNaN(file1ComputedRisk) &&
    (severityLevels.includes(file2ComputedRisk) ||
      file2ComputedRisk === ENUMS.RISK.UNKNOWN ||
      file2RiskIsPassed);

  // CONDITION-2: file1 risk is a severity and file2 risk is a unknown, passed, or undefined
  const newCond2 =
    severityLevels.includes(file1ComputedRisk) &&
    (file2ComputedRisk === ENUMS.RISK.UNKNOWN ||
      file2RiskIsPassed ||
      isNaN(file2ComputedRisk));

  if (newCond1 || newCond2) {
    return { newRisk: true };
  }

  // UNTESTED: If file1 risk is unknown
  const untested = file1ComputedRisk === ENUMS.RISK.UNKNOWN;

  // RECURRING: If both file1 or file2 risks are severities
  const recurring = !untested && !file1RiskIsPassed && !file2RiskIsPassed;

  return { recurring, untested };
};

export { compareFiles, getFileComparisonCategories, getComputedRiskCategory };
