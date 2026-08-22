export type RoomCategory = '방 1' | '방 2' | '방 3' | '방 4' | '방 5' | '거실' | '주방' | '베란다';

export interface ItemDef {
  name: string;
  defaultCbm: number; // 기본 부피 가중치 (CBM)
}

export const ROOM_ITEMS: ItemDef[] = [
  { name: '장롱', defaultCbm: 1.5 },
  { name: '옷/이불', defaultCbm: 0.2 },
  { name: '화장대', defaultCbm: 0.5 },
  { name: '침대(W)', defaultCbm: 1.2 },
  { name: '문갑/협탁', defaultCbm: 0.2 },
  { name: '책상/의자', defaultCbm: 0.8 },
  { name: '책장/책꽂이', defaultCbm: 0.6 },
  { name: '서랍장', defaultCbm: 0.5 },
  { name: 'TV/TV받침', defaultCbm: 0.4 },
  { name: '장식장', defaultCbm: 0.7 },
  { name: '컴퓨터', defaultCbm: 0.2 },
  { name: '에어컨', defaultCbm: 0.5 },
];

export const LIVING_ROOM_ITEMS: ItemDef[] = [
  { name: '쇼파(3인/1인)', defaultCbm: 1.5 },
  { name: '테이블', defaultCbm: 0.5 },
  { name: '오디오', defaultCbm: 0.3 },
  { name: 'TV/홈시어터', defaultCbm: 0.8 },
  { name: '거실장', defaultCbm: 0.8 },
  { name: '장식장, 수족관', defaultCbm: 1.0 },
  { name: '피아노', defaultCbm: 2.0 },
  { name: '운동기구', defaultCbm: 0.8 },
  { name: '에어컨(슬림, 벽)', defaultCbm: 0.6 },
  { name: '안마기', defaultCbm: 1.0 },
];

export const KITCHEN_ITEMS: ItemDef[] = [
  { name: '식탁/의자', defaultCbm: 1.0 },
  { name: '장식장', defaultCbm: 0.8 },
  { name: '그릇류', defaultCbm: 0.3 },
  { name: '냉장고', defaultCbm: 1.5 },
  { name: '김치냉장고', defaultCbm: 1.0 },
  { name: '가스/오븐렌지', defaultCbm: 0.3 },
  { name: '전자레인지', defaultCbm: 0.1 },
  { name: '식기세척기', defaultCbm: 0.5 },
  { name: '정수기', defaultCbm: 0.2 },
  { name: '세탁기', defaultCbm: 0.8 },
  { name: '건조기', defaultCbm: 0.8 },
];

export const VERANDA_ITEMS: ItemDef[] = [
  { name: '장식장', defaultCbm: 0.8 },
  { name: '앵글/선반', defaultCbm: 0.5 },
  { name: '자전거', defaultCbm: 0.5 },
  { name: '서랍/장식장', defaultCbm: 0.5 },
  { name: '항아리', defaultCbm: 0.3 },
  { name: '화분', defaultCbm: 0.2 },
  { name: '쌀통, 선반', defaultCbm: 0.3 },
];

export const ROOM_CATEGORIES: Record<RoomCategory, ItemDef[]> = {
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
  { name: '보관료', defaultPrice: 100000 },
];
