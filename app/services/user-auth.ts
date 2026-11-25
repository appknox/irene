import Service from '@ember/service';
import { service } from '@ember/service';
import { action } from '@ember/object';

import type AnalyticsService from './analytics';
import type { SessionService } from 'irene/adapters/auth-base';

export default class UserAuthService extends Service {
  @service declare session: SessionService;
  @service declare analytics: AnalyticsService;

  @action invalidateSession() {
    this.analytics.track({ name: 'LOGOUT_EVENT' });
    this.session.invalidate();
  }
}
