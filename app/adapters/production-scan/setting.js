import commondrf from '../commondrf';

export default class ProductionScanSettingsAdapter extends commondrf {
  buildURL(modelName, id) {
    return this.buildURLFromBase(
      `/${this.namespace_v2}/productionscan/${encodeURIComponent(id)}`
    );
  }
}
