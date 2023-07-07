import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import IntlService from 'ember-intl/services/intl';
import { TypographyFontWeight } from 'irene/components/ak-typography';
import OrganizationMemberModel from 'irene/models/organization-member';

interface OrganizationMemberLastLoginSignature {
  Args: {
    member: OrganizationMemberModel | null;
    fontWeight?: TypographyFontWeight;
  };
  Element: HTMLElement;
}

export default class OrganizationMemberLastLoginComponent extends Component<OrganizationMemberLastLoginSignature> {
  @service declare intl: IntlService;
  get lastLogin() {
    const lastLogin = this.args.member?.lastLoggedIn;

    if (!lastLogin) {
      return this.intl.t('never');
    }

    return dayjs(lastLogin).format('MMM DD, YYYY');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationMember::List::MemberLastLogin': typeof OrganizationMemberLastLoginComponent;
    'organization-member/list/member-last-login': typeof OrganizationMemberLastLoginComponent;
  }
}
