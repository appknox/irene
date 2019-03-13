import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';
import { run } from '@ember/runloop';

export default Component.extend(PaginateMixin, {

  query: "",
  targetObject: "security/project",

  sortProperties: ["-id"],

  newProjectObserver: observer("realtime.ProjectCount", function() {
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
          result.push(run.once(this, 'resetOffset'));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }),

  extraQueryStrings: computed("query", function() {
    const query =
      {q: this.get("query")};
    return JSON.stringify(query, Object.keys(query).sort());
  })
}
);
