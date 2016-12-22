`import Ember from 'ember'`

SubmissionListComponent = Ember.Component.extend

  submissions: null
  classNames: ["container"]


  submissionCount: Ember.computed.alias 'submissions.length'
  hasSubmissions: Ember.computed.gt 'submissionCount', 0

`export default SubmissionListComponent`
