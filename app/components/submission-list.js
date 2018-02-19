import Ember from 'ember';
import ENUMS from 'irene/enums';

const SubmissionListComponent = Ember.Component.extend({

  submissionCount: Ember.computed.alias('submissions.length'),
  hasSubmissions: Ember.computed.gt('submissionCount', 0),

  submissions: ( function() {
    return this.get("store").findAll("submission");
  }).property("realtime.SubmissionCounter"),

  submissionStatusObserver: Ember.observer("submissions.@each.status", function() {
    const submissions = this.get("submissions");
    const filteredSubmissions = submissions.filter(submission => submission.get("status") !== ENUMS.SUBMISSION_STATUS.ANALYZING);
    return this.set("filteredSubmissions", filteredSubmissions);
  }),

  submissionSorting: ['id:desc'],
  sortedSubmissions: Ember.computed.sort('filteredSubmissions', 'submissionSorting'),

  sortedSubmissionsCount: Ember.computed.alias('filteredSubmissions.length'),
  hasSortedSubmissions: Ember.computed.gt('sortedSubmissionsCount', 0)
});

export default SubmissionListComponent;
