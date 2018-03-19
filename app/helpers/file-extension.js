import Ember from 'ember';

const fileExtension = params => {
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

const FileExtensionHelper = Ember.Helper.helper(fileExtension);
export default FileExtensionHelper;
