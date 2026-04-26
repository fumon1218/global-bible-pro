import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ko: {
    translation: {
      "app_name": "Global Bible Journey Pro",
      "menu": {
        "reading": "성경 읽기",
        "memory": "암송 수첩",
        "tracker": "성경 읽기표",
        "search": "통합 검색",
        "settings": "환경 설정",
        "share": "친구에게 앱 공유하기"
      },
      "dashboard": {
        "title": "마이 페이지",
        "subtitle": "나의 신앙 기록을 관리합니다",
        "notes": "나의 메모",
        "highlights": "하이라이트",
        "saved": "저장된 구절",
        "login": "구글 로그인",
        "logout": "로그아웃",
        "export": "백업하기"
      },
      "reading": {
        "chapter_check": "읽기표 체크 후 다음장",
        "today_stats": "에 읽은 기록이 있음 (총 {{count}}회)",
        "commentary": "성경 주석",
        "vers_search": "말씀 검색"
      }
    }
  },
  en: {
    translation: {
      "app_name": "Global Bible Journey Pro",
      "menu": {
        "reading": "Read Bible",
        "memory": "Memory Note",
        "tracker": "Reading Tracker",
        "search": "Global Search",
        "settings": "Settings",
        "share": "Share App with Friends"
      },
      "dashboard": {
        "title": "My Page",
        "subtitle": "Manage your spiritual records",
        "notes": "My Notes",
        "highlights": "Highlights",
        "saved": "Saved Verses",
        "login": "Login with Google",
        "logout": "Logout",
        "export": "Backup Data"
      },
      "reading": {
        "chapter_check": "Check Progress & Next",
        "today_stats": "Reading history exists on (Total {{count}} times)",
        "commentary": "Bible Commentary",
        "vers_search": "Verse Search"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
