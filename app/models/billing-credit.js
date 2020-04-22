import DS from "ember-data";

export default DS.Model.extend({
  credits: DS.attr("number"),
  currency: DS.attr("string"),
  updatedOn: DS.attr("date"),
});
