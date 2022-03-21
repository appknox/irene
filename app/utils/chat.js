/* eslint-disable prettier/prettier */
export function setUserEmail(email, hash) {
  if (crispExists()) {
    window.$crisp.push(['do', 'chat:show']);
    window.$crisp.push(["set", "user:email", [email, hash]]);
  }
}

export function setUserCompany(company) {
  if (crispExists()) {
    window.$crisp.push(["set", "user:company", [company, {}]]);
  }
}

export function openChatBox() {
  if (crispExists()) {
    window.$crisp.push(['do', 'chat:open']);
  }
}

function crispExists() {
  return window.$crisp && window.$crisp.push;
}
