import DS from 'ember-data';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

export default DS.Model.extend({
  i18n: Ember.inject.service(),
  role: DS.attr('number'),
  username: DS.attr('string'),
  email: DS.attr('string'),
  tMember: t("member"),
  tOwner: t("owner")
});
