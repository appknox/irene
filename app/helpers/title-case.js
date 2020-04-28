import { helper } from '@ember/component/helper';

const titleCase = params => {
  const inputString = params[0] || "plan name";
  const wordsList = inputString.toLowerCase().split(' ');
  const titleCasedWordsList = wordsList.map((word)=>{
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
  })
  return titleCasedWordsList.join(' ');

};

export default helper(titleCase);
