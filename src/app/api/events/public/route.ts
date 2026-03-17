import { NextRequest } from 'next/server';
import { db } from '@/db';
import { events } from '@/db/schema';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 submissions per hour per IP

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);
    
    if (!allowed) {
      return corsResponse(
        { error: 'Too many submissions. Please try again later.' },
        429,
        { 'X-RateLimit-Remaining': '0' }
      );
    }

    const body = await request.json();
    const {
      title,
      start_time,
      end_time,
      all_day,
      description,
      location,
      submitted_by_name,
      submitted_by_email,
      submitted_by_org,
      color,
      // Honeypot field - should be empty
      website,
      // Timestamp check - form should take at least 3 seconds to fill
      form_started_at,
    } = body;

    // Honeypot check - bots often fill all fields
    if (website) {
      // Silently reject but return success to not tip off bots
      return corsResponse({ success: true, message: 'Event submitted for review' }, 201);
    }

    // Time-based check - reject if form was filled too quickly (< 3 seconds)
    if (form_started_at) {
      const elapsed = Date.now() - parseInt(form_started_at, 10);
      if (elapsed < 3000) {
        // Too fast, likely a bot
        return corsResponse({ success: true, message: 'Event submitted for review' }, 201);
      }
    }

    // Validation
    if (!title || !start_time || !submitted_by_name || !submitted_by_email || !submitted_by_org) {
      return corsResponse(
        { error: 'Title, start time, name, email, and organization are required' },
        400
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submitted_by_email)) {
      return corsResponse({ error: 'Invalid email address' }, 400);
    }

    // Create event (always unapproved for public submissions)
    const [newEvent] = await db
      .insert(events)
      .values({
        title: title.slice(0, 200), // Limit title length
        startTime: new Date(start_time),
        endTime: end_time ? new Date(end_time) : null,
        allDay: all_day || false,
        description: description?.slice(0, 2000) || null, // Limit description
        location: location?.slice(0, 200) || null,
        submittedByUserId: `public:${submitted_by_email}`,
        submittedByName: submitted_by_name.slice(0, 100),
        submittedByOrg: submitted_by_org.slice(0, 200),
        color: color || '#00a99d',
        approved: false, // Always requires moderation
      })
      .returning();

    return corsResponse(
      { 
        success: true, 
        message: 'Event submitted for review. An administrator will review your submission.',
        id: newEvent.id,
      },
      201,
      { 'X-RateLimit-Remaining': remaining.toString() }
    );
  } catch (error) {
    console.error('Error creating public event:', error);
    return corsResponse({ error: 'Failed to submit event' }, 500);
  }
}
