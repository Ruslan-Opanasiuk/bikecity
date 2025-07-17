const CHAR_MAP = {
  'А': 'A', 'а': 'a',
  'Б': 'B', 'б': 'b',
  'В': 'V', 'в': 'v',
  'Г': 'H', 'г': 'h',
  'Ґ': 'G', 'ґ': 'g',
  'Д': 'D', 'д': 'd',
  'Е': 'E', 'е': 'e',
  'Ж': 'Zh', 'ж': 'zh',
  'З': 'Z', 'з': 'z',
  'И': 'Y', 'и': 'y',
  'І': 'I', 'і': 'i',
  'Й': 'Y', 'й': 'i',
  'К': 'K', 'к': 'k',
  'Л': 'L', 'л': 'l',
  'М': 'M', 'м': 'm',
  'Н': 'N', 'н': 'n',
  'О': 'O', 'о': 'o',
  'П': 'P', 'п': 'p',
  'Р': 'R', 'р': 'r',
  'С': 'S', 'с': 's',
  'Т': 'T', 'т': 't',
  'У': 'U', 'у': 'u',
  'Ф': 'F', 'ф': 'f',
  'Х': 'Kh', 'х': 'kh',
  'Ц': 'Ts', 'ц': 'ts',
  'Ч': 'Ch', 'ч': 'ch',
  'Ш': 'Sh', 'ш': 'sh',
  'Щ': 'Shch', 'щ': 'shch',
  'Ь': '',  'ь': '',
  '’': '',  'ʼ': '', "'": ''
};

export default function transliterate(text) {
  return text
    .replace(/Зг/g, 'Zgh')
    .replace(/зг/g, 'zgh')
    .split('')
    .map((ch, idx) => {
      // Position-based rules
      if (ch === 'Є') return idx === 0 ? 'Ye' : 'ie';
      if (ch === 'є') return idx === 0 ? 'ye' : 'ie';
      if (ch === 'Ю') return idx === 0 ? 'Yu' : 'iu';
      if (ch === 'ю') return idx === 0 ? 'yu' : 'iu';
      if (ch === 'Я') return idx === 0 ? 'Ya' : 'ia';
      if (ch === 'я') return idx === 0 ? 'ya' : 'ia';
      if (ch === 'Ї') return idx === 0 ? 'Yi' : 'i';
      if (ch === 'ї') return idx === 0 ? 'yi' : 'i';
      // Default mapping
      return CHAR_MAP[ch] !== undefined ? CHAR_MAP[ch] : ch;
    })
    .join('');
}
