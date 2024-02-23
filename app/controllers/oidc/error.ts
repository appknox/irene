import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export interface OidcError {
  statusCode: number;
  code?: string;
  description?: string;
}

export default class OidcErrorController extends Controller {
  @tracked error: OidcError | null = null;
}
