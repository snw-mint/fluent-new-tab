import fs from 'fs';
import path from 'path';

const getLangCode = (locale) => {
  if (locale === 'zh_CN') return 'zh-CN';
  if (locale === 'zh_TW') return 'zh-TW';
  if (locale === 'fil_PH') return 'tl';
  if (locale === 'cs_CZ') return 'cs';
  if (locale === 'da_DK') return 'da';
  if (locale === 'de_DE') return 'de';
  if (locale === 'el_GR') return 'el';
  if (locale === 'es_ES') return 'es';
  if (locale === 'fi_FI') return 'fi';
  if (locale === 'fr_FR') return 'fr';
  if (locale === 'hu_HU') return 'hu';
  if (locale === 'it_IT') return 'it';
  if (locale === 'ja_JP') return 'ja';
  if (locale === 'ko_KR') return 'ko';
  if (locale === 'nl_NL') return 'nl';
  if (locale === 'pl_PL') return 'pl';
  if (locale === 'pt_BR') return 'pt';
  if (locale === 'ro_RO') return 'ro';
  if (locale === 'ru_RU') return 'ru';
  if (locale === 'sv_SE') return 'sv';
  if (locale === 'tr_TR') return 'tr';
  if (locale === 'uk_UA') return 'uk';
  if (locale === 'vi_VN') return 'vi';

  if (locale.includes('_')) return locale.split('_')[0];
  return locale;
};

async function translateText(text, targetLang) {
  const code = getLangCode(targetLang);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${code}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    return data[0].map((item) => item[0]).join('');
  } catch (error) {
    console.error(`Error translating to ${targetLang} (${code}):`, error);
    return text;
  }
}

async function processLocaleKey(key, sourceObj, targetLocale, msgPath) {
  const msgs = fs.existsSync(msgPath)
    ? JSON.parse(fs.readFileSync(msgPath, 'utf8'))
    : {};

  if (!msgs[key] || !msgs[key].message) {
    console.log(`[${targetLocale}] Translating missing key '${key}'...`);
    const translated =
      targetLocale === 'en_US'
        ? sourceObj.message
        : await translateText(sourceObj.message, targetLocale);

    msgs[key] = {
      ...sourceObj,
      message: translated,
    };

    fs.writeFileSync(msgPath, JSON.stringify(msgs, null, 2) + '\n');
    return true;
  }
  return false;
}

async function run() {
  const args = process.argv.slice(2);
  const localesDir = path.join(process.cwd(), '_locales');

  if (!fs.existsSync(localesDir)) {
    console.error(
      'Could not find _locales directory. Run this script from the project root.',
    );
    process.exit(1);
  }

  const enPath = path.join(localesDir, 'en_US', 'messages.json');
  if (!fs.existsSync(enPath)) {
    console.error('Could not find en_US/messages.json source.');
    process.exit(1);
  }

  const enMsgs = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const locales = fs
    .readdirSync(localesDir)
    .filter((f) => fs.statSync(path.join(localesDir, f)).isDirectory());

  if (args.length >= 2) {
    const key = args[0];
    const text = args[1];
    const sourceObj = { message: text };

    for (const locale of locales) {
      if (locale === 'ru_RU' || locale === 'ru') continue;
      const msgPath = path.join(localesDir, locale, 'messages.json');
      await processLocaleKey(key, sourceObj, locale, msgPath);
    }
  } else {
    console.log('Checking all locales for missing keys relative to en_US...');
    let totalTranslated = 0;

    for (const locale of locales) {
      if (locale === 'en_US' || locale === 'ru_RU' || locale === 'ru') {
        console.log(`Skipping locale ${locale}`);
        continue;
      }

      const msgPath = path.join(localesDir, locale, 'messages.json');
      let localeTranslatedCount = 0;

      for (const [key, sourceObj] of Object.entries(enMsgs)) {
        const translated = await processLocaleKey(
          key,
          sourceObj,
          locale,
          msgPath,
        );
        if (translated) {
          localeTranslatedCount++;
          totalTranslated++;
          // Small delay to prevent hitting API rate limits
          await new Promise((res) => setTimeout(res, 50));
        }
      }

      if (localeTranslatedCount === 0) {
        console.log(`Locale ${locale} is up to date.`);
      } else {
        console.log(
          `Locale ${locale} updated with ${localeTranslatedCount} translated keys.`,
        );
      }
    }

    console.log(
      `Finished checking all locales! Total translated keys added: ${totalTranslated}`,
    );
  }
}

run();
