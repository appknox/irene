`import DS from 'ember-data'`
`import ENV from 'irene/config/environment';`

ApplicationAdapter = DS.RESTAdapter.extend
  host: ENV.APP.API_HOST
  namespace: ENV.APP.API_NAMESPACE
  shouldBackgroundReloadRecord: (store, snapshotRecordArray) ->
    true

`export default ApplicationAdapter`
