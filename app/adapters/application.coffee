`import DS from 'ember-data'`
`import config from '../config/environment';`

ApplicationAdapter = DS.RESTAdapter.extend
  host: config.APP.API_HOST
  namespace: 'api'

`export default ApplicationAdapter`
