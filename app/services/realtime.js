import Service from '@ember/service';

const RealtimeService = Service.extend({

  FileCounter: 0,
  ProjectCounter: 0,
  ProjectCollaboratorCounter: 0,
  ProjectNonCollaboratorCounter: 0,
  ProjectTeamCounter: 0,
  ProjectNonTeamCounter: 0,
  SubmissionCounter: 0,
  InvitationCounter: 0,
  OrganizationMemberCounter: 0,
  OrganizationTeamCounter: 0,
  TeamProjectCounter: 0,
  TeamMemberCounter: 0,
  OrganizationNonTeamProjectCounter: 0,
  OrganizationNonTeamMemberCounter: 0,
  namespace: ''
});

export default RealtimeService;
