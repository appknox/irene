`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';`

{inject: {service}, isEmpty, RSVP} = Ember

AuthenticatedRoute = Ember.Route.extend AuthenticatedRouteMixin,
  breadCrumb: null
  session: service 'session'

  model: ->
    userId = @get "session.data.authenticated.user"
    @get('store').find('user', userId)

  actions:
    invalidateSession: ->
      @get('session').invalidate()

`export default AuthenticatedRoute`
