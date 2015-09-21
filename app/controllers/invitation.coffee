`import Ember from 'ember';`
`import Notify from 'ember-notify';`
`import ENV from 'irene/config/environment';`

InvitationController = Ember.Controller.extend

  inviter: ""
  email: ""
  project: ""
  uuid: ""

  username: ""
  password: ""

  checkInvitation: ->
    url = [ENV.APP.API_BASE, ENV.endpoints.invitation, @get "uuid" ].join '/'
    that = @
    Ember.$.get url
    .then (data, status, xhr)->
      that.set "inviter", data.inviter
      that.set "email", data.email
      that.set "project", data.project
      that.set "role", data.role
    .fail (xhr, message, status) ->
      if xhr.responseJSON
        Notify.error xhr.responseJSON.message, closeAfter: 70000
      else
        Notify.error "This is an expired / invalid invitation", closeAfter: 70000

  actions:

    signup: ->
      url = [ENV.APP.API_BASE, ENV.endpoints.signup].join '/'
      that = @
      data =
        invitationUuid: @get "uuid"
        username: @get "username"
        password: @get "password"
      Ember.$.post url, data
      .then (data, status, xhr)->
        that.transitionTo "login"
      .fail (xhr, message, status) ->
        if xhr.responseJSON
          Notify.error xhr.responseJSON.message, closeAfter: 70000
        else
          Notify.error "Some error occured while we tried to sign you up. Please contact support", closeAfter: 10000

`export default InvitationController;`

