import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export enum RealtimeCounterType {
  FILE = 'File',
  PROJECT = 'Project',
  PROJECT_COLLABORATOR = 'ProjectCollaborator',
  PROJECT_NON_COLLABORATOR = 'ProjectNonCollaborator',
  PROJECT_TEAM = 'ProjectTeam',
  PROJECT_NON_TEAM = 'ProjectNonTeam',
  SUBMISSION = 'Submission',
  INVITATION = 'Invitation',
  ORGANIZATION_MEMBER = 'OrganizationMember',
  ORGANIZATION_TEAM = 'OrganizationTeam',
  TEAM_PROJECT = 'TeamProject',
  TEAM_MEMBER = 'TeamMember',
  ORGANIZATION_NON_TEAM_PROJECT = 'OrganizationNonTeamProject',
  ORGANIZATION_NON_TEAM_MEMBER = 'OrganizationNonTeamMember',
  ORGANIZATION_ARCHIVE = 'OrganizationArchive',
  CAPTURED_API = 'CapturedApi',
  REGISTRATION_REQUEST = 'RegistrationRequest',
  NAMESPACE = 'namespace',
  REPORT = 'Report',
  SBOM_REPORT = 'SbomReport',
}

export type RealtimeCounterTypeValue = `${RealtimeCounterType}`;

export default class RealtimeService extends Service {
  @tracked FileCounter = 0;
  @tracked ProjectCounter = 0;
  @tracked ProjectCollaboratorCounter = 0;
  @tracked ProjectNonCollaboratorCounter = 0;
  @tracked ProjectTeamCounter = 0;
  @tracked ProjectNonTeamCounter = 0;
  @tracked SubmissionCounter = 0;
  @tracked InvitationCounter = 0;
  @tracked OrganizationMemberCounter = 0;
  @tracked OrganizationTeamCounter = 0;
  @tracked TeamProjectCounter = 0;
  @tracked TeamMemberCounter = 0;
  @tracked OrganizationNonTeamProjectCounter = 0;
  @tracked OrganizationNonTeamMemberCounter = 0;
  @tracked OrganizationArchiveCounter = 0;
  @tracked CapturedApiCounter = 0;
  @tracked RegistrationRequestCounter = 0;
  @tracked namespaceCounter = '';
  @tracked ReportCounter = 0;
  @tracked SbomReportCounter = 0;
}
