import { helper } from '@ember/component/helper';

type Positional = [string | undefined];

const fileExtension = (params: Positional) => {
  const filename = params[0];

  if (!filename) {
    return null;
  }

  const file_parts = filename.split('.');

  if (file_parts.length <= 1) {
    return 'unk';
  }

  return file_parts.pop();
};

export { fileExtension };
export default helper(fileExtension);
