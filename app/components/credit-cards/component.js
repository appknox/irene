import Component from "@ember/component";
import PaginateMixin from "irene/mixins/paginate";

export default Component.extend(PaginateMixin, {
  tagName: "",
  targetModel: "credit-card",
  sortProperties: ["addedOn:asc"],
});
