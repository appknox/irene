import Component from '@ember/component';
import ENUMS from 'irene/enums';
import {
  computed
} from '@ember/object';

export default Component.extend({
  tagName: ['tr'],

  tags: computed(
    "analysis.vulnerability.types",
    "analysis.file.{isStaticDone,isDynamicDone,isApiDone,manual}",
    function () {
      const types = this.get("analysis.vulnerability.types");
      if (types === undefined) {
        return [];
      }
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
            status: this.get("analysis.file.isDynamicDone"),
            text: "dynamic"
          });
        }
        if (type === ENUMS.VULNERABILITY_TYPE.MANUAL) {
          tags.push({
            status: this.get("analysis.file.manual") == ENUMS.MANUAL.DONE,
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
  )
});
