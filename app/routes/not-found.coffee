`import Ember from 'ember'`

NotFoundRoute = Ember.Route.extend
  title: "Not Found | Appknox"
  redirect: ->
    url = @router.location.formatURL '/not-found'
    if window.location.pathname isnt url
      @transitionTo '/not-found'

`export default NotFoundRoute`
