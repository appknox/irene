import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export const UPLOAD_APP_FACTORY_DEF = {
  url() {
    const fileKey = this.file_key;

    return `/api/${fileKey}/s3_upload_file`;
  },

  get file_key() {
    return faker.string.uuid();
  },

  get file_key_signed() {
    const fileKey = this.file_key;

    return `${fileKey}:1pkq3s:JhWX-3B-1FdkHA2Y3yvrud_Aa7rN5q1_z0-THg9isUs`;
  },

  submission_id(id: number) {
    return id + 100;
  },
};

export default Factory.extend(UPLOAD_APP_FACTORY_DEF);
