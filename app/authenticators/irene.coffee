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

  ajax: Ember.inject.service()

  resumeTransistion: ->
    authenticatedRoute = Ember.getOwner(@).lookup("route:authenticated")
    lastTransition = authenticatedRoute.get "lastTransition"
    if lastTransition isnt null
      lastTransition.retry()
    else
      applicationRoute = Ember.getOwner(@).lookup("route:application")
      applicationRoute.transitionTo ENV['ember-simple-auth']["routeAfterAuthentication"]

  authenticate: (identification, password) ->
    ajax = @get "ajax"
    that  = @
    new Ember.RSVP.Promise (resolve, reject) ->
      data =
        username: identification
        password: password

      url = ENV['ember-simple-auth']['loginEndPoint']
      ajax.post(url, {data: data})
      .then (data) ->
        data = processData data
        resolve data
        that.resumeTransistion()
      .catch (reason) ->
        that.get("notify").error reason, ENV.notifications
        reject reason

  restore: (data) ->
    ajax = @get "ajax"
    that  = @
    new Ember.RSVP.Promise (resolve, reject) ->
      url = ENV['ember-simple-auth']['checkEndPoint']
      ajax.post(url, {data: data})
      .then (data) ->
        data = processData data
        resolve data
        if 'login' in location.pathname
          that.resumeTransistion()
      .catch (reason)->
        that.get("notify").error reason, ENV.notifications
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
        that.get("notify").error reason, ENV.notifications
        reject reason
        location.reload()


`export default IreneAuthenticator;`
