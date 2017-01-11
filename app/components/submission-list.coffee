`import Ember from 'ember'`

SubmissionListComponent = Ember.Component.extend

  classNames: ["container"]


  submissionCount: Ember.computed.alias 'submissions.length'
  hasSubmissions: Ember.computed.gt 'submissionCount', 0

  submissions: ( ->
    @get("store").findAll "submission"
  ).property "realtime.submissionsCounter"

`export default SubmissionListComponent`
