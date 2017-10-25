`import DS from 'ember-data'`

Plan = DS.Model.extend
  planId: DS.attr 'string'
  name: DS.attr 'string'
  description: DS.attr 'string'
  price: DS.attr 'number'
  projectsLimit: DS.attr "number"
  monthlyUrl: DS.attr 'string'
  quarterlyUrl: DS.attr 'string'
  halfYearlyUrl: DS.attr 'string'
  yearlyUrl: DS.attr 'string'
  monthlyPrice: DS.attr 'string'
  quarterlyPrice: DS.attr 'string'
  halfYearlyPrice: DS.attr 'string'
  yearlyPrice: DS.attr 'string'

  descriptionItems:(->
    description = @get "description"
    description?.split ","
  ).property "description"

`export default Plan`
