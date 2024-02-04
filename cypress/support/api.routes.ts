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

  // Auth
  login: { route: '/api/login' },

  // Listing Routes
  organizationList: {
    route: '/api/organizations',
    alias: 'availableOrgs',
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

  // Single Record routes
  file: { route: '/api/v2/files/**', alias: 'file' },
  unknownAnalysisStatus: {
    route: '/api/profiles/*/unknown_analysis_status*',
    alias: 'unknownAnalysisStatus',
  },
  userInfo: {
    route: '/api/users/**',
    alias: 'userInfo',
  },
} as const;
