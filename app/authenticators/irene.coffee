`import Ember from 'ember';`
`import Base from 'simple-auth/authenticators/base';`
`import config from '../config/environment';`


IreneAuthenticator = Base.extend

  makeRequest: (url, data) ->
    Ember.$.ajax
      url: url,
      type: 'POST',
      data: data,
      dataType: 'json',
      contentType: 'application/x-www-form-urlencoded'

  authenticate: (credentials) ->
    makeRequest = @makeRequest
    new Ember.RSVP.Promise (resolve, reject) ->
      data =
        username: credentials.identification
        password: credentials.password
      _resolved = (response)->
        Ember.run ->
          resolve Ember.$.extend response
      _rejected = (xhr, status, error) ->
        Ember.run ->
          reject xhr.responseJSON || xhr.responseText
      url = config['simple-auth']['tokenEndpoint']
      makeRequest(url, data).then _resolved, _rejected

  restore: (data) ->
    new Ember.RSVP.Promise (resolve, reject) ->
      if !Ember.isEmpty data.user
        resolve data
      else
        reject()

  invalidate: (data) ->
    debugger
    success = (resolve)->
      resolve()
    new Ember.RSVP.Promise (resolve, reject) ->
      success resolve

`export default IreneAuthenticator;`
