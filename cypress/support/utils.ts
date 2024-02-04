/**
 * @function getAliasName
 * @returns String with correct alias structure - "@{aliasName}"
 */
export const getAliasName = (alias: string): `@${string}` => `@${alias}`;
