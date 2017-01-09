`import Ember from 'ember'`
`import PaginateMixin from 'irene/mixins/paginate'`

FileListComponent = Ember.Component.extend PaginateMixin,

  project: null

  targetObject: "file"
  sortProperties: ["id:desc"]

  classNames: ["columns", "margin-top"]

  extraQueries: Ember.computed "project", ->
    projectId: @get "project.id"

`export default FileListComponent`
