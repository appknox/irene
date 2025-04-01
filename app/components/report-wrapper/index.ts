import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type { MenuItem } from '../side-nav';
import type UserModel from 'irene/models/user';
import type WhitelabelService from 'irene/services/whitelabel';

export interface ReportWrapperComponentSignature {
  Args: { user: UserModel };
  Blocks: { default: [] };
}

export default class ReportWrapperComponent extends Component<ReportWrapperComponentSignature> {
  @service('browser/window') declare window: Window;
  @service declare intl: IntlService;
  @service declare whitelabel: WhitelabelService;

  @tracked isSidebarCollapsed: boolean;
  productVersion = '1.0.0'; // Simple version for the report module

  constructor(owner: unknown, args: ReportWrapperComponentSignature['Args']) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('reportSidebarState');

    this.isSidebarCollapsed =
      storedState !== null ? storedState === 'collapsed' : true;
  }

  get reportMenuItems() {
    return [
      {
        label: this.intl.t('reportModule.generateReport'),
        icon: 'auto-awesome',
        route: 'authenticated.reports.generate',
        currentWhen: 'authenticated.reports',
      },
    ] as MenuItem[];
  }

  get isWhitelabel() {
    return !this.whitelabel.is_appknox_url;
  }

  @action
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;

    this.window.localStorage.setItem(
      'reportSidebarState',
      this.isSidebarCollapsed ? 'collapsed' : 'expanded'
    );
  }

  get drawerInfo() {
    return [
      {
        title: 'What data does this AI model access in my app?',
        body: 'Lorem ipsum dolor sit amet consectetur. Volutpat ullamcorper in placerat viverra ipsum imperdiet malesuada tellus. Fermentum quis varius eget faucibus vivamus. Commodo sagittis non duis sit tincidunt facilisi bibendum mi. Tortor aliquam egestas in non. Fermentum.',
        marginTop: 'mt-2',
      },
      {
        title:
          'Does any 3rd party product/service have access to this model which has been trained using my organizations applications?',
        body: 'Lorem ipsum dolor sit amet consectetur. Laoreet fermentum arcu at elementum amet maecenas est ultrices. Enim dapibus facilisi adipiscing commodo velit accumsan vitae.',
        marginTop: 'mt-3',
      },
      {
        title: 'How is this AI model secured from potential threats?',
        body: 'Lorem ipsum dolor sit amet consectetur. Volutpat ullamcorper in placerat viverra ipsum imperdiet malesuada tellus. Fermentum quis varius eget faucibus vivamus. Commodo sagittis non duis sit tincidunt facilisi bibendum mi. Tortor aliquam egestas in non. Fermentum faucibus elementum tristique donec elit vitae posuere etiam. Sem est commodo mattis elementum etiam vitae pellentesque aliquet.',
        marginTop: 'mt-3',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ReportWrapper: typeof ReportWrapperComponent;
  }
}
