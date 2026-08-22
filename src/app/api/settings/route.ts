import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/d1';
import { systemSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

const DEFAULT_SETTINGS = {
  id: 'global_config',
  vehiclePrices: { fiveTon: 300000, twoHalfTon: 200000, oneTon: 150000 },
  workerPrices: { male: 200000, female: 150000 },
};

export async function GET(req: NextRequest) {
  try {
    // @ts-ignore
    const d1 = process.env.DB;
    
    if (!d1) {
      console.warn('D1 DB not found in environment, returning defaults.');
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const db = drizzle(d1);
    let record = await db.select().from(systemSettings).where(eq(systemSettings.id, 'global_config')).get();

    if (!record) {
      record = {
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString()
      };
      await db.insert(systemSettings).values(record).run();
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: NextRequest) {
  try {
    // @ts-ignore
    const d1 = process.env.DB;
    
    if (!d1) {
      return NextResponse.json({ error: 'DB configuration missing' }, { status: 500 });
    }

    const body = await req.json();
    const db = drizzle(d1);

    const record = {
      id: 'global_config',
      vehiclePrices: body.vehiclePrices,
      workerPrices: body.workerPrices,
      updatedAt: new Date().toISOString()
    };

    const result = await db.update(systemSettings)
      .set(record)
      .where(eq(systemSettings.id, 'global_config'))
      .run();

    if (result.meta.changes === 0) {
      await db.insert(systemSettings).values(record).run();
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
