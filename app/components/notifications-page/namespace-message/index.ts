import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';

import MeService from 'irene/services/me';
import OrganizationNamespaceModel from 'irene/models/organization-namespace';
import UserModel from 'irene/models/user';
import OrganizationUserModel from 'irene/models/organization-user';

import { NfNsreqstd2Context } from '../messages/nf-nsreqstd2/context';
import { NfNsreqstd1Context } from '../messages/nf-nsreqstd1/context';
import { NfStrUrlNsreqstd2Context } from '../messages/nf-str-url-nsreqstd2/context';
import { NfStrUrlNsreqstd1Context } from '../messages/nf-str-url-nsreqstd1/context';

interface NotificationsPageNamespaceMessageSignature {
  Args: {
    context:
      | NfNsreqstd2Context
      | NfNsreqstd1Context
      | NfStrUrlNsreqstd2Context
      | NfStrUrlNsreqstd1Context;
    primaryMessage: string;
  };
  Blocks: {
    approved: [{ moderaterName: string }];
    rejected: [];
  };
}

export default class NotificationsPageNamespaceMessageComponent extends Component<NotificationsPageNamespaceMessageSignature> {
  @service declare store: Store;
  @service declare me: MeService;

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

    ns.unloadRecord();
    this.namespace = null;
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
    return !this.isApproved && !this.isRejected;
  }

  get isLoading() {
    return this.fetchNamespace.isRunning;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::NamespaceMessage': typeof NotificationsPageNamespaceMessageComponent;
  }
}
