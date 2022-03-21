/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';

const TeamInvitation = Model.extend({

  role : attr('number'),
  email: attr('string'),
});


export default TeamInvitation;
