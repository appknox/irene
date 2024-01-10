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

export function removeCrispListeners() {
  window.$crisp.push(['off', 'session:loaded']);
  window.$crisp.push(['off', 'chat:opened']);
  window.$crisp.push(['off', 'chat:closed']);
}

function getChatButtonElement() {
  return document.querySelector('#crisp-chatbox > div > a') as HTMLElement;
}

export function scaleCrispChatbox() {
  if (crispExists()) {
    let crispButton = getChatButtonElement();

    if (crispButton) {
      crispButton.style.transform = 'scale(0)';
      window.$crisp.push(['do', 'chat:close']);

      window.$crisp.on('chat:opened', () => {
        crispButton = getChatButtonElement();

        crispButton.style.transform = 'scale(1)';
      });

      window.$crisp.on('chat:closed', () => {
        crispButton.style.transform = 'scale(0)';
      });
    }
  }
}
