import Component from '@ember/component';
import { computed } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {

  // query: "",
  targetObject: "capturedapi",
  sortProperties: ["id:asc"],
  // resetOffset() {
  //   return this.set("offset", 0);
  // },
  extraQueryStrings: computed("query", function() {
    const query =
      {fileId: this.get("file.id")};
    return JSON.stringify(query, Object.keys(query).sort());
  })
}
);
