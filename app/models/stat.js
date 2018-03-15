import DS from 'ember-data';

const Stat = DS.Model.extend({

  totalCritical: DS.attr('number'),
  totalHigh: DS.attr('number'),
  totalMedium: DS.attr('number'),
  totalLow: DS.attr('number')
});

export default Stat;
