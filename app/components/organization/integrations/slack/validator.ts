import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  channelId: validatePresence(true),
};
