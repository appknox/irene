`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

isEmpty = (inputValue)->
  return Ember.isEmpty inputValue

PersonaltokenListComponent = Ember.Component.extend
  i18n: Ember.inject.service()


  # list tokens

  personaltokens: (->
    @get('store').findAll 'personaltoken'
  ).property()

  tokenSorting: ['created:desc']
  sortedPersonalTokens: Ember.computed.sort 'personaltokens', 'tokenSorting'


  # create token

  tokenName: ''
  isGeneratingToken: false
  tEnterTokenName: t('enterTokenName')
  tTokenCreated: t('personalTokenGenerated')

  actions:
    openGenerateTokenModal: ->
      @set 'showGenerateTokenModal', true

    generateToken: ->
      tokenName = @get 'tokenName'
      tTokenCreated = @get 'tTokenCreated'
      tEnterTokenName = @get 'tEnterTokenName'

      for inputValue in [tokenName]
        return @get('notify').error tEnterTokenName if isEmpty inputValue

      that = @
      data =
        name: tokenName

      @set 'isGeneratingToken', true
      @get('ajax').post ENV.endpoints.personaltokens, data: data
      .then (data)->
        that.set 'isGeneratingToken', false
        that.store.pushPayload data
        that.get('notify').success tTokenCreated
        that.set 'tokenName', ''
        that.set 'showGenerateTokenModal', false
      .catch (error) ->
        that.set 'isGeneratingToken', false
        for error in error.payload.errors
          that.get('notify').error error.detail


  # copy token

  tTokenCopied: t('tokenCopied')
  tPleaseTryAgain: t('pleaseTryAgain')

  didInsertElement: ->
    tTokenCopied = @get 'tTokenCopied'
    tPleaseTryAgain = @get 'tPleaseTryAgain'

    clipboard = new Clipboard('.copy-token')
    @set 'clipboard', clipboard

    that = @

    clipboard.on 'success', (e) ->
      that.get('notify').info tTokenCopied
      e.clearSelection()
    clipboard.on 'error', ->
      that.get('notify').error tPleaseTryAgain

  willDestroyElement: ->
    clipboard = @get 'clipboard'
    clipboard.destroy()


`export default PersonaltokenListComponent`
