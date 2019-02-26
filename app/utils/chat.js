export function setUserEmail(email, hash) {
  if (checkCrispExists()) {
    window.$crisp.push(["set", "user:email", [ email,hash ]]);
  }
}

export function setUserCompany(company) {
  if (checkCrispExists()) {
    window.$crisp.push(["set", "user:company", [company]]);
  }
}

export function openChatBox() {
  if(checkCrispExists()) {
    window.$crisp.push(['do', 'chat:open']);
  }
}

function checkCrispExists() {
  return window.$crisp && window.$crisp.push;
}
