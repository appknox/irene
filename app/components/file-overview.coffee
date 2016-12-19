`import Ember from 'ember'`

FileOverviewComponent = Ember.Component.extend
  file: null
  fileOld: null
  globalAlpha:0.4
  radiusRatio:0.9
  redirectTo: "authenticated.file"
  classNames: ["card","file-card", "is-fullwidth", "margin-bottom20"]

  isThreeColumn: false
  isNotThreeColumn: Ember.computed.not 'isThreeColumn'

  targetPath: Ember.computed "file.id", "fileOld.id", ->
    file = @get "file"
    if Ember.isEmpty file
      return "loading"
    fileOld = @get "fileOld"
    target = file.get "id"
    if Ember.isEmpty fileOld
      return target
    target += "...#{fileOld.get "id"}"

  didInsertElement: ->
    isThreeColumn = @get "isThreeColumn"
    if isThreeColumn
      zcEl = $(@element).find ".zeroclipboard-copy"
      that = @
      client = new ZeroClipboard zcEl
      client.on 'aftercopy', ->
        that.get("notify").info "Password Copied!"


`export default FileOverviewComponent`
