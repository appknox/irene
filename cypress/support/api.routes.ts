export const API_ROUTES = {
  // General
  frontendConfig: {
    route: '**/frontend_configuration' as const,
    alias: 'frontendConfig',
  },
  serverConfig: {
    route: '**/server_configuration' as const,
    alias: 'serverConfig',
  },
  websockets: {
    route: '**/websocket/**' as const,
    alias: 'websockets',
  },

  // Auth
  login: { route: '/api/login' as const },

  // Listing Routes
  organizationList: {
    route: '**/organizations' as const,
    alias: 'availableOrgs',
  },
  submissionList: {
    route: '**/submissions*' as const,
    alias: 'submissionList',
  },
  projectList: {
    route: '*/organizations/*/projects*' as const,
    alias: 'projectList',
  },
  vulnerabilityList: {
    route: '/api/vulnerabilities' as const,
    alias: 'vulnerabilityList',
  },
  hudsonProjectList: {
    route: '**/hudson-api/projects',
    alias: 'hudsonProjectList',
  },

  // Single Record routes
  file: { route: '**/api/v2/files/**' as const, alias: 'file' },
  unknownAnalysisStatus: {
    route: '**/api/profiles/*/unknown_analysis_status*',
    alias: 'unknownAnalysisStatus',
  },
};
