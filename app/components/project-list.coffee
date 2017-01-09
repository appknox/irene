`import Ember from 'ember'`
`import PaginateMixin from 'irene/mixins/paginate'`

ProjectListComponent = Ember.Component.extend PaginateMixin,

  targetObject: "project"
  sortProperties: ["lastFileCreatedOn:desc"]

  classNames: ["columns", "tour-step-project"]

`export default ProjectListComponent`
