import dayjs from 'dayjs';

export class NfNsreqstd2Context {
  namespace_id: number;
  namespace_created_on: string;
  namespace_value: string;
  platform: string;
  platform_display: number;
  initial_requester_username: string;
  current_requester_username: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.namespace_id = input_json.namespace_id;
    this.namespace_created_on = input_json.namespace_created_on;
    this.namespace_value = input_json.namespace_value;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
    this.initial_requester_username = input_json.initial_requester_username;
    this.current_requester_username = input_json.current_requester_username;
  }

  get namespaceCreatedOnDisplay() {
    return dayjs(this.namespace_created_on).format('DD MMM YYYY');
  }
}
