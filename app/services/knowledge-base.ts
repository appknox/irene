import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type ConfigurationService from './configuration';
import type HubspotService from './hubspot';

export default class KnowledgeBaseService extends Service {
  @service declare configuration: ConfigurationService;
  @service declare hubspot: HubspotService;
  @service('browser/window') declare window: Window;

  @tracked isPanelOpen = false;

  /**
   * The knowledge base URL from the runtime config, or '' when it is not set
   * or is not an http(s) URL. Switching hosts is a config change.
   */
  get url() {
    const configured = this.configuration.integrationData?.knowledge_base_url;

    if (!configured) {
      return '';
    }

    try {
      const { protocol } = new URL(configured);

      return protocol === 'https:' || protocol === 'http:' ? configured : '';
    } catch (error) {
      // `new URL` throws a TypeError for a value that is not a valid URL.
      if (error instanceof TypeError) {
        return '';
      }

      throw error;
    }
  }

  get hasUrl() {
    return !!this.url;
  }

  /**
   * True when config asks for the Help tab of the HubSpot chat widget
   * (mode 'widget') and HubSpot chat is enabled. Off by default, so nothing
   * changes until the config is set.
   */
  get usesHubspotWidget() {
    return (
      this.configuration.integrationData?.knowledge_base_mode === 'widget' &&
      this.hubspot.chatEnabled
    );
  }

  /**
   * True when config asks for the dashboard's own article panel (mode
   * 'panel'), which shows the login-gated articles through mycroft.
   */
  get usesPanel() {
    return this.configuration.integrationData?.knowledge_base_mode === 'panel';
  }

  // True when the HubSpot knowledge base is configured in any form.
  get isAvailable() {
    return this.usesPanel || this.usesHubspotWidget || this.hasUrl;
  }

  /**
   * Open the knowledge base: the article panel, the widget's Help tab when configured and ready,
   * otherwise the configured URL in a new tab (which gets no access to this
   * one).
   */
  open() {
    if (this.usesPanel) {
      this.isPanelOpen = true;

      return;
    }

    if (this.usesHubspotWidget && this.hubspot.openKnowledgeBase()) {
      return;
    }

    if (this.hasUrl) {
      this.window.open(this.url, '_blank', 'noopener,noreferrer');
    }
  }

  closePanel() {
    this.isPanelOpen = false;
  }
}
