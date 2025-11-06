import { inject as service } from '@ember/service';
import Service from '@ember/service';
import Store from '@ember-data/store';

import LoggerService from './logger';
import IreneAjaxService from './ajax';

type ServerData = {
  websocket: string;
  devicefarmURL: string;
  enterprise: string | boolean;
};

type DashboardData = {
  dashboardURL: string;
  devicefarmURL: string;
};

type ImageData = {
  logo_on_darkbg: string;
  logo_on_lightbg: string;
  favicon: string;
};

type IntegrationData = {
  freshchat_key: string;
  hotjar_key: string;
  pendo_key: string;
  csb_key: string;
  csb_host?: string;
  rollbar_key: string;
  posthog_key?: string;
  posthog_host?: string;
  posthog_ui_host?: string;
  freshdesk_configuration: {
    widget_id: string;
  };
};

type ThemeData = {
  scheme: string;
  primary_color: string;
  primary_alt_color: string;
  secondary_color: string;
  secondary_alt_color: string;
};

type FrontendConfigResponse = {
  name: string;
  hide_poweredby_logo: boolean;
  url: string;
  registration_enabled: boolean;
  registration_link: string;

  images: ImageData;

  integrations: IntegrationData;

  theme: ThemeData;
};

type ServerResponse = {
  websocket: string;
  devicefarm_url: string;
  enterprise: string | boolean;
};

type DashboardResponse = {
  dashboard_url: string;
  devicefarm_url: string;
};

export default class ConfigurationService extends Service {
  @service declare ajax: IreneAjaxService;
  @service declare logger: LoggerService;
  @service declare store: Store;
  @service declare session: any;

  frontendPromise?: Promise<void>;
  serverPromise?: Promise<void>;
  dashboardPromise?: Promise<void>;

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

  themeData: ThemeData = {
    scheme: '',
    primary_color: '',
    primary_alt_color: '',
    secondary_color: '',
    secondary_alt_color: '',
  };

  imageData: ImageData = {
    favicon: '',
    logo_on_darkbg: '',
    logo_on_lightbg: '',
  };

  integrationData: IntegrationData = {
    freshchat_key: '',
    freshdesk_configuration: {
      widget_id: '',
    },
    csb_key: '',
    csb_host: '',
    hotjar_key: '',
    pendo_key: '',
    posthog_key: '',
    posthog_host: '',
    posthog_ui_host: '',
    rollbar_key: '',
  };

  serverData: ServerData = {
    websocket: '',
    devicefarmURL: '',
    enterprise: '',
  };

  dashboardData: DashboardData = {
    dashboardURL: '',
    devicefarmURL: '',
  };

  async frontendConfigFetch() {
    try {
      const data = await this.ajax.request<FrontendConfigResponse>(
        this.frontendConfigEndpoint
      );

      this.frontendData.hide_poweredby_logo = data.hide_poweredby_logo == true;
      this.frontendData.name ||= data.name;
      this.frontendData.registration_enabled ||=
        data.registration_enabled == true;
      this.frontendData.registration_link ||= data.registration_link;
      this.frontendData.url ||= data.url;

      this.imageData.favicon ||= data.images.favicon;
      this.imageData.logo_on_darkbg ||= data.images.logo_on_darkbg;
      this.imageData.logo_on_lightbg ||= data.images.logo_on_lightbg;

      this.integrationData.csb_key ||= data.integrations.csb_key;
      this.integrationData.csb_host ||= data.integrations.csb_host;
      this.integrationData.hotjar_key ||= data.integrations.hotjar_key;
      this.integrationData.pendo_key ||= data.integrations.pendo_key;
      this.integrationData.posthog_key ||= data.integrations.posthog_key;
      this.integrationData.posthog_host ||= data.integrations.posthog_host;
      this.integrationData.posthog_ui_host ||=
        data.integrations.posthog_ui_host;
      this.integrationData.rollbar_key ||= data.integrations.rollbar_key;
      this.integrationData.freshchat_key ||= data.integrations.freshchat_key;

      this.integrationData.freshdesk_configuration.widget_id ||=
        data.integrations.freshdesk_configuration.widget_id;

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
      const data = await this.ajax.request<ServerResponse>(
        this.serverConfigEndpoint
      );

      this.serverData.websocket ||= data.websocket;
      this.serverData.enterprise ||= data.enterprise == true;
      this.serverData.devicefarmURL ||= data.devicefarm_url;
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

  async dashboardConfigFetch() {
    try {
      const data = await this.ajax.request<DashboardResponse>(
        this.dashboardConfigEndpoint
      );

      this.dashboardData.dashboardURL ||= data.dashboard_url;
      this.dashboardData.devicefarmURL ||= data.devicefarm_url;
    } catch (error) {
      this.logger.error('Error getting dashboard configuration', error);
    }
  }

  async getDashboardConfig() {
    if (!this.dashboardPromise && this.session.isAuthenticated) {
      this.dashboardPromise = this.dashboardConfigFetch();
      await this.dashboardPromise;
    }

    return this.dashboardData;
  }
}
