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

/**
 * Sorts test cases based on severity levels based file 2 analyses
 *
 * @param {FileComparisonItem} a
 * @param {FileComparisonItem} b
 *
 */

const sortByFile2Analyses = (
  a?: FileComparisonItem,
  b?: FileComparisonItem
) => {
  const analysis1ComputedRisk = Number(a?.analysis2?.computedRisk);
  const analysis2ComputedRisk = Number(b?.analysis2?.computedRisk);

  if (analysis2ComputedRisk < analysis1ComputedRisk) {
    return -1;
  }

  if (analysis2ComputedRisk > analysis1ComputedRisk) {
    return 1;
  }

  return 0;
};

/**
 * Sorts test cases based on severity levels based on file 1 analyses
 *
 * @param {FileComparisonItem} a
 * @param {FileComparisonItem} b
 *
 */

const sortByFile1Analyses = (
  a?: FileComparisonItem,
  b?: FileComparisonItem
) => {
  const analysis1ComputedRisk = Number(a?.analysis1?.computedRisk);
  const analysis2ComputedRisk = Number(b?.analysis1?.computedRisk);

  if (analysis2ComputedRisk < analysis1ComputedRisk) {
    return -1;
  }

  if (analysis2ComputedRisk > analysis1ComputedRisk) {
    return 1;
  }

  return 0;
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

  comparisons.sort(sortByFile2Analyses).removeObject(undefined);

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
  categories.resolved.sort(sortByFile1Analyses);
  categories.untested.sort(sortByFile1Analyses);
  categories.newRisks.sort(sortByFile1Analyses);
  categories.recurring.sort(sortByFile1Analyses);

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
  // If a new test case is found in either files
  if (isNaN(file2ComputedRisk) || isNaN(file1ComputedRisk)) {
    return { newRisk: true };
  }

  const file1RiskIsPassed = file1ComputedRisk === ENUMS.RISK.NONE;
  const file2RiskIsPassed = file2ComputedRisk === ENUMS.RISK.NONE;
  const severityLevels = [
    ENUMS.RISK.CRITICAL,
    ENUMS.RISK.HIGH,
    ENUMS.RISK.MEDIUM,
    ENUMS.RISK.LOW,
  ];

  // NEW: If file2 risk is passed and file1 risk is a severity
  const newRisk =
    file2RiskIsPassed && severityLevels.includes(file1ComputedRisk);

  // UNTESTED: If either of the file computed risk is UNKNOWN
  const untested = [file1ComputedRisk, file2ComputedRisk].includes(
    ENUMS.RISK.UNKNOWN
  );

  // RESOLVED: If file1 risk is passed and file2 risk is a severity or both risks are passed
  const resolved =
    (file1RiskIsPassed && severityLevels.includes(file2ComputedRisk)) ||
    (file1RiskIsPassed && file2RiskIsPassed);

  // RECURRING: If both file1 or file2 risks are untested or severities
  const recurring = !untested && !file1RiskIsPassed && !file2RiskIsPassed;

  return { newRisk, resolved, recurring, untested };
};

export { compareFiles, getFileComparisonCategories, getComputedRiskCategory };
