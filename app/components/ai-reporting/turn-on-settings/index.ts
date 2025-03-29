import Component from '@glimmer/component';
import { service } from '@ember/service';
import type MeService from 'irene/services/me';

export default class AiReportingTurnOnSettingsComponent extends Component {
  @service declare me: MeService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::TurnOnSettings': typeof AiReportingTurnOnSettingsComponent;
  }
}
