import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import * as chat from 'irene/utils/chat';
import { openKnowledgeBasePanel } from 'irene/utils/knowledge-base';

export default class HomePageOrgDashboardNavComponent extends Component {
  @service integration;

  @tracked isUploading = false;
  @tracked progress = 0;

  get showKnowledgeBase() {
    return this.integration.isDocument360Enabled();
  }

  @action setAppUploadStatus(status) {
    this.isUploading = status;
  }

  @action setAppUploadProgress(progress) {
    this.progress = progress;
  }

  @action openChatBox() {
    chat.openChatBox();
  }

  @action onOpenKnowledgeBase() {
    openKnowledgeBasePanel();
  }
}
