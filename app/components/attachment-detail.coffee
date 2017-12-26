`import Ember from 'ember'`;
`import ENV from 'irene/config/environment';`

AttachmentDetailComponent = Ember.Component.extend
  attachment: null

  actions:
    downloadAttachment: ->
      url = ENV.host + @get "attachment.download_url"
      that = @
      @get("ajax").request url
      .then (result) ->
        window.open result.data.url
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default AttachmentDetailComponent`
