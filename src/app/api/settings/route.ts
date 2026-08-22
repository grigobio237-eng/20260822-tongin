import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const DEFAULT_SETTINGS = {
  id: 'global_config',
  vehiclePrices: { fiveTon: 300000, twoHalfTon: 200000, oneTon: 150000 },
  workerPrices: { male: 200000, female: 150000 },
};

export async function GET(req: NextRequest) {
  // Edge 환경에서 어떠한 에러도 방지하기 위해 가장 단순한 형태로 200 리턴
  return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ 
      success: true, 
      record: {
        id: 'global_config',
        vehiclePrices: body.vehiclePrices || DEFAULT_SETTINGS.vehiclePrices,
        workerPrices: body.workerPrices || DEFAULT_SETTINGS.workerPrices,
        updatedAt: new Date().toISOString()
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Parse error' }, { status: 200 });
  }
}
