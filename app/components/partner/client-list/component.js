import Component from "@glimmer/component";
import { PaginationMixin } from "../../../mixins/paginate";

export default class PartnerClientListComponent extends PaginationMixin(
  Component
) {
  targetModel = "partner/partnerclient";
  sortProperties = "createdOn:desc";
}
