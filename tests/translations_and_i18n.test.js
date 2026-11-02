import test from 'node:test';
import assert from 'node:assert/strict';

import { TRANSLATIONS, getTranslation } from '../public/js/translations.js';

test('Translations - All 5 Indic supported languages are configured', () => {
  const supported = ['en', 'hi', 'te', 'kn', 'ta'];
  supported.forEach(lang => {
    assert.ok(TRANSLATIONS[lang], `Language '${lang}' dictionary must exist`);
    assert.ok(Object.keys(TRANSLATIONS[lang]).length > 40, `Language '${lang}' must have full vocabulary`);
  });
});

test('Translations - 100% Key Parity across all languages (No missing keys)', () => {
  const enKeys = Object.keys(TRANSLATIONS.en);
  const otherLangs = ['hi', 'te', 'kn', 'ta'];

  otherLangs.forEach(lang => {
    const langDict = TRANSLATIONS[lang];
    const missingKeys = enKeys.filter(k => !(k in langDict));
    assert.deepEqual(
      missingKeys,
      [],
      `Language '${lang}' has missing keys compared to English: ${missingKeys.join(', ')}`
    );
  });
});

test('Translations - All values are non-empty strings', () => {
  const langs = ['en', 'hi', 'te', 'kn', 'ta'];
  langs.forEach(lang => {
    const dict = TRANSLATIONS[lang];
    Object.entries(dict).forEach(([key, val]) => {
      assert.equal(typeof val, 'string', `${lang}.${key} must be a string`);
      assert.ok(val.trim().length > 0, `${lang}.${key} must not be an empty string`);
    });
  });
});

test('Translations - getTranslation retrieves correct language text', () => {
  assert.equal(getTranslation('en', 'btnCreatePlan'), 'Create Plan');
  assert.equal(getTranslation('hi', 'btnCreatePlan'), 'योजना बनाएं');
  assert.equal(getTranslation('te', 'btnCreatePlan'), 'ప్లాన్ సిద్ధం చేయండి');
  assert.equal(getTranslation('kn', 'btnCreatePlan'), 'ಯೋಜನೆ ರೂಪಿಸಿ');
  assert.equal(getTranslation('ta', 'btnCreatePlan'), 'திட்டத்தை உருவாக்கவும்');
});

test('Translations - Graceful fallback to English for unsupported locale or missing key', () => {
  // Unsupported locale code falls back to English
  assert.equal(getTranslation('es', 'btnCreatePlan'), 'Create Plan');
  assert.equal(getTranslation('de', 'welcomeTitle'), 'What celebration are we planning today?');

  // Completely unknown key returns the key itself without throwing
  assert.equal(getTranslation('en', 'nonExistentKey123'), 'nonExistentKey123');
  assert.equal(getTranslation('te', 'nonExistentKey123'), 'nonExistentKey123');
});
