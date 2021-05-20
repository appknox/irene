import Model, {
  attr
} from '@ember-data/model';

export default class RegistrationRequestModel extends Model {

  @attr('string') email;
  @attr() data;
  @attr('date') createdOn;
  @attr('date') updatedOn;
  @attr('date') validUntil;
  @attr('string') approvalStatus;
  @attr('string') source;
  @attr('boolean') isActivated;

  get fullName() {
    return `${this.data.first_name} ${this.data.last_name}`;
  }

  updateStatus(data, id) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.updateStatus(this.store, this.constructor.modelName, this, data, id);
  }

  resend(id) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.resend(this.store, this.constructor.modelName, this, id);
  }
}
