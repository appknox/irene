`import Ember from 'ember'`

{inject: {service}, isEmpty, RSVP} = Ember


CurrentUserService = Ember.Service.extend
  session: service "session"
  store: service()
  load: ->
    if @get 'session.isAuthenticated'
      that = @
      userId = @get "session.data.authenticated.user"
      @get('store').find('user', userId).then (user) ->
        that.set 'user', user

`export default CurrentUserService`
