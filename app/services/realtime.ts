import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

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
  @tracked namespace = '';
  @tracked ReportCounter = 0;
  @tracked SbomReportCounter = 0;
}
