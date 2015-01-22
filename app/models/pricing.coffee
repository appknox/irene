`import DS from 'ember-data'`

Pricing = DS.Model.extend

  name: DS.attr 'string'
  description: DS.attr 'string'
  pricing_type: DS.attr 'number'
  unit: DS.attr 'number'
  price: DS.attr 'number'

`export default Pricing`
