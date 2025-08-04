export const b64EncodeUnicode = (str: string) =>
  btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1: string) => {
      return String.fromCharCode(Number(`0x${p1}`));
    })
  );

export const getB64Token = (userId: number, token: string) =>
  b64EncodeUnicode(`${userId}:${token}`);
