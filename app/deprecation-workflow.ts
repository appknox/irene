import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    {
      handler: 'silence',
      matchId: 'ember-data:deprecate-legacy-imports',
    },
    {
      handler: 'silence',
      matchId: 'warp-drive.ember-inflector',
    },
    {
      handler: 'throw',
      matchId: 'ember-data:deprecate-non-strict-types',
    },
    {
      handler: 'throw',
      matchId: 'ember-data:deprecate-non-strict-id',
    },
    {
      handler: 'silence',
      matchId: 'ember-data:deprecate-non-unique-relationship-entries',
    },
  ],
});
