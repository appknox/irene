import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  pdf_progress: 100,
  pdf_status: 2,
  report_password: () => faker.string.alphanumeric(12).toUpperCase(),
  generated_by: () => faker.internet.email(),
  created_on: () => faker.date.recent().toISOString(),
  interim_analysis_status: 1,
  is_visible_to_customer: false,
  language: 'en',
});
