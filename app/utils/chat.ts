export function setUserEmail(email: string, hash: string) {
  if (crispExists()) {
    window.$crisp.push(['do', 'chat:show']);
    window.$crisp.push(['set', 'user:email', [email, hash]]);
  }
}

export function setUserCompany(company: string) {
  if (crispExists()) {
    window.$crisp.push(['set', 'user:company', [company, {}]]);
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
