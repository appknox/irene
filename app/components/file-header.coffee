`import Ember from 'ember'`

FileHeaderComponent = Ember.Component.extend

  didInsertElement: ->
    zcEl = $(@element).find ".zeroclipboard-copy"
    that = @
    client = new ZeroClipboard zcEl
    client.on 'aftercopy', ->
      that.get("notify").info "Password Copied!"

`export default FileHeaderComponent`
