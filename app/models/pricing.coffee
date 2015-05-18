`import DS from 'ember-data'`

Pricing = DS.Model.extend

  name: DS.attr 'string'
  description: DS.attr 'string'
  pricingType: DS.attr 'number'
  unit: DS.attr 'number'
  price: DS.attr 'number'
  isBulky: DS.attr 'boolean'
  manual: DS.attr 'boolean'
  offer: DS.attr 'number'
  users: DS.hasMany 'user', inverse: 'pricing'

  descriptions: (->
    description = @get "description"
    description.split ","
  ).property "description"

`export default Pricing`
