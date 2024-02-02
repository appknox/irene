// Add Cypress types
declare namespace Cypress {
  /**
   * ==================================
   * IRENE SPECIFIC INTERFACES
   * ==================================
   */

  export interface FrontendConfig {
    name: string;
    hide_poweredby_logo: boolean;
    url: string;
    registration_enabled: boolean;
    registration_link: string;
    integrations: Integrations;
    images: Images;
    theme: Theme;
  }

  export interface Images {
    logo_on_darkbg: string;
    logo_on_lightbg: string;
    favicon: string;
  }

  export interface Integrations {
    crisp_key: string;
    hotjar_key: string;
    pendo_key: string;
    csb_key: string;
    rollbar_key: string;
    freshdesk_configuration: FreshdeskConfiguration;
  }

  export interface FreshdeskConfiguration {
    widget_id: string;
  }

  export interface Theme {
    scheme: string;
    primary_color: string;
    primary_alt_color: string;
    secondary_color: string;
    secondary_alt_color: string;
  }

  interface ServerConfig {
    websocket: string;
    enterprise: boolean;
    url_upload_allowed: boolean;
  }

  /**
   * ==================================
   * CUSTOM CYPRESS COMMANDS
   * ==================================
   */
  type modelFactoriesName = 'vulnerabilities' | 'projects';

  interface Chainable {
    loginByCredentials(username: string, password: string): Chainable;

    generateModelFixture: (
      name: modelFactoriesName,
      size?: number
    ) => Chainable;

    loadAppConfig(data?: {
      frontendConfig?: FrontendConfig;
      serverConfig?: ServerConfig;
    }): Chainable;

    loadMockAppConfig(): Chainable;
    loadMockHudsonProjects(): Chainable;
  }
}
