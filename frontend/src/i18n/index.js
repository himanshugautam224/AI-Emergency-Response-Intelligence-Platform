import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import or from './locales/or.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';
import as_ from './locales/as.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      ta: { translation: ta },
      te: { translation: te },
      mr: { translation: mr },
      gu: { translation: gu },
      kn: { translation: kn },
      or: { translation: or },
      ml: { translation: ml },
      pa: { translation: pa },
      as: { translation: as_ },
    },
    lng: localStorage.getItem('erip_lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'erip_lang',
    },
  });

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English' },
  { code: 'hi', name: 'Hindi',      native: 'हिंदी' },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা' },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்' },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi',    native: 'मराठी' },
  { code: 'gu', name: 'Gujarati',   native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia',       native: 'ଓଡ଼ିଆ' },
  { code: 'ml', name: 'Malayalam',  native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi',    native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese',   native: 'অসমীয়া' },
];

export default i18n;
