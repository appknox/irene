`import Ember from 'ember'`

FileOverviewComponent = Ember.Component.extend
  file: null
  fileOld: null
  globalAlpha:0.4
  radiusRatio:0.9
  redirectTo: "authenticated.file"
  classNames: ["card","file-card", "is-fullwidth", "margin-bottom20"]

  targetPath: Ember.computed "file", "fileOld", ->
    file = @get "file"
    if file in [null, undefined]
      return ""
    fileOld = @get "fileOld"
    target = file.get "id"
    if fileOld not in [null, undefined]
      target += "...#{fileOld.get "id"}"
    target

`export default FileOverviewComponent`
