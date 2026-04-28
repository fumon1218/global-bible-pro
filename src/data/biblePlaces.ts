export interface BiblePlace {
  id: string;
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  description: string;
  category: 'CITY' | 'REGION' | 'MOUNTAIN' | 'WATER';
}

export const BIBLE_PLACES: BiblePlace[] = [
  {
    id: 'jerusalem',
    name: '예루살렘',
    nameEn: 'Jerusalem',
    lat: 31.7683,
    lng: 35.2137,
    description: '이스라엘의 수도이자 다윗 성, 성전이 위치한 구속사의 중심지입니다.',
    category: 'CITY'
  },
  {
    id: 'antioch',
    name: '안디옥 (안타키아)',
    nameEn: 'Antioch',
    lat: 36.2021,
    lng: 36.1606,
    description: '그리스도인이라는 명칭이 처음 시작된 곳이며, 이방 선교의 전초기지입니다.',
    category: 'CITY'
  },
  {
    id: 'damascus',
    name: '다메섹 (다마스쿠스)',
    nameEn: 'Damascus',
    lat: 33.5138,
    lng: 36.2765,
    description: '바울이 부활하신 예수님을 만난 회심의 장소입니다.',
    category: 'CITY'
  },
  {
    id: 'ephesus',
    name: '에베소',
    nameEn: 'Ephesus',
    lat: 37.9484,
    lng: 27.3639,
    description: '소아시아의 중심 도시로, 바울이 3차 전도 여행 중 3년 동안 사역한 곳입니다.',
    category: 'CITY'
  },
  {
    id: 'athens',
    name: '아테네',
    nameEn: 'Athens',
    lat: 37.9838,
    lng: 23.7275,
    description: '바울이 아레오바고에서 철학자들에게 복음을 전했던 헬라 문화의 중심지입니다.',
    category: 'CITY'
  },
  {
    id: 'rome',
    name: '로마',
    nameEn: 'Rome',
    lat: 41.9028,
    lng: 12.4964,
    description: '바울이 복음을 전하기 원했던 제국의 심장부이자 마지막 순교지입니다.',
    category: 'CITY'
  },
  {
    id: 'nazareth',
    name: '나사렛',
    nameEn: 'Nazareth',
    lat: 32.7019,
    lng: 35.3035,
    description: '예수님이 자라나신 동네입니다.',
    category: 'CITY'
  },
  {
    id: 'capernaum',
    name: '가버나움',
    nameEn: 'Capernaum',
    lat: 32.8811,
    lng: 35.5750,
    description: '예수님의 갈릴리 사역의 중심지입니다.',
    category: 'CITY'
  }
];
