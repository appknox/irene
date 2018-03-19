import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import ENUMS from 'irene/enums';

const Organization = DS.Model.extend(BaseModelMixin, {
  name: DS.attr('string'),
  owner: DS.attr('string'),
  users: DS.attr()
});

export default Organization;
