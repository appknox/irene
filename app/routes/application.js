import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const InvitationRoute = Route.extend({

  title: `Application Entry point`,
  intl: service(),
  beforeModel() {
    this._super(...arguments)
    /* NOTE: if you lazily load translations, here is also where you would load them via `intl.addTranslations` */
    return this.get('intl').setLocale(['en']); /* array optional */
  }
});

export default InvitationRoute;
