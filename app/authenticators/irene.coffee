`import Ember from 'ember';`
`import Base from 'simple-auth/authenticators/base';`
`import ENV from 'irene/config/environment';`
`import loginBtn from 'irene/utils/login-btn';`
`import Notify from 'ember-notify';`
`import ajax from 'ic-ajax';`


IreneAuthenticator = Base.extend

  makeRequest: (url, data=null, type='POST') ->
    ajax
      url: url,
      type: type,
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

      _resolved = (response, status, error)->
        Ember.run ->
          loginBtn.restoreSignIn()
          if response.success
            localStorage.authUser = response.user
            localStorage.authToken = response.token
            resolve response
          else
            Notify.error response.errors
            reject response

      _rejected = (xhr, status, error) ->
        Ember.run ->
          loginBtn.restoreSignIn()
          reject xhr.responseJSON || xhr.responseText

      url = ENV['simple-auth']['loginEndpoint']
      makeRequest(url, data).then _resolved, _rejected

  restore: (data) ->
    makeRequest = @makeRequest
    new Ember.RSVP.Promise (resolve, reject) ->
      _resolved = (response, status, error)->
        Ember.run ->
          if response.success
            resolve data
          else
            Notify.error "Please login to continue"
            reject response

      _rejected = (xhr, status, error) ->
        Ember.run ->
          reject xhr.responseJSON || xhr.responseText

      url = [ENV.APP.API_BASE, ENV.endpoints.token, data.token, data.user].join '/'
      url = "#{url}.json"
      ajax
        url: url
        type: "get"
      .then _resolved, _rejected

  invalidate: (data) ->
    localStorage.clear()
    makeRequest = @makeRequest

    new Ember.RSVP.Promise (resolve, reject) ->
      _resolved = (response)->
        Ember.run ->
          resolve response
          localStorage.clear()
          location.reload()

      _rejected = (xhr, status, error) ->
        Ember.run ->
          reject xhr.responseJSON || xhr.responseText
          localStorage.clear()
          location.reload()


      url = ENV['simple-auth']['logoutEndpoint']
      makeRequest(url).then _resolved, _rejected

`export default IreneAuthenticator;`
