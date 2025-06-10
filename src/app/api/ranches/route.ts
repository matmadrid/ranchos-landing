// src/app/api/ranches/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const ranch = await prisma.ranch.create({
      data: {
        name: data.name,
        location: data.location,
        size: data.size,
        userId: data.userId, // Temporal o desde sesión
      },
    });
    
    return NextResponse.json(ranch);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating ranch' }, { status: 500 });
  }
}