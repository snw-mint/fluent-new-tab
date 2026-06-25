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

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node scripts/translate.mjs <key> <"text in english">');
    console.log(
      'Example: node scripts/translate.mjs privacyPolicyLabel "Read privacy policy"',
    );
    process.exit(1);
  }

  const key = args[0];
  const text = args[1];

  const localesDir = path.join(process.cwd(), '_locales');
  if (!fs.existsSync(localesDir)) {
    console.error(
      'Could not find _locales directory. Run this script from the project root.',
    );
    process.exit(1);
  }

  const locales = fs
    .readdirSync(localesDir)
    .filter((f) => fs.statSync(path.join(localesDir, f)).isDirectory());

  for (const locale of locales) {
    const msgPath = path.join(localesDir, locale, 'messages.json');
    if (fs.existsSync(msgPath)) {
      const msgs = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
      if (!msgs[key]) {
        console.log(`Translating for ${locale}...`);
        const translated =
          locale === 'en_US' ? text : await translateText(text, locale);

        msgs[key] = { message: translated };

        fs.writeFileSync(msgPath, JSON.stringify(msgs, null, 2) + '\n');
      } else {
        console.log(`Key '${key}' already exists in ${locale}, skipping.`);
      }
    }
  }
  console.log('Finished translating all locales!');
}

run();
