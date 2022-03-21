/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';

// This function receives the params `params, hash`
const pageNumber = params => params[0] + 1;

const PageNumberHelper = helper(pageNumber);

export { pageNumber };

export default PageNumberHelper;
