`import Ember from 'ember';`
`import Base from 'ember-simple-auth/authenticators/base';`
`import ENV from 'irene/config/environment';`

b64EncodeUnicode = (str) ->
  btoa encodeURIComponent(str).replace /%([0-9A-F]{2})/g, (match, p1) ->
    String.fromCharCode '0x' + p1

getB64Token = (user, token)->
  b64EncodeUnicode "#{user}:#{token}"

processData = (data) ->
  data.b64token = getB64Token data.user_id, data.token
  data

IreneAuthenticator = Base.extend

  # session: Ember.inject.service()
  ajax: Ember.inject.service()

  transitionTo: (route)->
    applicationRoute = Ember.getOwner(@).lookup("route:application")
    applicationRoute.transitionTo route

  authenticate: (identification, password) ->
    ajax = @get "ajax"
    # session = @get "session"
    that  = @
    new Ember.RSVP.Promise (resolve, reject) ->
      data =
        username: identification
        password: password

      url = "#{ENV.host}/#{ENV.namespace}#{ENV['ember-simple-auth']['loginEndPoint']}"
      ajax.post(url, {data: data})
      .then (data) ->
        data = processData data
        resolve data
        that.transitionTo ENV['ember-simple-auth']["routeAfterAuthentication"]
      .catch (reason) ->
        alert reason
        reject reason

  restore: (data) ->
    ajax = @get "ajax"
    that  = @
    new Ember.RSVP.Promise (resolve, reject) ->
      url = "#{ENV.host}/#{ENV.namespace}#{ENV['ember-simple-auth']['checkEndPoint']}"
      ajax.post(url, {data: data})
      .then (data) ->
        data = processData data
        resolve data
        that.transitionTo ENV['ember-simple-auth']["routeIfAlreadyAuthenticated"]
      .catch (reason)->
        alert reason
        localStorage.clear()
        reject reason

  invalidate: (data) ->
    ajax = @get "ajax"
    localStorage.clear()
    @set "currentUser", null
    new Ember.RSVP.Promise (resolve, reject) ->
      url = ENV['ember-simple-auth']['logoutEndPoint']
      ajax.post(url)
      .then (data)->
        resolve data
        location.reload()
      .catch (reason)->
        alert reason
        reject reason
        location.reload()


`export default IreneAuthenticator;`
