`import Ember from 'ember'`
`import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin'`
{inject: {service}, isEmpty, RSVP} = Ember

ApplicationRoute = Ember.Route.extend
  currentUser: service(),

  beforeModel: ->
    @_loadCurrentUser()

  sessionAuthenticated: ->
    @_super arguments
    @_loadCurrentUser().catch () => @get('session').invalidate()

  _loadCurrentUser: ->
    @get('currentUser').load()

`export default ApplicationRoute`
