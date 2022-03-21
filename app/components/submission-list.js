/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get, ember/no-observers, ember/avoid-leaking-state-in-ember-objects */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import ENUMS from 'irene/enums';

const SubmissionListComponent = Component.extend({

  submissionCount: computed.alias('submissions.length'),
  hasSubmissions: computed.gt('submissionCount', 0),

  submissions: computed('realtime.SubmissionCounter', 'store', function() {
    this.get("store").query("submission", {
      'status': ENUMS.SUBMISSION_STATUS.VALIDATING
    });
    return this.get("store").peekAll("submission");
  }),

  submissionStatusObserver: observer("submissions.@each.status", function() {
    const submissions = this.get("submissions");
    const filteredSubmissions = submissions.filter(submission => submission.get("status") !== ENUMS.SUBMISSION_STATUS.ANALYZING);
    return this.set("filteredSubmissions", filteredSubmissions);
  }),

  submissionSorting: ['createdOn:desc'],
  sortedSubmissions: computed.sort('filteredSubmissions', 'submissionSorting'),

  sortedSubmissionsCount: computed.alias('filteredSubmissions.length'),
  hasSortedSubmissions: computed.gt('sortedSubmissionsCount', 0)
});

export default SubmissionListComponent;
