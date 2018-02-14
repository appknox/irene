/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
const surveyMonkey = function() {
  try {
    return (function(e,t,n,c){let o,s,a;e.SMCX=e.SMCX||[],t.getElementById(c)||(o=t.getElementsByTagName(n),s=o[o.length-1],a=t.createElement(n),a.type="text/javascript",a.async=!0,a.id=c,a.src=["https:"===location.protocol?"https://":"http://","widget.surveymonkey.com/collect/website/js/MtjOqDUyYwRx0qzpSaLLe1JQUVJCqqRk2B_2FM_2BHAJHk0MJ0Zf6ecaXnC06zUCV_2FVa.js"].join(""),s.parentNode.insertBefore(a,s));})(window,document,"script","smcx-sdk");
  } catch (error) {}
};

export default surveyMonkey;
