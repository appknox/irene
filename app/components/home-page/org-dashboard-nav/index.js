import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import * as chat from 'irene/utils/chat';
export default class HomePageOrgDashboardNavComponent extends Component {
  @service integration;
  @service freshdesk;

  @tracked isUploading = false;
  @tracked progress = 0;

  get showKnowledgeBase() {
    return this.freshdesk.isSupportWidgetEnabled;
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
    this.freshdesk.openSupportWidget();
  }
}
