import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const DEFAULT_SETTINGS = {
  id: 'global_config',
  vehiclePrices: { fiveTon: 300000, twoHalfTon: 200000, oneTon: 150000 },
  workerPrices: { male: 200000, female: 150000 },
};

function getD1Binding() {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.DB) {
      return process.env.DB as any;
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const d1 = getD1Binding();
    
    if (!d1 || typeof d1.prepare !== 'function') {
      return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
    }

    const { results } = await d1.prepare("SELECT * FROM system_settings WHERE id = 'global_config'").all();

    if (!results || results.length === 0) {
      const record = {
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString()
      };
      
      await d1.prepare(
        "INSERT INTO system_settings (id, vehicle_prices, worker_prices, updated_at) VALUES (?, ?, ?, ?)"
      ).bind(
        record.id,
        JSON.stringify(record.vehiclePrices),
        JSON.stringify(record.workerPrices),
        record.updatedAt
      ).run();

      return NextResponse.json(record, { status: 200 });
    }

    const record = results[0];
    let vp = DEFAULT_SETTINGS.vehiclePrices;
    let wp = DEFAULT_SETTINGS.workerPrices;
    
    try {
      vp = typeof record.vehicle_prices === 'string' ? JSON.parse(record.vehicle_prices) : (record.vehicle_prices || vp);
      wp = typeof record.worker_prices === 'string' ? JSON.parse(record.worker_prices) : (record.worker_prices || wp);
    } catch (parseError) {
      console.error('JSON parse error in settings', parseError);
    }

    return NextResponse.json({
      id: record.id,
      vehiclePrices: vp,
      workerPrices: wp,
      updatedAt: record.updated_at
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const d1 = getD1Binding();
    
    if (!d1 || typeof d1.prepare !== 'function') {
      // Return 200 so UI doesn't crash, even if DB is not attached
      return NextResponse.json({ success: true, message: 'DB not connected, only local state updated.' }, { status: 200 });
    }

    const body = await req.json();
    const updatedAt = new Date().toISOString();

    const result = await d1.prepare(
      "UPDATE system_settings SET vehicle_prices = ?, worker_prices = ?, updated_at = ? WHERE id = 'global_config'"
    ).bind(
      JSON.stringify(body.vehiclePrices),
      JSON.stringify(body.workerPrices),
      updatedAt
    ).run();

    if (!result.success || (result.meta && result.meta.changes === 0)) {
      await d1.prepare(
        "INSERT INTO system_settings (id, vehicle_prices, worker_prices, updated_at) VALUES (?, ?, ?, ?)"
      ).bind(
        'global_config',
        JSON.stringify(body.vehiclePrices),
        JSON.stringify(body.workerPrices),
        updatedAt
      ).run();
    }

    return NextResponse.json({ 
      success: true, 
      record: {
        id: 'global_config',
        vehiclePrices: body.vehiclePrices,
        workerPrices: body.workerPrices,
        updatedAt
      }
    }, { status: 200 });
  } catch (error: any) {
    // Graceful degradation for POST as well
    return NextResponse.json({ success: false, message: error.message || 'Unknown error' }, { status: 200 });
  }
}
