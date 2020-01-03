const installStripe = (()=>{
  const script = window.document.createElement('script');
  script.src = 'https://js.stripe.com/v3/';
  window.document.getElementsByTagName('head')[0].appendChild(script);
});

export default installStripe;
