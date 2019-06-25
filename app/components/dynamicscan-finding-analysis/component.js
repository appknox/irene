import ENUMS from 'irene/enums';
import Component from '@ember/component';
import { computed } from '@ember/object';

const AnalysisDetailsComponent = Component.extend({

  selectorid: computed('analysis', function(){
    return "#analysis-"+this.get('analysis.id');
  }),
  tags: computed(
    "analysis.vulnerability.types",
    "analysis.file.{isStaticDone,isDynamicDone,isManualDone,isApiDone}","dynamicscan","dynamicscan.status",
    function() {
      const types = this.get("analysis.vulnerability.types");
      if (types === undefined) { return []; }
      const tags = [];
      for (let type of Array.from(types)) {
        if (type === ENUMS.VULNERABILITY_TYPE.STATIC) {
          tags.push({
            status: this.get("analysis.file.isStaticDone"),
            text: "static"
          });
        }
        if (type === ENUMS.VULNERABILITY_TYPE.DYNAMIC) {
          tags.push({
            status: this.get("dynamicscan.status")===ENUMS.DYNAMIC_STATUS.COMPLETED,
            text: "dynamic"
          });
        }
        if (type === ENUMS.VULNERABILITY_TYPE.MANUAL) {
          tags.push({
            status: this.get("analysis.file.isManualDone"),
            text: "manual"
          });
        }
        if (type === ENUMS.VULNERABILITY_TYPE.API) {
          tags.push({
            status: this.get("analysis.file.isApiDone"),
            text: "api"
          });
        }
      }
      return tags;
    }
  ),
});

export default AnalysisDetailsComponent;
