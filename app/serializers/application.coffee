`import DS from 'ember-data'`

ApplicationSerializer = DS.RESTSerializer.extend
  serializeId: (id) ->
    id.toString()

`export default ApplicationSerializer`
