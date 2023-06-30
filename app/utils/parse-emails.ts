// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { validate } from 'ember-validators';

function validateEmail(email: string): boolean {
  return validate('format', email, { type: 'email' }, null, 'email');
}

export default function parseEmails(emailsStr: string): string[] {
  const emails: string[] = emailsStr.replace(/[\n\s\t]/g, '').split(',');
  return emails.filter((m) => m).filter((m) => validateEmail(m));
}
