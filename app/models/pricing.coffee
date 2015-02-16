`import DS from 'ember-data'`

Pricing = DS.Model.extend

  name: DS.attr 'string'
  description: DS.attr 'string'
  pricingType: DS.attr 'number'
  unit: DS.attr 'number'
  price: DS.attr 'number'
  isBulky: DS.attr 'boolean'
  offer: DS.attr 'number'

`export default Pricing`
