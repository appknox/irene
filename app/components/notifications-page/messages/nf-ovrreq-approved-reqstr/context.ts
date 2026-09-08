export class NfOvrreqApprovedReqstrContext {
  file_id: string;
  analysis_id: string;
  vulnerability_id: string;
  reviewer_username: string;
  reviewer_email: string;
  requester_username: string;
  requester_email: string;
  override_request_uuid: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.file_id = input_json.file_id;
    this.analysis_id = input_json.analysis_id;
    this.vulnerability_id = input_json.vulnerability_id;
    this.reviewer_username = input_json.reviewer_username;
    this.reviewer_email = input_json.reviewer_email;
    this.requester_username = input_json.requester_username;
    this.requester_email = input_json.requester_email;
    this.override_request_uuid = input_json.override_request_uuid;
  }
}
