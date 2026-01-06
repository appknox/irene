import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function analysisStatus(
  params: [
    | number
    | string
    | {
        key: string;
        value: string | number;
      },
  ]
) {
  let risk: number | string = params[0] as number | string;

  if (typeof risk === 'object') {
    risk = (risk as { value: number | string }).value;
  }

  risk = parseInt(String(risk));

  const statuses = {
    [ENUMS.ANALYSIS_STATUS.ERROR]: 'Errored' as const,
    [ENUMS.ANALYSIS_STATUS.WAITING]: 'Not started' as const,
    [ENUMS.ANALYSIS_STATUS.RUNNING]: 'Scanning' as const,
    [ENUMS.ANALYSIS_STATUS.COMPLETED]: 'Completed' as const,
    [ENUMS.ANALYSIS_STATUS.UNKNOWN]: 'Unknown' as const,
  };

  return statuses[risk] || '';
}

const AnalysisStatusHelper = helper(analysisStatus);

export default AnalysisStatusHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'analysis-status': typeof AnalysisStatusHelper;
  }
}
