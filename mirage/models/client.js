import {
  Model,
  belongsTo
} from 'ember-cli-mirage';

export default Model.extend({
  creditCompound: belongsTo('credits/clientCompounds')
});
