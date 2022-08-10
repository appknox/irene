import Component from '@glimmer/component';

export default class LoginMFAComponent extends Component {
  get isOTPEmpty() {
    return this.args.otp == '';
  }
}
