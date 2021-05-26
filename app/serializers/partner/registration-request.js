import DRFSerializer from 'irene/serializers/drf';
import {
  isEmpty
} from '@ember/utils';

export default DRFSerializer.extend({
  serialize(snapshot) {
    const json = {
      email: snapshot.attr('email'),
      first_name: isEmpty(snapshot.attr('data').first_name) ? undefined : snapshot.attr('data').first_name,
      last_name: isEmpty(snapshot.attr('data').last_name) ? undefined : snapshot.attr('data').last_name,
      company: snapshot.attr('data').company
    }
    return json;
  }
});
