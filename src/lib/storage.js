/* Saved progress, so a visitor can close the tab and come back. */
import { store } from './submit';

const KEY = 'mulhim.progress.v2';
const LANG = 'mulhim.lang';

export function loadProgress() {
  try {
    const raw = store.get(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && p.phase ? p : null;
  } catch (e) { return null; }
}

export const saveProgress = (snapshot) => store.set(KEY, JSON.stringify(snapshot));
export const clearProgress = () => store.del(KEY);
export const loadLang = () => store.get(LANG);
export const saveLang = (lang) => store.set(LANG, lang);
