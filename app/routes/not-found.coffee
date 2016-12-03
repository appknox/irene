`import Ember from 'ember'`
`import config from 'irene/config/environment';`

NotFoundRoute = Ember.Route.extend
  title: "Not Found" + config.platform
  redirect: ->
    url = @router.location.formatURL '/not-found'
    if window.location.pathname isnt url
      @transitionTo '/not-found'

`export default NotFoundRoute`
