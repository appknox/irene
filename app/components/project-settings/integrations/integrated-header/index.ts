import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import type IntlService from 'ember-intl/services/intl';

export interface ProjectSettingsIntegrationsIntegratedHeaderSignature {
  Args: {
    headerText: string;
    headerSubtext?: string;
    showHeaderActions?: boolean;
    editAction(): void;
    deleteAction(): void;
  };
}

export default class ProjectSettingsIntegrationsIntegratedHeaderComponent extends Component<ProjectSettingsIntegrationsIntegratedHeaderSignature> {
  @service declare intl: IntlService;

  @tracked headActionsRef: HTMLElement | null = null;

  get headerActionsList() {
    return [
      {
        label: this.intl.t('edit'),
        action: this.handleEditAction,
      },
      {
        label: this.intl.t('delete'),
        action: this.handleDeleteAction,
        hideDivider: true,
      },
    ];
  }

  @action handleEditAction() {
    this.handleHeaderActionsClose();
    this.args.editAction();
  }

  @action handleDeleteAction() {
    this.handleHeaderActionsClose();
    this.args.deleteAction();
  }

  @action
  handleHeaderActionsOpen(event: MouseEvent) {
    this.headActionsRef = event.currentTarget as HTMLElement;
  }

  @action
  handleHeaderActionsClose() {
    this.headActionsRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::IntegratedHeader': typeof ProjectSettingsIntegrationsIntegratedHeaderComponent;
  }
}
