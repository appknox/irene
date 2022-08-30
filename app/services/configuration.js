import { inject as service } from '@ember/service';
import Service from '@ember/service';

export default class ConfigurationService extends Service {
  @service network;
  @service logger;

  serverConfigEndpoint = '/v2/server_configuration';
  frontendConfigEndpoint = '/v2/frontend_configuration';
  dashboardConfigEndpoint = '/v2/dashboard_configuration';

  frontendData = {
    name: '',
    hide_poweredby_logo: false,
    url: '',
    registration_enabled: false,
    registration_link: '',
  };

  themeData = {
    scheme: '',
    primary_color: '',
    primary_alt_color: '',
    secondary_color: '',
    secondary_alt_color: '',
  };

  imageData = {
    favicon: '',
    logo_on_darkbg: '',
    logo_on_lightbg: '',
  };

  integrationData = {
    crisp_key: '',
    csb_key: '',
    hotjar_key: '',
    pendo_key: '',
    rollbar_key: '',
    document360_key: '',
    sentry_dsn: '',
    environment: '',
  };

  serverData = {
    websocket: '',
    enterprise: '',
  };

  async fetchConfig(url) {
    const res = await this.network.request(url);
    if (res.ok) {
      return await res.json();
    }
    throw new Error(`Error fetching ${url} configuration`);
  }

  async frontendConfigFetch() {
    try {
      const data = await this.fetchConfig(this.frontendConfigEndpoint);
      this.frontendData.hide_poweredby_logo = data.hide_poweredby_logo == true;
      this.frontendData.name ||= data.name;
      this.frontendData.registration_enabled ||=
        data.registration_enabled == true;
      this.frontendData.registration_link ||= data.registration_link;
      this.frontendData.url ||= data.url;

      this.imageData.favicon ||= data.images.favicon;
      this.imageData.logo_on_darkbg ||= data.images.logo_on_darkbg;
      this.imageData.logo_on_lightbg ||= data.images.logo_on_lightbg;

      this.integrationData.crisp_key ||= data.integrations.crisp_key;
      this.integrationData.csb_key ||= data.integrations.csb_key;
      this.integrationData.hotjar_key ||= data.integrations.hotjar_key;
      this.integrationData.pendo_key ||= data.integrations.pendo_key;
      this.integrationData.rollbar_key ||= data.integrations.rollbar_key;
      this.integrationData.document360_key ||=
        data.integrations.document360_key;
      this.integrationData.sentry_dsn ||= data.integrations.sentry_dsn;
      this.integrationData.environment ||= data.integrations.environment;

      this.themeData.scheme ||= data.theme.scheme;
      this.themeData.primary_color ||= data.theme.primary_color;
      this.themeData.primary_alt_color ||= data.theme.primary_alt_color;
      this.themeData.secondary_color ||= data.theme.secondary_color;
      this.themeData.secondary_alt_color ||= data.theme.secondary_alt_color;
    } catch (error) {
      this.logger.error('Error getting frontend configuration', error);
    }
  }

  async getFrontendConfig() {
    if (!this.frontendPromise) {
      this.frontendPromise = this.frontendConfigFetch();
      await this.frontendPromise;
    }
    return this.frontendData;
  }

  async getThemeConfig() {
    if (!this.frontendPromise) {
      this.frontendPromise = this.frontendConfigFetch();
      await this.frontendPromise;
    }
    return this.themeData;
  }

  async getImageConfig() {
    if (!this.frontendPromise) {
      this.frontendPromise = this.frontendConfigFetch();
      await this.frontendPromise;
    }
    return this.imageData;
  }

  async getIntegrationConfig() {
    if (!this.frontendPromise) {
      this.frontendPromise = this.frontendConfigFetch();
      await this.frontendPromise;
    }
    return this.integrationData;
  }

  async serverConfigFetch() {
    try {
      const data = await this.fetchConfig(this.serverConfigEndpoint);
      this.serverData.websocket ||= data.websocket;
      this.serverData.enterprise ||= data.enterprise == true;
    } catch (error) {
      this.logger.error('Error getting server configuration', error);
    }
  }

  async getServerConfig() {
    if (!this.serverPromise) {
      this.serverPromise = this.serverConfigFetch();
      await this.serverPromise;
    }
    return this.serverData;
  }
}
