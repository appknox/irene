`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';`

{inject: {service}, isEmpty, RSVP} = Ember

AuthenticatedRoute = Ember.Route.extend AuthenticatedRouteMixin,
  breadCrumb: null
  session: service 'session'
  currentUser: service 'current-user'
  actions:
    invalidateSession: ->
      @get('session').invalidate()

`export default AuthenticatedRoute`
