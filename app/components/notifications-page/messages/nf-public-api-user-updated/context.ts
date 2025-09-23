export class NfPublicApiUserUpdatedContext {
  type: string;
  user_email: string;
  current: string;
  updated: string;
  changed_by: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.type = input_json.type;
    this.user_email = input_json.user_email;
    this.current = input_json.current;
    this.updated = input_json.updated;
    this.changed_by = input_json.changed_by;
  }
}
