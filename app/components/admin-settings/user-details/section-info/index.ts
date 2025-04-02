import Component from '@glimmer/component';
import { AkStackArgs } from 'irene/components/ak-stack';

interface AdminSettingsUserDetailsSectionInfoSignature {
  Element: HTMLElement;
  Args: Pick<
    AkStackArgs,
    'width' | 'justifyContent' | 'alignItems' | 'direction' | 'spacing'
  >;
  Blocks: {
    default: [];
  };
}

export default class AdminSettingsUserDetailsSectionInfoComponent extends Component<AdminSettingsUserDetailsSectionInfoSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::SectionInfo': typeof AdminSettingsUserDetailsSectionInfoComponent;
  }
}
