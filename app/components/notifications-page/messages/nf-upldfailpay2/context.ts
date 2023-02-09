export class NfUpldfailpay2Context {
  package_name: string;
  requester_username: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.package_name = input_json.package_name;
    this.requester_username = input_json.requester_username;
  }
}
