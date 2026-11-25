import Service, { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { injectHubspotChatScript } from 'irene/utils/hubspot';

import type ConfigurationService from './configuration';
import type IreneAjaxService from './ajax';
import type LoggerService from './logger';

type ChatTokenResponse = {
  email?: string;
  token?: string;
};

type VisitorIdentity = {
  email: string;
  token: string;
};

export default class HubspotService extends Service {
  @service('browser/window') declare window: Window;
  @service declare configuration: ConfigurationService;
  @service declare logger: LoggerService;
  @service declare ajax: IreneAjaxService;

  CHAT_TOKEN_ENDPOINT = '/api/v2/hubspot/chat-token/';
  EMBED_ID = 'hubspot-chat-embed';

  @tracked isOpen = false;

  // Resolves once the hubspot-chat panel is in the page; HubSpot needs it to
  // exist when the widget loads, and integrations are set up before render.
  embedInserted!: () => void;

  embedReady = new Promise<void>((resolve) => {
    this.embedInserted = resolve;
  });

  get portalId() {
    return this.configuration.integrationData?.hubspot_portal_id || '';
  }

  get chatEnabled() {
    return !!this.portalId;
  }

  get chatIsIntegrated() {
    return !!this.window?.HubSpotConversations?.widget;
  }

  @action
  handleEmbedInserted() {
    this.embedInserted();
  }

  async loadWidget() {
    await this.embedReady;

    this.window.HubSpotConversations?.widget.load();
  }

  // Unidentified visitors still get the chat; HubSpot then asks for an email.
  async configureChat() {
    if (!this.chatEnabled) {
      this.logger.debug('HubSpot chat is disabled');

      return;
    }

    const identity = await this.getVisitorIdentity();

    this.window.hsConversationsSettings = {
      loadImmediately: false,
      inlineEmbedSelector: `#${this.EMBED_ID}`,
      ...(identity && {
        identificationEmail: identity.email,
        identificationToken: identity.token,
      }),
    };

    if (this.window.HubSpotConversations) {
      // The script is already on the page, so load the widget again with the
      // settings above instead of adding the script a second time.
      await this.loadWidget();

      return;
    }

    this.window.hsConversationsOnReady = [() => this.loadWidget()];

    injectHubspotChatScript(this.window.document, this.portalId);
  }

  openChat() {
    if (!this.chatIsIntegrated) {
      return;
    }

    this.isOpen = true;
    this.window.HubSpotConversations?.widget.open();
  }

  closeChat() {
    this.isOpen = false;
  }

  // false when the widget has no Help tab, so the caller can fall back.
  openKnowledgeBase() {
    const widget = this.window?.HubSpotConversations?.widget;

    if (typeof widget?.openToKnowledgeBase !== 'function') {
      return false;
    }

    this.isOpen = true;
    widget.openToKnowledgeBase();

    return true;
  }

  clearChat() {
    this.isOpen = false;

    const hubspot = this.window?.HubSpotConversations;

    if (!hubspot) {
      return;
    }

    try {
      hubspot.clear({ resetWidget: true });
      hubspot.widget.remove();
    } catch (error) {
      // Logging out must never fail because of the chat widget.
      this.logger.debug('Failed to clear HubSpot chat', error);
    }
  }

  private async getVisitorIdentity(): Promise<VisitorIdentity | null> {
    try {
      const response = await this.ajax.request<ChatTokenResponse>(
        this.CHAT_TOKEN_ENDPOINT
      );

      // The backend answers 204 (parsed as an empty object) when HubSpot
      // could not issue a token.
      if (response?.email && response?.token) {
        return { email: response.email, token: response.token };
      }
    } catch {
      // Not logged: the error can carry response data. Chat still loads.
      this.logger.debug('HubSpot chat visitor identification unavailable');
    }

    return null;
  }
}
