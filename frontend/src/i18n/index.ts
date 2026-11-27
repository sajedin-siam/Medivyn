import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import bn from './bn.json'
import en from './en.json'

// shortcut: English only for now. bn.json covers just the layout and login, while every feature page is
// hard-coded English. Once the pages use t(), restore the language toggle (removed from AppLayout.tsx)
// and read the saved choice from localStorage 'mediconnect-lang' again.

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, bn: { translation: bn } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.language
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  localStorage.setItem('mediconnect-lang', lng)
})

export default i18n
