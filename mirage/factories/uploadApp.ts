import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  url() {
    const fileKey = this.file_key as string;

    return `/api/${fileKey}/s3_upload_file`;
  },

  file_key: () => faker.string.uuid(),

  file_key_signed() {
    const fileKey = this.file_key as string;

    return `${fileKey}:1pkq3s:JhWX-3B-1FdkHA2Y3yvrud_Aa7rN5q1_z0-THg9isUs`;
  },
});
