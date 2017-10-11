`import DS from 'ember-data'`

Plan = DS.Model.extend
  name: DS.attr 'string'
  description: DS.attr 'string'
  price: DS.attr 'number'
  projectsLimit: DS.attr "number"
  url: DS.attr 'string'

  descriptionItems:(->
    description = @get "description"
    description?.split ","
  ).property "description"

`export default Plan`
