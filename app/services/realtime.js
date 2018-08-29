import Ember from 'ember';

const RealtimeService = Ember.Service.extend({

  FileCounter: 0,
  ProjectCounter: 0,
  CollaborationCounter: 0,
  SubmissionCounter: 0,
  InvitationCounter: 0,
  OrganizationTeamCounter: 0,
  TeamProjectCounter: 0,
  TeamMemberCounter: 0,
  OrganizationNonTeamProjectCounter: 0,
  namespace: ''
});

export default RealtimeService;
