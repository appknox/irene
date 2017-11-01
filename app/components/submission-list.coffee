`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

SubmissionListComponent = Ember.Component.extend

  classNames: ["container"]


  submissionCount: Ember.computed.alias 'submissions.length'
  hasSubmissions: Ember.computed.gt 'submissionCount', 0

  submissions: ( ->
    @get("store").findAll "submission"
  ).property "realtime.SubmissionCounter"

  filteredSubmissions: Ember.computed.filter 'submissions', (submission) ->
    submission.get("status") isnt ENUMS.SUBMISSION_STATUS.ANALYZING

  submissionSorting: ['id:desc']
  sortedSubmissions: Ember.computed.sort 'filteredSubmissions', 'submissionSorting'

`export default SubmissionListComponent`
