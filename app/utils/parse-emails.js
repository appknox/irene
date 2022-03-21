/* eslint-disable prettier/prettier */
import {validate} from 'ember-validators';

function validateEmail(email) {
  return validate('format', email, { type: 'email' }, null, 'email');
}

export default function parseEmails(emailsStr) {
  const emails = emailsStr.replace(/[\n\s\t]/g, '').split(',');
  return emails.filter(m => m).filter(m => validateEmail(m));
}
