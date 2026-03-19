export const API_ROUTES = {
  // General
  check: {
    route: '/api/v2/sso/check',
    alias: 'checkUser',
  },
  frontendConfig: {
    route: '/api/v2/frontend_configuration',
    alias: 'frontendConfig',
  },
  serverConfig: {
    route: '/api/v2/server_configuration',
    alias: 'serverConfig',
  },
  websockets: {
    route: '/websocket/**',
    alias: 'websockets',
  },
  uploadApp: {
    route: '/api/organizations/*/upload_app', //done
    alias: 'uploadAppReq',
  },
  uploadAppViaLink: {
    route: '/api/organizations/*/upload_app_url',
    alias: 'uploadAppLinkReq',
  },
  organizations: {
    route: '/api/organizations',
    alias: 'organizations',
  },

  // Auth
  login: { route: '/api/login' }, //dpne

  forgotPassword: {
    route: '/api/v2/forgot_password',
    alias: 'forgotPassword',
  }, //done

  // Listing Routes
  sbomProjectList: {
    route: '/api/v2/sb_projects*',
    alias: 'sbomProjectList',
  },

  previousFile: {
    route: '/api/v3/files/*/previous_file',
    alias: 'previousFile',
  },
  submissionList: {
    route: '/api/submissions*',
    alias: 'submissionList',
  },

  submission: {
    route: '/api/submissions/*',
    alias: 'submission',
  },
  v3ProjectList: {
    route: '/api/v3/projects*',
    alias: 'projectList',
  },
  projectList: {
    route: '/api/organizations/*/projects*',
    alias: 'projectList',
  },
  vulnerabilityList: {
    route: '/api/vulnerabilities',
    alias: 'vulnerabilityList',
  },
  hudsonProjectList: {
    route: '/api/hudson-api/projects',
    alias: 'hudsonProjectList',
  },
  vulnerabilityPreferenceList: {
    route: '/api/profiles/*/vulnerability_preferences',
    alias: 'vulnerabilityPreferenceList',
  },
  serviceAccountList: {
    route: '/api/service_accounts*',
    alias: 'serviceAccountList',
  },
  //reports
  canGenerateReport: {
    route: '/api/v3/files/*/can_generate_report',
    alias: 'canGenerateReport',
  },
  reports: {
    route: '/api/v2/files/*/reports',
    alias: 'reports',
  },
  privacyReport: {
    route: '/api/v2/files/*/privacy_report',
    alias: 'privacyReport',
  },
  reportPdf: {
    route: '/api/v2/reports/*/pdf',
    alias: 'reportPdf',
  },
  reportExcel: {
    route: '/api/v2/reports/*/summary_excel',
    alias: 'reportExcel',
  },
  reportCsv: {
    route: '/api/v2/reports/*/summary_csv',
    alias: 'reportCsv',
  },
  privacyReportGenerate: {
    route: '/api/v2/privacy_reports/*/pdf/generate',
    alias: 'privacyReportGenerate',
  },
  privacyReportById: {
    route: '/api/v2/privacy_reports/*',
    alias: 'privacyReportById',
  },
  privacyReportDownload: {
    route: '/api/v2/privacy_reports/*/pdf/download_url',
    alias: 'privacyReportDownload',
  },

  sbProjects: {
    route: '/api/v2/sb_projects',
    alias: 'sbProjects',
  },
  sbFileById: {
    route: '/api/v2/sb_files/*',
    alias: 'sbFileById',
  },
  sbReports: {
    route: '/api/v2/sb_files/*/sb_reports',
    alias: 'sbReports',
  },
  sbReportById: {
    route: '/api/v2/sb_reports/*',
    alias: 'sbReportById',
  },
  sbReportGenerate: {
    route: '/api/v2/sb_reports/*/pdf/generate',
    alias: 'sbReportGenerate',
  },
  sbReportDownload: {
    route: '/api/v2/sb_reports/*/pdf/download_url',
    alias: 'sbReportDownload',
  },
  sbReortCyclonedx: {
    route: '/api/v2/sb_reports/*/cyclonedx_json_file/download_url',
    alias: 'sbReportCyclonedx',
  },
  fileOwaspAnalyses: {
    route: '/api/v3/files/*/analyses/owasp',
    alias: 'fileOwaspAnalyses',
  },
  owaspMobile: {
    route: '/api/v2/owaspmobile2024s',
    alias: 'owaspMobile2024',
  },
  // Single Record routes
  file: { route: '/api/v3/files', alias: 'file' },

  fileRisk: { route: '/api/v3/files/*/risk', alias: 'fileRisk' },
  sbom: { route: '/api/v2/sb_files', alias: 'sbomFile' },
  unknownAnalysisStatus: {
    route: '/api/profiles/*/unknown_analysis_status*',
    alias: 'unknownAnalysisStatus',
  },
  fileById: {
    route: '/api/v3/files/*',
    alias: 'fileById',
  },
  fileAnalyses: {
    route: '/api/v3/files/*/analyses',
    alias: 'fileAnalyses',
  },
  userInfo: {
    route: '/api/users/**',
    alias: 'userInfo',
  },
  analysis: {
    route: '/api/v2/analyses',
    alias: 'analysisItem',
  },
  projectById: {
    route: '/api/v3/projects/*',
    alias: 'projectById',
  },

  submissionItem: {
    route: '/api/submissions',
    alias: 'submission',
  },
  dsManualDevicePreference: {
    route: '/api/v2/profiles/*/ds_manual_device_preference',
    alias: 'dsManualDevicePreference',
  },
  availableManualDevices: {
    route: '/api/v2/projects/*/available_manual_devices*',
    alias: 'availableManualDevices',
  },
  editAnalysisRisk: {
    route: '/api/files/*/vulnerability_preferences/*/risk',
    alias: 'editAnalysisRisk',
  },
  serviceAccount: {
    route: '/api/service_accounts/*',
    alias: 'serviceAccount',
  },
  teamsList: {
    route: '/api/organizations/*/teams*',
    alias: 'teamsList',
  },
  organizationTeams: {
    route: '/api/organizations/*/teams/*',
    alias: 'organizationTeams',
  },
  teamMembers: {
    route: '/api/organizations/*/teams/*/members/*',
    alias: 'teamMembers',
  },
  teamMembersList: {
    route: '/api/organizations/*/teams/*/members*',
    alias: 'teamMembersList',
  },
  teamProject: {
    route: '/api/organizations/*/teams/*/projects/*',
    alias: 'teamProject',
  },
  organization: {
    route: '/api/organizations/*',
    alias: 'organization',
  },
  editUserInfo: {
    route: '/api/organizations/*/users/*',
    alias: 'editUser',
  },
  membersList: {
    route: '/api/organizations/*/members*',
    alias: 'membersList',
  },
  member: {
    route: '/api/organizations/*/members/*',
    alias: 'member',
  },
  teamExcludesUser: {
    route: '/api/organizations/*/teams?exclude_user=*',
    alias: 'teamExcludesUser',
  },
  teamIncludesUser: {
    route: '/api/organizations/*/teams?include_user=*',
    alias: 'teamIncludesUser',
  },
  inviteUser: {
    route: '/api/organizations/*/invitations',
    alias: 'inviteUser',
  },
  usersList: {
    route: '/api/organizations/*/users*',
    alias: 'usersList',
  },
  inviteTeam: {
    route: '/api/organizations/*/teams/*/invitations*',
    alias: 'inviteTeam',
  },
  dynamicscan: {
    route: '/api/v3/files/*/last_manual_dynamic_scan',
    alias: 'dynamicscan',
  },
} as const;

export function resolveRoute(
  route: string,
  ...params: (string | number)[]
): string {
  let resolved = route;
  for (const param of params) {
    resolved = resolved.replace('*', String(param));
  }
  return resolved.replace(/\*/g, ''); // remove any remaining wildcards
}
