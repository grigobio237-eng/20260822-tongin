import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const DEFAULT_SETTINGS = {
  id: 'global_config',
  vehiclePrices: { fiveTon: 300000, twoHalfTon: 200000, oneTon: 150000 },
  workerPrices: { male: 200000, female: 150000 },
};

export async function GET(req: NextRequest) {
  try {
    const d1 = process.env.DB as any;
    
    if (!d1) {
      console.warn('D1 DB not found in environment, returning defaults.');
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    // Use raw D1 query to avoid Drizzle edge issues
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

      return NextResponse.json(record);
    }

    const record = results[0];
    return NextResponse.json({
      id: record.id,
      vehiclePrices: typeof record.vehicle_prices === 'string' ? JSON.parse(record.vehicle_prices) : record.vehicle_prices,
      workerPrices: typeof record.worker_prices === 'string' ? JSON.parse(record.worker_prices) : record.worker_prices,
      updatedAt: record.updated_at
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const d1 = process.env.DB as any;
    
    if (!d1) {
      return NextResponse.json({ error: 'DB configuration missing' }, { status: 500 });
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

    if (result.meta.changes === 0) {
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
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
