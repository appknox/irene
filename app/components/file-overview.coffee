`import Ember from 'ember'`

FileOverviewComponent = Ember.Component.extend
  file: null
  fileOld: null
  globalAlpha:0.4
  radiusRatio:0.9
  redirectTo: "authenticated.file"
  classNames: ["card","file-card", "is-fullwidth", "margin-bottom20"]

  targetPath: Ember.computed "file.id", "fileOld.id", ->
    file = @get "file"
    if Ember.isEmpty file
      return "loading"
    fileOld = @get "fileOld"
    target = file.get "id"
    if Ember.isEmpty fileOld
      return target
    target += "...#{fileOld.get "id"}"

`export default FileOverviewComponent`
