/* eslint-disable @typescript-eslint/no-explicit-any */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import MeService from 'irene/services/me';
import OrganizationNamespaceModel from 'irene/models/organization-namespace';
import { NfNsreqstd2Context } from './context';

interface NfNsreqstd2ComponentArgs {
  context: NfNsreqstd2Context;
}

export default class NfNsreqstd2Component extends Component<NfNsreqstd2ComponentArgs> {
  @service declare store: Store;
  @service declare me: MeService;
  @service declare notification: NotificationService;

  @tracked namespace: OrganizationNamespaceModel | null = null;
  @tracked namespaceIsRejected = false;

  @tracked meUsername = '';
  @tracked moderatorUsername = '';

  fetchNamespace = task(async () => {
    try {
      this.namespace = await this.store.findRecord(
        'organization-namespace',
        this.args.context.namespace_id
      );
    } catch (err: any) {
      this.namespaceIsRejected = true;
      this.namespace = null;
    }
  });

  fetchUsernames = task(async () => {
    this.meUsername = (await (await this.me.getMembership()).member).username;
    this.moderatorUsername = (await this.namespace?.approvedBy)?.username || '';
  });

  get namespaceModeratorDisplay(): string {
    if (this.meUsername == this.moderatorUsername) {
      return 'You';
    }
    return this.moderatorUsername;
  }

  approveNamespace = task(async () => {
    const ns = this.namespace;
    if (!ns) {
      return;
    }
    ns.isApproved = true;
    await ns.save();
    this.fetchUsernames.perform();
  });

  rejectNamespace = task(async () => {
    const ns = this.namespace;
    if (!ns) {
      return;
    }
    ns.deleteRecord();
    await ns.save();
    this.fetchNamespace.perform();
  });
}
