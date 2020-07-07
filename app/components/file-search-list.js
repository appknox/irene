import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';
import { once } from '@ember/runloop';

export default Component.extend(PaginateMixin, {
  query: "",
  targetModel: "security/file",

  sortProperties: ["-id"],

  newFileObserver: observer("realtime.FileCount", function() {
    return this.incrementProperty("version");
  }),

  resetOffset() {
    return this.set("offset", 0);
  },

  offsetResetter: observer("query", function() {
    return (() => {
      const result = [];
      for (let property of ["query"]) {
        const propertyOldName = `_${property}`;
        const propertyNewValue = this.get(property);
        const propertyOldValue = this.get(propertyOldName);
        const propertyChanged = propertyOldValue !== propertyNewValue;
        if (propertyChanged) {
          this.set(propertyOldName, propertyNewValue);
          result.push(once(this, 'resetOffset'));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }),

  extraQueryStrings: computed('project.projectid', 'query', function() {
    const query = {
      query: this.get("query"),
      projectId: this.get("project.projectid")
    };
    return JSON.stringify(query, Object.keys(query).sort());
  })
});
