import commondrf from './commondrf';

export default class UnknownAnalysisStatus extends commondrf {
  urlForQueryRecord(q) {
    const baseurl = `${this.get('namespace')}/profiles/${q.id}/unknown_analysis_status`;
    return this.buildURLFromBase(baseurl);
  }
}
