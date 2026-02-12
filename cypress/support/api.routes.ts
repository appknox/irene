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
    route: '/api/organizations/*/upload_app',
    alias: 'uploadAppReq',
  },
  uploadAppViaLink: {
    route: '/api/organizations/*/upload_app_url',
    alias: 'uploadAppLinkReq',
  },

  // Auth
  login: { route: '/api/login' },

  // Listing Routes
  sbomProjectList: {
    route: '/api/v2/sb_projects*',
    alias: 'sbomProjectList',
  },
  sbomFileSummary: {
    route: '/api/v2/sb_projects/*/sb_files/*/summary*',
    alias: 'sbomFileSummary',
  },
  organizationList: {
    route: '/api/organizations*',
    alias: 'availableOrgsList',
  },
  submissionList: {
    route: '/api/submissions*',
    alias: 'submissionList',
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

  // Single Record routes
  file: { route: '/api/v3/files', alias: 'file' },
  fileRisk: { route: '/api/v3/files/*/risk', alias: 'fileRisk' },
  sbom: { route: '/api/v2/sb_files', alias: 'sbomFile' },
  unknownAnalysisStatus: {
    route: '/api/profiles/*/unknown_analysis_status*',
    alias: 'unknownAnalysisStatus',
  },
  userInfo: {
    route: '/api/users/**',
    alias: 'userInfo',
  },
  analysis: {
    route: '/api/v2/analyses',
    alias: 'analysisItem',
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
