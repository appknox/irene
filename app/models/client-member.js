import Model, {
  attr
} from '@ember-data/model';
import {
  reads
} from '@ember/object/computed';
import {
  computed
} from '@ember/object';

export default class ClientMemberModel extends Model {
  @attr() member;

  @reads('member.first_name') firstName;
  @reads('member.last_name') lastName;
  @reads('member.email') email;
  @reads('member.is_active') isActive;

  @attr('string') role;

  @computed('firstName', 'lastName')
  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }

}
