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
  organizationList: {
    route: '/api/organizations*',
    alias: 'availableOrgsList',
  },
  submissionList: {
    route: '/api/submissions*',
    alias: 'submissionList',
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
  file: { route: '/api/v2/files', alias: 'file' },
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
  devicePreference: {
    route: '/api/profiles/*/device_preference?*',
    alias: 'devicePreference',
  },
  editAnalysisRisk: {
    route: '/api/files/*/vulnerability_preferences/*/risk',
    alias: 'editAnalysisRisk',
  },
  serviceAccount: {
    route: '/api/service_accounts/*',
    alias: 'serviceAccount',
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
  teamMembers: {
    route: '/api/organizations/*/teams/*/members/*',
    alias: 'teamMembers',
  },
  inviteUser: {
    route: '/api/organizations/*/invitations',
    alias: 'inviteUser',
  },
} as const;
