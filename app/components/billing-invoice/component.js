import Component from "@ember/component";
import PaginateMixin from "irene/mixins/paginate";

export default Component.extend(PaginateMixin, {
  tagName: "",
  targetModel: "billing-invoice",
  sortProperties: ["created:desc"],
});
