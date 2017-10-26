`import Ember from 'ember'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

NotFoundRoute = Ember.Route.extend RouteTitleMixin,

  subtitle: "Not Found"
  redirect: ->
    url = @router.location.formatURL '/not-found'
    if window.location.pathname isnt url
      @transitionTo '/not-found'

`export default NotFoundRoute`
