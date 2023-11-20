export class NfStrUrlVldtnErrContext {
  store_url: string;
  error_message: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.store_url = input_json.store_url;
    this.error_message = input_json.error_message;
  }
}
