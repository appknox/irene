import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type MeService from 'irene/services/me';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';

type IntegratedUser = {
  avatar_url: string;
  created_on: string;
  html_url: string;
  login: string;
  name: string | null;
  updated_on: string;
};

type OrganizationSettingsType = {
  integratedUser: IntegratedUser | null;
  reconnect: boolean;
  user: UserModel;
  organization: OrganizationModel;
  me: MeService;
};

export interface OrganizationSettingsSignature {
  Args: {
    model: OrganizationSettingsType;
  };
}

export default class OrganizationSettingsComponent extends Component<OrganizationSettingsSignature> {
  @service declare me: MeService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Settings': typeof OrganizationSettingsComponent;
  }
}
