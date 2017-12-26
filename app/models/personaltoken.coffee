`import DS from 'ember-data'`

Personaltoken = DS.Model.extend
  key: DS.attr 'string'
  name: DS.attr 'string'
  created: DS.attr 'date'

  createdDateOnHumanized: (->
    created = @get 'created'
    created.toLocaleDateString()
  ).property 'created'

`export default Personaltoken`
