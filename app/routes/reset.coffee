`import Ember from 'ember'`
`import config from 'irene/config/environment';`

ResetRoute = Ember.Route.extend
  title: "Reset Password" + config.Platform
  model: (params) ->
    params

`export default ResetRoute`
