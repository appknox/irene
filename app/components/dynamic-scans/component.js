import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  classNames: ['dynamicscan'],
  targetObject: "dynamicscan",
  sortProperties: ["id:desc"],
  disableScroll: true,
  newMembersObserver: observer("realtime.dynamicScanCount", function() {
    return this.incrementProperty("version");
  }),
  extraQueryStrings: computed("query", function() {
    const query =
      {fileId: this.get("file.id")};
    return JSON.stringify(query, Object.keys(query).sort());
  }),
 }
);
