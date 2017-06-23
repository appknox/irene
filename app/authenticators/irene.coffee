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

  authenticate: (identification, password, otp, errorCallback) ->
    ajax = @get "ajax"
    that  = @
    new Ember.RSVP.Promise (resolve, reject) ->
      data =
        username: identification
        password: password
        otp: otp

      url = ENV['ember-simple-auth']['loginEndPoint']
      ajax.post(url, {data: data})
      .then (data) ->
        data = processData data
        resolve data
        that.resumeTransistion()
      .catch (error) ->
        errorCallback error
        that.get("notify").error error.payload.message, ENV.notifications
        for error in error.errors
          if error.status is "0"
            that.get("notify").error "Unable to reach server. Please try after sometime", ENV.notifications
          that.get("notify").error "Please enter valid account details", ENV.notifications
        reject error

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
      .catch (error) ->
        localStorage.clear()
        for error in error.errors
          that.get("notify").error error.detail?.message, ENV.notifications
        reject error

  invalidate: (data) ->
    ajax = @get "ajax"
    localStorage.clear()
    @set "currentUser", null
    that  = @
    new Ember.RSVP.Promise (resolve, reject) ->
      url = ENV['ember-simple-auth']['logoutEndPoint']
      ajax.post(url)
      .then (data)->
        resolve data
        location.reload()
      .catch (error) ->
        location.reload()
        for error in error.errors
          that.get("notify").error error.detail?.message, ENV.notifications
        reject error


`export default IreneAuthenticator;`
