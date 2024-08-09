import { service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import type { AkTreeProviderCheckExpandFuncType } from 'irene/components/ak-tree/provider';
import parseError from 'irene/utils/parse-error';

export interface OrganizationServiceAccountSectionSelectScopeSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    renderType?: 'view' | 'create';
  };
}

interface NodeDataObject {
  scopeKeys: (
    | 'scopePublicApiProjectRead'
    | 'scopePublicApiScanResultVa'
    | 'scopePublicApiUserRead'
  )[];
  scopeLabel?: string;
  scopeDescription?: string;
  accessType?: string;
}

enum ScopeNodeKey {
  PUBLIC_API = 'public-api',
  PROJECTS_READ = 'projects-read',
  SCAN_RESULTS_VA_READ = 'scan-results-va-read',
  USER_READ = 'user-read',
}

export default class OrganizationServiceAccountSectionSelectScopeComponent extends Component<OrganizationServiceAccountSectionSelectScopeSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked isEditView = false;
  @tracked expanded: string[] = [ScopeNodeKey.PUBLIC_API];
  @tracked checked: string[] = [];

  get renderType() {
    return this.args.renderType || 'view';
  }

  get isEditOrCreateView() {
    return this.isEditView || this.renderType === 'create';
  }

  get showHeaderAction() {
    return this.renderType === 'view' && !this.isEditView;
  }

  get treeData() {
    return A([
      {
        key: ScopeNodeKey.PUBLIC_API,
        label: this.intl.t('serviceAccountModule.scopes.public-api.label'),
        showCheckbox: this.isEditOrCreateView,
        children: [
          {
            key: ScopeNodeKey.PROJECTS_READ,
            showCheckbox: this.isEditOrCreateView,
            checked: this.args.serviceAccount?.scopePublicApiProjectRead,
          },
          {
            key: ScopeNodeKey.SCAN_RESULTS_VA_READ,
            showCheckbox: this.isEditOrCreateView,
            checked: this.args.serviceAccount?.scopePublicApiScanResultVa,
          },
          {
            key: ScopeNodeKey.USER_READ,
            showCheckbox: this.isEditOrCreateView,
            checked: this.args.serviceAccount?.scopePublicApiUserRead,
          },
        ],
      },
    ]);
  }

  get dataObjectForNode(): Record<string, NodeDataObject> {
    return {
      [ScopeNodeKey.PUBLIC_API]: {
        scopeKeys: [
          'scopePublicApiProjectRead',
          'scopePublicApiScanResultVa',
          'scopePublicApiUserRead',
        ],
      },
      [ScopeNodeKey.PROJECTS_READ]: {
        scopeKeys: ['scopePublicApiProjectRead'],
        scopeLabel: this.intl.t('serviceAccountModule.scopes.projects.label'),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.projects.readDescription'
        ),
        accessType: this.intl.t('read'),
      },
      [ScopeNodeKey.SCAN_RESULTS_VA_READ]: {
        scopeKeys: ['scopePublicApiScanResultVa'],
        scopeLabel: this.intl.t(
          'serviceAccountModule.scopes.scan-results-va.label'
        ),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.scan-results-va.readDescription'
        ),
        accessType: this.intl.t('read'),
      },
      [ScopeNodeKey.USER_READ]: {
        scopeKeys: ['scopePublicApiUserRead'],
        scopeLabel: this.intl.t('serviceAccountModule.scopes.user.label'),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.user.readDescription'
        ),
        accessType: this.intl.t('read'),
      },
    };
  }

  @action
  handleShowEditView() {
    this.isEditView = true;
  }

  @action
  handleCancelEditView() {
    this.isEditView = false;

    this.args.serviceAccount.rollbackAttributes();
  }

  @action
  onExpand(...args: Parameters<AkTreeProviderCheckExpandFuncType>) {
    const [expanded] = args;

    this.expanded = expanded;
  }

  @action
  onCheck(...args: Parameters<AkTreeProviderCheckExpandFuncType>) {
    const [checked, node] = args;
    const dataObject = this.dataObjectForNode[node.key] as NodeDataObject;

    this.checked = checked;

    dataObject.scopeKeys.forEach((key) => {
      this.args.serviceAccount.set(key, Boolean(node.checked));
    });
  }

  @action
  handleUpdateServiceAccount() {
    this.updateServiceAccount.perform();
  }

  updateServiceAccount = task(async () => {
    try {
      await this.args.serviceAccount.save();

      this.isEditView = false;

      this.notify.success(this.intl.t('serviceAccountModule.editSuccessMsg'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Section::SelectScope': typeof OrganizationServiceAccountSectionSelectScopeComponent;
  }
}
