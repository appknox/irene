`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

SubmissionListComponent = Ember.Component.extend

  submissionCount: Ember.computed.alias 'submissions.length'
  hasSubmissions: Ember.computed.gt 'submissionCount', 0

  submissions: ( ->
    @get("store").findAll "submission"
  ).property "realtime.SubmissionCounter"

  submissionStatusObserver: Ember.observer "submissions.@each.status", ->
    submissions = @get "submissions"
    filteredSubmissions = submissions.filter (submission) ->
      submission.get("status") isnt ENUMS.SUBMISSION_STATUS.ANALYZING
    @set "filteredSubmissions", filteredSubmissions

  submissionSorting: ['id:desc']
  sortedSubmissions: Ember.computed.sort 'filteredSubmissions', 'submissionSorting'

`export default SubmissionListComponent`
