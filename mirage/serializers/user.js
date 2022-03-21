/* eslint-disable ember/avoid-leaking-state-in-ember-objects, prettier/prettier */
import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: ["projectIds"]
});
