`import Ember from 'ember';`
`import Base from 'simple-auth/authenticators/base';`
`import config from '../config/environment';`
`import loginBtn from '../utils/login-btn';`
`import cookieUtil from '../utils/cookies';`


IreneAuthenticator = Base.extend

  makeRequest: (url, data=null) ->
    Ember.$.ajax
      url: url,
      type: 'POST',
      data: data,
      dataType: 'json',
      contentType: 'application/x-www-form-urlencoded'

  authenticate: (credentials) ->
    loginBtn.setSigningIn()
    makeRequest = @makeRequest
    new Ember.RSVP.Promise (resolve, reject) ->
      data =
        username: credentials.identification
        password: credentials.password
      _resolved = (response)->
        Ember.run ->
          loginBtn.restoreSignIn()
          resolve Ember.$.extend response
      _rejected = (xhr, status, error) ->
        Ember.run ->
          debugger
          loginBtn.restoreSignIn()
          reject xhr.responseJSON || xhr.responseText
      url = config['simple-auth']['loginEndpoint']
      makeRequest(url, data).then _resolved, _rejected

  restore: (data) ->
    new Ember.RSVP.Promise (resolve, reject) ->
      if !Ember.isEmpty data.user
        resolve data
      else
        reject()

  invalidate: (data) ->
    makeRequest = @makeRequest

    new Ember.RSVP.Promise (resolve, reject) ->
      _resolved = (response)->
        Ember.run ->
          cookieUtil.deleteAllCookies()
          localStorage.clear()
          resolve Ember.$.extend response
          location.reload()

      _rejected = (xhr, status, error) ->
        Ember.run ->
          reject xhr.responseJSON || xhr.responseText

      url = config['simple-auth']['logoutEndpoint']
      makeRequest(url).then _resolved, _rejected

`export default IreneAuthenticator;`
