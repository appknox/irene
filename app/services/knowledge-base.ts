import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import type ConfigurationService from './configuration';
import type HubspotService from './hubspot';

export default class KnowledgeBaseService extends Service {
  @service declare configuration: ConfigurationService;
  @service declare hubspot: HubspotService;
  @service('browser/window') declare window: Window;

  @tracked isPanelOpen = false;

  // Only http(s) URLs are used; anything else is treated as unset.
  get url() {
    const configured = this.configuration.integrationData?.knowledge_base_url;

    if (!configured) {
      return '';
    }

    try {
      const { protocol } = new URL(configured);

      return protocol === 'https:' || protocol === 'http:' ? configured : '';
    } catch {
      return '';
    }
  }

  get hasUrl() {
    return !!this.url;
  }

  get usesHubspotWidget() {
    return (
      this.configuration.integrationData?.knowledge_base_mode === 'widget' &&
      this.hubspot.chatEnabled
    );
  }

  get usesPanel() {
    return this.configuration.integrationData?.knowledge_base_mode === 'panel';
  }

  get isAvailable() {
    return this.usesPanel || this.usesHubspotWidget || this.hasUrl;
  }

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
