`import DS from 'ember-data'`

Pricing = DS.Model.extend
  name: DS.attr 'string'
  description: DS.attr 'string'
  price: DS.attr 'number'
  projectsLimit: DS.attr "number"
  invoices: DS.hasMany 'invoice', inverse:'pricing'

  descriptionItems:(->
    description = @get "description"
    description?.split ","
  ).property "description"

`export default Pricing`
