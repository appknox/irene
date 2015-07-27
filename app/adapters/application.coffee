`import DS from 'ember-data'`
`import ENV from 'irene/config/environment';`
`import ApplicationSerializer from 'irene/serializers/application';`

ApplicationAdapter = DS.RESTAdapter.extend
  host: ENV.APP.API_HOST
  namespace: ENV.APP.API_NAMESPACE
  shouldBackgroundReloadRecord: (store, snapshotRecordArray) ->
    # Fixme: this should act smart
    false

`export default ApplicationAdapter`
