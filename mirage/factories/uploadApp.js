import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  url() {
    return `/api/${this.file_key}/s3_upload_file`;
  },

  file_key: () => faker.datatype.uuid(),

  file_key_signed() {
    return `${this.file_key}:1pkq3s:JhWX-3B-1FdkHA2Y3yvrud_Aa7rN5q1_z0-THg9isUs`;
  },
});
