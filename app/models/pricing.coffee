`import DS from 'ember-data'`

Pricing = DS.Model.extend
  name: DS.attr 'string'
  description: DS.attr 'string'
  price: DS.attr 'number'

  descriptionItems:(->
    description = @get "description"
    description.split ","
  ).property "description"

`export default Pricing`
