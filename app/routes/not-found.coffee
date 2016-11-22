`import Ember from 'ember'`

NotFoundRoute = Ember.Route.extend
  redirect: ->
    url = @router.location.formatURL '/not-found'
    if window.location.pathname isnt url
      @transitionTo '/not-found'

`export default NotFoundRoute`
