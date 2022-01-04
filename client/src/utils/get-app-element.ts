import { isServer } from './is-server';

export const getAppElement = (cardRoot = true) => {
  if (isServer()) return;
  if (!cardRoot) return document.body;
  return (document.querySelector('#card-root') || document.body) as HTMLElement;
};
