`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`
`import ModalBoxMixin from 'irene/mixins/modal-box'`

FeedBackComponent = Ember.Component.extend ModalBoxMixin,
  satisfied: true
  feedbackText: ""

  actions:

    submitFeedback: ->
      that = @
      data =
        satisfied: @get "satisfied"
        feedbackText: @get "feedbackText"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.feedback].join '/'
      that = @
      Ember.$.post postUrl, data
      .then ->
        that.send "closeModal"
        Notify.success "Feedback submitted!"
      .fail (xhr, message, status) ->
        if xhr.status is 403
          Notify.error xhr.responseJSON.message
        else
          Notify.error "A network error occured! Please try again later"


`export default FeedBackComponent`
