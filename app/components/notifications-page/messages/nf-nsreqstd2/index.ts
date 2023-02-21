import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import MeService from 'irene/services/me';
import OrganizationNamespaceModel from 'irene/models/organization-namespace';
import { NfNsreqstd2Context } from './context';
import UserModel from 'irene/models/user';
import OrganizationUserModel from 'irene/models/organization-user';

interface NfNsreqstd2ComponentArgs {
  context: NfNsreqstd2Context;
}

export default class NfNsreqstd2Component extends Component<NfNsreqstd2ComponentArgs> {
  @service declare store: Store;
  @service declare me: MeService;
  @service declare notification: NotificationService;

  @tracked namespace?: OrganizationNamespaceModel | null;
  @tracked currentUser?: UserModel;
  @tracked approver?: OrganizationUserModel;

  get context() {
    return this.args.context;
  }

  fetch = task({ drop: true }, async () => {
    const [namespace, user] = await Promise.all([
      await this.fetchNamespace.perform(),
      await this.me.user(),
    ]);
    const approver = await namespace?.approvedBy;
    this.approver = approver;
    this.currentUser = user;
  });

  fetchNamespace = task({ drop: true }, async () => {
    const namespace_id = this.context.namespace_id;
    try {
      this.namespace = await this.store.findRecord(
        'organization-namespace',
        namespace_id
      );
    } catch (err: unknown) {
      this.namespace = null;
    }
    return this.namespace;
  });

  get namespaceModeratorDisplay(): string {
    const currentUsername = this.currentUser?.username;
    const approverUsername = this.approver?.username || '';
    if (!currentUsername) {
      return approverUsername;
    }

    if (currentUsername == approverUsername) {
      return 'You';
    }
    return approverUsername;
  }

  approveNamespace = task(async () => {
    const ns = this.namespace;
    if (!ns) {
      return;
    }
    ns.isApproved = true;
    await ns.save();
    await this.fetch.perform();
  });

  rejectNamespace = task(async () => {
    const ns = this.namespace;
    if (!ns) {
      return;
    }
    ns.deleteRecord();
    await ns.save();
    await this.fetch.perform();
  });

  get isApproved() {
    if (!this.namespace) {
      return false;
    }
    return this.namespace.isApproved;
  }

  get isRejected() {
    if (this.namespace == null) {
      return true;
    }
    return false;
  }

  get isUnModerated() {
    if (!this.namespace) {
      return false;
    }
    return !!this.namespace.isApproved;
  }

  get isLoading() {
    return this.fetchNamespace.isRunning;
  }
}
