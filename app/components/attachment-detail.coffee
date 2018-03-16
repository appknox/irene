`import Ember from 'ember'`;
`import ENV from 'irene/config/environment';`

AttachmentDetailComponent = Ember.Component.extend
  attachment: null
  isDownloadingAttachment: false

  actions:
    downloadAttachment: ->
      url = ENV.host + @get "attachment.download_url"
      that = @
      @set "isDownloadingAttachment", true
      @get("ajax").request url
      .then (result) ->
        window.open result.data.url
        that.set "isDownloadingAttachment", false
      .catch (error) ->
        that.set "isDownloadingAttachment", false
        that.get("notify").error error.payload.message

`export default AttachmentDetailComponent`
