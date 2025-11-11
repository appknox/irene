import Service from '@ember/service';
import { service } from '@ember/service';
import { action } from '@ember/object';

import type AnalyticsService from './analytics';
import type FreshdeskService from './freshdesk';

export default class UserAuthService extends Service {
  @service declare session: any;
  @service declare freshdesk: FreshdeskService;
  @service declare analytics: AnalyticsService;

  @action invalidateSession() {
    this.freshdesk.logUserOutOfSupportWidget();

    this.analytics.track({
      name: 'logout',
      properties: {},
    });

    this.session.invalidate();
  }
}
