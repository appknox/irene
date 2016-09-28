`import Ember from 'ember'`
`import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';`

AuthenticatedRoute = Ember.Route.extend AuthenticatedRouteMixin,
  breadCrumb: null
  session: Ember.inject.service 'session'
  actions:
    invalidateSession: ->
      this.get('session').invalidate()
      
`export default AuthenticatedRoute`
