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
