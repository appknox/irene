import commondrf from './commondrf';

type UnknownAnalysisStatusQuery = {
  id: string | number;
};

export default class UnknownAnalysisStatus extends commondrf {
  urlForQueryRecord(query: UnknownAnalysisStatusQuery) {
    const baseurl = `${this.namespace}/profiles/${query.id}/unknown_analysis_status`;

    return this.buildURLFromBase(baseurl);
  }
}
