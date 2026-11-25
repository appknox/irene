import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type HubspotService from 'irene/services/hubspot';

export interface HubspotChatSignature {
  Element: HTMLElement;
}

export default class HubspotChatComponent extends Component<HubspotChatSignature> {
  @service declare hubspot: HubspotService;

  @action
  handleClose() {
    this.hubspot.closeChat();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    HubspotChat: typeof HubspotChatComponent;
  }
}
