import { helper } from '@ember/component/helper';

type Positional = [string | undefined];

export function fileExtension(params: Positional) {
  const filename = params[0];

  if (!filename) {
    return null;
  }

  const file_parts = filename.split('.');

  if (file_parts.length <= 1) {
    return 'unk';
  }

  return file_parts.pop();
}

const FileExtensionHelper = helper(fileExtension);

export default FileExtensionHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-extension': typeof FileExtensionHelper;
  }
}
