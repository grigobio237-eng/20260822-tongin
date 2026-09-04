export type RoomCategory = '방 1' | '방 2' | '방 3' | '방 4' | '방 5' | '거실' | '주방' | '베란다';

export interface ItemVariant {
  name: string;
  cbm: number;
  isDefault?: boolean;
}

export interface MasterItem {
  name: string;
  variants: ItemVariant[];
}

// 공통 규격 생성 유틸 (소형/기본/대형)
const createStandardVariants = (small: number, normal: number, large: number): ItemVariant[] => [
  { name: '소형', cbm: small },
  { name: '일반 (기본)', cbm: normal, isDefault: true },
  { name: '대형', cbm: large },
];

export const ROOM_ITEMS: MasterItem[] = [
  {
    name: '장롱',
    variants: [
      { name: '8자 (2통)', cbm: 3.6 },
      { name: '10자 (3통, 기본)', cbm: 4.5, isDefault: true },
      { name: '12자 (4통)', cbm: 5.4 },
      { name: '슬라이딩/붙박이', cbm: 5.0 },
    ]
  },
  {
    name: '시스템장',
    variants: [
      { name: '소형 (1~2칸)', cbm: 1.0 },
      { name: '일반 (기본, 3칸)', cbm: 2.0, isDefault: true },
      { name: '대형 (4칸 이상)', cbm: 3.5 },
    ]
  },
  { name: '옷', variants: createStandardVariants(0.1, 0.2, 0.4) },
  { name: '이불', variants: createStandardVariants(0.1, 0.2, 0.4) },
  {
    name: '화장대',
    variants: [
      { name: '콘솔형(슬림)', cbm: 0.3 },
      { name: '일반 수납형 (기본)', cbm: 0.5, isDefault: true },
      { name: '의자/거울 일체형', cbm: 0.7 },
    ]
  },
  {
    name: '침대(W)',
    variants: [
      { name: '싱글/슈퍼싱글(SS)', cbm: 0.9 },
      { name: '퀸(Q, 기본)', cbm: 1.3, isDefault: true },
      { name: '킹/라지킹(K/LK)', cbm: 1.6 },
      { name: '패밀리/모션베드', cbm: 2.2 },
    ]
  },
  { name: '문갑', variants: createStandardVariants(0.1, 0.2, 0.3) },
  { name: '협탁', variants: createStandardVariants(0.1, 0.2, 0.3) },
  {
    name: '책상',
    variants: [
      { name: '1인용/독서실 (~1200mm)', cbm: 0.5 },
      { name: '일반 사무/컴퓨터 (기본)', cbm: 0.8, isDefault: true },
      { name: 'L자형/모션데스크 (1800mm~)', cbm: 1.2 },
    ]
  },
  {
    name: '의자',
    variants: [
      { name: '스툴/간이', cbm: 0.1 },
      { name: '일반 의자 (기본)', cbm: 0.2, isDefault: true },
      { name: '중역용/게이밍', cbm: 0.3 },
    ]
  },
  {
    name: '책장',
    variants: [
      { name: '3단/슬림형', cbm: 0.35 },
      { name: '5단 일반 (기본)', cbm: 0.6, isDefault: true },
      { name: '전면/슬라이딩 대형', cbm: 1.1 },
    ]
  },
  { name: '책꽂이', variants: createStandardVariants(0.1, 0.2, 0.3) },
  {
    name: '서랍장',
    variants: [
      { name: '3단/소형', cbm: 0.35 },
      { name: '5단/광폭 (기본)', cbm: 0.55, isDefault: true },
      { name: '와이드 6~8단', cbm: 0.85 },
    ]
  },
  {
    name: 'TV',
    variants: [
      { name: '50인치 이하', cbm: 0.2 },
      { name: '65~75인치 (기본)', cbm: 0.4, isDefault: true },
      { name: '85인치 이상 / 벽걸이', cbm: 0.7 },
    ]
  },
  { name: 'TV받침대', variants: createStandardVariants(0.3, 0.6, 1.0) },
  {
    name: '장식장',
    variants: [
      { name: '소형', cbm: 0.3 },
      { name: '일반 확장형 (기본)', cbm: 0.6, isDefault: true },
      { name: '대리석/전면장', cbm: 1.5 },
    ]
  },
  {
    name: '컴퓨터',
    variants: [
      { name: '본체+모니터 (기본)', cbm: 0.2, isDefault: true },
      { name: '듀얼모니터/풀세트', cbm: 0.4 },
    ]
  },
  {
    name: '에어컨',
    variants: [
      { name: '벽걸이형', cbm: 0.2 },
      { name: '스탠드형 (기본)', cbm: 0.5, isDefault: true },
      { name: '2in1 (스탠드+벽걸이)', cbm: 1.1 },
    ]
  },
];

export const LIVING_ROOM_ITEMS: MasterItem[] = [
  {
    name: '쇼파',
    variants: [
      { name: '1인용 / 리클라이너 1인', cbm: 0.5 },
      { name: '3인용 (기본)', cbm: 1.2, isDefault: true },
      { name: '4인용 카우치/코너형', cbm: 1.8 },
      { name: '리클라이너 4인 / 패밀리', cbm: 2.4 },
    ]
  },
  { name: '테이블', variants: createStandardVariants(0.2, 0.5, 0.8) },
  { name: '오디오', variants: createStandardVariants(0.1, 0.3, 0.5) },
  { name: '홈시어터', variants: createStandardVariants(0.1, 0.4, 0.8) },
  { name: '거실장', variants: createStandardVariants(0.3, 0.8, 1.5) },
  { name: '장식장', variants: ROOM_ITEMS.find(i => i.name === '장식장')!.variants },
  { name: '수족관', variants: createStandardVariants(0.3, 0.6, 1.5) },
  {
    name: '피아노',
    variants: [
      { name: '콘솔/디지털', cbm: 1.0 },
      { name: '일반/업라이트 (기본)', cbm: 2.0, isDefault: true },
      { name: '그랜드 피아노', cbm: 4.0 },
    ]
  },
  {
    name: '운동기구',
    variants: [
      { name: '실내자전거/소형', cbm: 0.4 },
      { name: '런닝머신 (기본)', cbm: 0.8, isDefault: true },
      { name: '대형 홈짐', cbm: 1.5 },
    ]
  },
  { name: '에어컨', variants: ROOM_ITEMS.find(i => i.name === '에어컨')!.variants },
  { name: '안마기', variants: createStandardVariants(0.5, 1.0, 1.5) },
  { name: 'TV', variants: ROOM_ITEMS.find(i => i.name === 'TV')!.variants },
  { name: 'TV받침대', variants: ROOM_ITEMS.find(i => i.name === 'TV받침대')!.variants },
];

export const KITCHEN_ITEMS: MasterItem[] = [
  {
    name: '식탁',
    variants: [
      { name: '2인용', cbm: 0.4 },
      { name: '4인용 (의자 포함, 기본)', cbm: 0.8, isDefault: true },
      { name: '6인용 / 8인용 대형', cbm: 1.3 },
    ]
  },
  { name: '의자', variants: ROOM_ITEMS.find(i => i.name === '의자')!.variants },
  { name: '장식장', variants: ROOM_ITEMS.find(i => i.name === '장식장')!.variants },
  { name: '그릇류', variants: createStandardVariants(0.1, 0.3, 0.6) },
  {
    name: '냉장고',
    variants: [
      { name: '일반 2도어 (~500L)', cbm: 1.2 },
      { name: '4도어/양문형 (기본)', cbm: 1.6, isDefault: true },
      { name: '비스포크/오브제 4도어', cbm: 1.8 },
    ]
  },
  {
    name: '김치냉장고',
    variants: [
      { name: '1도어/소형', cbm: 0.4 },
      { name: '뚜껑식 2룸', cbm: 0.7 },
      { name: '스탠드형 4룸 (기본)', cbm: 1.1, isDefault: true },
    ]
  },
  { name: '가스렌지/인덕션', variants: createStandardVariants(0.05, 0.1, 0.2) },
  { name: '오븐렌지', variants: createStandardVariants(0.1, 0.2, 0.3) },
  { name: '전자레인지', variants: createStandardVariants(0.05, 0.1, 0.2) },
  {
    name: '식기세척기',
    variants: [
      { name: '6인용/소형', cbm: 0.2 },
      { name: '12인용/빌트인 (기본)', cbm: 0.5, isDefault: true },
    ]
  },
  { name: '정수기', variants: createStandardVariants(0.05, 0.1, 0.2) },
  {
    name: '세탁기',
    variants: [
      { name: '통돌이/소형', cbm: 0.6 },
      { name: '드럼 세탁기 (기본)', cbm: 0.8, isDefault: true },
      { name: '워시타워 (일체형)', cbm: 1.5 },
    ]
  },
  { name: '건조기', variants: createStandardVariants(0.4, 0.8, 1.0) },
];

export const VERANDA_ITEMS: MasterItem[] = [
  { name: '장식장', variants: ROOM_ITEMS.find(i => i.name === '장식장')!.variants },
  { name: '앵글/선반', variants: createStandardVariants(0.2, 0.5, 0.8) },
  { name: '자전거', variants: createStandardVariants(0.2, 0.5, 0.8) },
  { name: '서랍장', variants: ROOM_ITEMS.find(i => i.name === '서랍장')!.variants },
  { name: '항아리', variants: createStandardVariants(0.1, 0.3, 0.5) },
  { name: '화분', variants: createStandardVariants(0.1, 0.2, 0.4) },
  { name: '쌀통', variants: createStandardVariants(0.05, 0.1, 0.2) },
];

export const ROOM_CATEGORIES: Record<RoomCategory, MasterItem[]> = {
  '방 1': ROOM_ITEMS,
  '방 2': ROOM_ITEMS,
  '방 3': ROOM_ITEMS,
  '방 4': ROOM_ITEMS,
  '방 5': ROOM_ITEMS,
  '거실': LIVING_ROOM_ITEMS,
  '주방': KITCHEN_ITEMS,
  '베란다': VERANDA_ITEMS,
};

export interface OptionDef {
  name: string;
  defaultPrice: number;
  isPerDay?: boolean;
}

export const OPTION_ITEMS: OptionDef[] = [
  { name: '사다리·출발지', defaultPrice: 150000 },
  { name: '사다리·도착지', defaultPrice: 150000 },
  { name: '장농/분해장농·붙박이장', defaultPrice: 50000 },
  { name: '돌침대/싱글·더블', defaultPrice: 100000 },
  { name: '금고/50cm·1m이상', defaultPrice: 50000 },
  { name: '에어컨·온풍기/탈·운반', defaultPrice: 60000 },
  { name: '피아노/일반·그랜드', defaultPrice: 150000 },
  { name: '벽걸이·대형TV/탈·부착', defaultPrice: 50000 },
  { name: '홈시어터/탈·부착', defaultPrice: 30000 },
  { name: '계단/이송작업비', defaultPrice: 50000 },
  { name: '실내보관료 (1일)', defaultPrice: 10000, isPerDay: true },
  { name: '컨테이너보관료 (1일)', defaultPrice: 8000, isPerDay: true },
  { name: '대기료 (1시간 이상 지연 시)', defaultPrice: 50000 },
];

export const PACKING_MATERIALS = ['특대박스(이불)', '대박스(옷)', '중대박스', '중박스', '소박스', '바구니', '아이스박스', '담요(대)', '담요(중)', '침대비닐커버', '냉장고', '쇼파', '침대', '분해장농', '김치냉장고(대)', '김치냉장고(중)', '세탁기', '건조기', '서랍장', '피아노', '테이프', '에어캡', '랩', 'TV(50인치이하)', 'TV(65~75인치)', 'TV(85인치이상)'];
