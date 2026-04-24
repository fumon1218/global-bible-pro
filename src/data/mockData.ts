export const BOOKS = [
  { id: 'GEN', name: '창세기', chapters: 50 },
  { id: 'EXO', name: '출애굽기', chapters: 40 },
  // ... more
];

export const BIBLE_VERSIONS = [
  { id: 'KRV', name: '개역한글', lang: 'ko' },
  { id: 'KJV', name: 'KJV', lang: 'en' },
  { id: 'JOU', name: '口語訳', lang: 'ja' },
];

export const MOCK_BIBLE_DATA: any = {
  'KRV': {
    'GEN': {
      1: [
        { v: 1, t: '태초에 하나님이 천지를 창조하시니라' },
        { v: 2, t: '땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 신은 수면에 운행하시니라' },
        { v: 3, t: '하나님이 가라사대 빛이 있으라 하시매 빛이 있었고' },
      ]
    }
  },
  'KJV': {
    'GEN': {
      1: [
        { v: 1, t: 'In the beginning God created the heaven and the earth.' },
        { v: 2, t: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
        { v: 3, t: 'And God said, Let there be light: and there was light.' },
      ]
    }
  },
  'JOU': {
    'GEN': {
      1: [
        { v: 1, t: '<ruby>始<rt>はじ</rt></ruby>めに<ruby>神<rt>かみ</rt></ruby>は<ruby>天<rt>てん</rt></ruby>と<ruby>地<rt>ち</rt></ruby>とを<ruby>創造<rt>そうぞう</rt></ruby>された。' },
        { v: 2, t: '<ruby>地<rt>ち</rt></ruby>은<ruby>形<rt>かたち</rt></ruby>なく、むなしく、やみが<ruby>淵<rt>ふち</rt></ruby>の<ruby>面<rt>おもて</rt></ruby>にあり、<ruby>神<rt>か미</rt></ruby>の<ruby>霊<rt>れい</rt></ruby>が<ruby>水<rt>みず</rt></ruby>の<ruby>面<rt>おもて</rt></ruby>をはおっていた。' },
        { v: 3, t: '<ruby>神<rt>かみ</rt></ruby>は「<ruby>光<rt>ひかり</rt></ruby>あれ」と<ruby>言<rt>い</rt></ruby>われた。すると<ruby>光<rt>ひかり</rt></ruby>があった。' },
      ]
    }
  }
};
