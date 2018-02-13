`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

PersonaltokenDetailComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  tagName: ''

  # revoke token

  isNotRevoked: true
  isDeletingToken: false
  tTokenRevoked: t('personalTokenRevoked')

  confirmCallback: ->
    tTokenRevoked = @get 'tTokenRevoked'
    personaltoken = @get 'personaltoken'
    personaltokenId = @get 'personaltoken.id'

    that = @
    url = [ENV.endpoints.personaltokens, personaltokenId].join '/'
    @set "isDeletingToken", true
    @get('ajax').delete url
    .then (data) ->
      that.set 'isNotRevoked', false
      that.set "isDeletingToken", false
      that.get('notify').success tTokenRevoked
      that.send 'closeRevokePersonalTokenConfirmBox'
    .catch (error) ->
      that.set "isDeletingToken", false
      for error in error.payload.errors
        that.get('notify').error error.detail

  actions:
    openRevokePersonalTokenConfirmBox: ->
      @set 'showRevokePersonalTokenConfirmBox', true

    closeRevokePersonalTokenConfirmBox: ->
      @set 'showRevokePersonalTokenConfirmBox', false


`export default PersonaltokenDetailComponent`
