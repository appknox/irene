`import Ember from 'ember'`
`import config from 'irene/config/environment';`

SetupRoute = Ember.Route.extend
  title: "Set Your Password" + config.platform
  model: (params) ->
    params

`export default SetupRoute`
