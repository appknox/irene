/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import DS from 'ember-data';

const Pricing = DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  price: DS.attr('number'),
  projectsLimit: DS.attr("number"),

  descriptionItems:(function() {
    const description = this.get("description");
    return (description != null ? description.split(",") : undefined);
  }).property("description")
});

export default Pricing;
