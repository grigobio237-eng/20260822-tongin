import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 1. 계약 마스터 정보
export const contracts = sqliteTable('contracts', {
  id: text('id').primaryKey(), // UUID
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  contractDate: text('contract_date').notNull(), // ISO Date
  packingDate: text('packing_date').notNull(),
  movingDate: text('moving_date').notNull(),
  
  // 출발지 정보
  departureAddress: text('departure_address').notNull(),
  departureFloor: integer('departure_floor'),
  departureConditions: text('departure_conditions'), // JSON 배열 형태 (사다리차, 계단 등)
  
  // 도착지 정보
  arrivalAddress: text('arrival_address').notNull(),
  arrivalFloor: integer('arrival_floor'),
  arrivalConditions: text('arrival_conditions'), // JSON 배열 형태
  arrivalStatus: text('arrival_status'), // e.g. 빈집, 도배대기
  
  // 이사 상세 및 작업 조건
  serviceType: text('service_type').notNull(), // 포장이사, 프리미엄이사, 보관이사 등
  totalCbm: real('total_cbm').notNull(), // 계산된 총 부피
  vehicleCount: text('vehicle_count').notNull(), // JSON 형태 (5T: 1, 2.5T: 0, 1T: 0 등)
  workerCountMale: integer('worker_count_male').notNull().default(0),
  workerCountFemale: integer('worker_count_female').notNull().default(0),
  
  // 정산 금액
  movingCost: integer('moving_cost').notNull().default(0),
  optionCost: integer('option_cost').notNull().default(0),
  totalCost: integer('total_cost').notNull().default(0), // VAT 별도 총액
  deposit: integer('deposit').notNull().default(0),
  balance: integer('balance').notNull().default(0),
  
  // 메모 및 결과물
  sttMemo: text('stt_memo'), // 음성 인식 텍스트 메모
  signatureUrl: text('signature_url'), // R2 서명 이미지 URL
  pdfUrl: text('pdf_url'), // R2 PDF 문서 URL
  
  status: text('status').notNull().default('DRAFT'), // DRAFT, COMPLETED, CANCELED
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 2. 공간별 물품 상세 내역 (실시간 CBM 계산용)
export const contractItems = sqliteTable('contract_items', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull().references(() => contracts.id, { onDelete: 'cascade' }),
  roomType: text('room_type').notNull(), // 방1, 거실, 주방, 베란다 등
  itemName: text('item_name').notNull(), // 장롱, 침대(W), 냉장고 등
  quantity: integer('quantity').notNull().default(0),
  volume: real('volume').notNull(), // 단위당 CBM (가중치)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 3. 옵션 품목 (사다리, 분해장롱 등 추가 요금 발생 항목)
export const contractOptions = sqliteTable('contract_options', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull().references(() => contracts.id, { onDelete: 'cascade' }),
  optionName: text('option_name').notNull(), // 사다리·출발지, 에어컨 탈·부착 등
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull().default(0),
  totalPrice: integer('total_price').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 4. 현장 첨부 사진 데이터 (WebP 변환 R2 업로드 연동)
export const contractImages = sqliteTable('contract_images', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull().references(() => contracts.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(), // R2 이미지 URL
  metadata: text('metadata'), // JSON 문자열 (해상도, 용량 등)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 5. 전역 설정 (단가 등)
export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey().default('global_config'),
  vehiclePrices: text('vehicle_prices', { mode: 'json' }).$type<{
    fiveTon: number;
    twoHalfTon: number;
    oneTon: number;
  }>().notNull(),
  workerPrices: text('worker_prices', { mode: 'json' }).$type<{
    male: number;
    female: number;
  }>().notNull(),
  updatedAt: text('updated_at').notNull(),
});
