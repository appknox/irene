import Service from '@ember/service';
import { service } from '@ember/service';
import { action } from '@ember/object';

import triggerAnalytics from 'irene/utils/trigger-analytics';
import type FreshdeskService from './freshdesk';

export default class UserAuthService extends Service {
  @service declare session: any;
  @service declare freshdesk: FreshdeskService;

  @action invalidateSession() {
    this.freshdesk.logUserOutOfSupportWidget();

    triggerAnalytics('logout', {} as CsbAnalyticsData);

    this.session.invalidate();
  }
}
