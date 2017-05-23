`import Ember from 'ember'`

FileHeaderComponent = Ember.Component.extend

  globalAlpha:0.4
  radiusRatio:0.9

  didInsertElement: ->
    zcEl = $(@element).find ".zeroclipboard-copy"
    that = @
    client = new ZeroClipboard zcEl
    client.on 'aftercopy', ->
      that.get("notify").info "Password Copied!"

`export default FileHeaderComponent`
