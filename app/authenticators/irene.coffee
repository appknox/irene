`import Ember from 'ember';`
`import Base from 'ember-simple-auth/authenticators/base';`
`import ENV from 'irene/config/environment';`

b64EncodeUnicode = (str) ->
  btoa encodeURIComponent(str).replace /%([0-9A-F]{2})/g, (match, p1) ->
    String.fromCharCode '0x' + p1

getB64Token = (user, token)->
  b64EncodeUnicode "#{user}:#{token}"


IreneAuthenticator = Base.extend

  session: Ember.inject.service()
  ajax: Ember.inject.service()

  authenticate: (identification, password) ->
    ajax = @get "ajax"
    session = @get "session"
    that  = @
    new Ember.RSVP.Promise (resolve, reject) ->
      data =
        username: identification
        password: password

      url = ENV['ember-simple-auth']['loginEndPoint']
      ajax.post(url, data)
      .then (data) ->
        b64token = getB64Token data.user, data.token
        session.set 'data.b64token', b64token
        resolve data
      .catch (reason) ->
        alert reason
        reject reason

  restore: (data) ->
    ajax = @get "ajax"
    session = @get "session"
    that  = @
    new Ember.RSVP.Promise (resolve, reject) ->
      url = ENV['ember-simple-auth']['checkEndPoint']
      ajax.request(url)
      .then (data) ->
        b64token = getB64Token data.user, data.token
        session.set 'data.b64token', b64token
        resolve data
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
