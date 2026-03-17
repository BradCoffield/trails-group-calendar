# TRAILS Community Events Calendar

A shared calendar for TRAILS library consortia members to post and discover community events. Anyone can submit events, and administrators review them before they appear on the public calendar.

---

## 📅 For Event Submitters (Non-Technical Guide)

### How to Submit an Event

1. **Go to the calendar** at your organization's calendar URL
2. **Click "Submit Event"** (green button in the top right)
3. **Fill out the form:**
   - **Title** — Name of your event
   - **Start/End Date & Time** — When it happens (end time auto-fills to 1 hour later)
   - **Location** — Where it's held
   - **Your Name & Email** — So we know who submitted it
   - **Organization** — Your library or organization name
   - **Description** — Details about the event
   - **Color** — Pick a color for the calendar display
4. **Click "Submit for Review"**

Your event will be reviewed by an administrator. Once approved, it will appear on the public calendar.

### Tips for Good Event Submissions

- Use clear, descriptive titles (e.g., "Summer Reading Kickoff Party" not just "Party")
- Include the full address in the location field
- Add a description with any details attendees need to know
- Double-check your dates and times before submitting

---

## 👩‍💼 For Administrators

### Getting Admin Access

Contact your TRAILS administrator to be granted admin privileges. They will update your account in the Clerk dashboard.

### Managing Events

1. **Sign in** at `/sign-in` with your admin account
2. **Go to Admin Panel** at `/admin`
3. You'll see three tabs:
   - **Pending** — Events waiting for approval
   - **All Events** — Every event in the system
   - **Create Event** — Add events directly (auto-approved)

### Approving Events

1. Click the **Pending** tab
2. Review each submission
3. Click **Approve** to publish it to the calendar
4. Click **Reject** to remove it (submitter is not notified)

### Editing Events

- Click **Edit** on any event to modify details
- Changes take effect immediately
- You can change the approval status of any event

### Inviting Contributors

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **Users** → **Invite User**
3. Enter their email address
4. After they sign up, optionally set their role (see Technical section)

---

## 🌐 Embedding the Calendar

The calendar is designed to be embedded in your existing website (Wix, WordPress, etc.).

### For Wix

1. Add an **Embed HTML** element to your page
2. Paste this code (replace with your actual URL):

```html
<iframe
  src="https://your-calendar-url.vercel.app"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none;"
></iframe>
```

### For WordPress

Use an HTML block or iframe plugin with the same embed code above.

---

## 🔧 Technical Documentation

### Tech Stack

| Component   | Technology                           |
| ----------- | ------------------------------------ |
| Framework   | Next.js 14+ (App Router, TypeScript) |
| Database    | Neon (serverless PostgreSQL)         |
| ORM         | Drizzle                              |
| Auth        | Clerk                                |
| Calendar UI | FullCalendar.io                      |
| Styling     | Tailwind CSS                         |

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public calendar
│   ├── submit/page.tsx       # Public event submission form
│   ├── admin/page.tsx        # Admin panel
│   ├── dashboard/page.tsx    # User dashboard
│   └── api/events/           # API routes
├── components/
│   ├── calendar/             # Calendar & modal components
│   ├── dashboard/            # EventForm, EventList
│   └── ui/                   # Shared UI components
├── db/
│   ├── index.ts              # Database connection
│   └── schema.ts             # Drizzle schema
└── lib/
    ├── auth.ts               # Role checking utilities
    └── cors.ts               # CORS helpers
```

### Environment Variables

Create `.env.local` with:

```bash
DATABASE_URL=postgresql://...          # Neon connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_... # Clerk publishable key
CLERK_SECRET_KEY=sk_...                # Clerk secret key
```

### Database Setup

```bash
# Install dependencies
npm install

# Push schema to database
npx drizzle-kit push

# Run development server
npm run dev
```

### User Roles

Set roles in Clerk Dashboard → Users → [User] → Metadata → `publicMetadata`:

```json
{ "role": "admin" }
```

| Role              | Submit           | Edit Own | Approve | Edit All | Auto-Approve |
| ----------------- | ---------------- | -------- | ------- | -------- | ------------ |
| Public (no login) | ✅ via `/submit` | ❌       | ❌      | ❌       | ❌           |
| Contributor       | ✅               | ✅       | ❌      | ❌       | ❌           |
| Admin             | ✅               | ✅       | ✅      | ✅       | ✅           |

### API Endpoints

| Method | Endpoint              | Auth     | Description                            |
| ------ | --------------------- | -------- | -------------------------------------- |
| GET    | `/api/events`         | Public   | Get approved events                    |
| POST   | `/api/events`         | Required | Submit event (auto-approves for admin) |
| POST   | `/api/events/public`  | Public   | Public submission (always pending)     |
| PUT    | `/api/events/[id]`    | Required | Update event                           |
| DELETE | `/api/events/[id]`    | Required | Delete event                           |
| GET    | `/api/events/pending` | Admin    | Get pending events                     |
| GET    | `/api/events/mine`    | Required | Get user's events                      |

### Spam Prevention (Public Form)

The public submission form (`/submit`) includes:

- **Honeypot field** — Hidden field that bots fill, humans don't
- **Time-based check** — Rejects forms filled in under 3 seconds
- **Rate limiting** — 5 submissions per hour per IP address
- **Input validation** — Length limits, email format, required fields

### Form Validation

| Field        | Rules                                 |
| ------------ | ------------------------------------- |
| Title        | Required, max 200 chars               |
| Start Date   | Required, not more than 1 day in past |
| End Date     | Must be after start time              |
| Name         | Required (public form), max 100 chars |
| Email        | Required (public form), valid format  |
| Organization | Required (public form), max 200 chars |
| Description  | Max 2000 chars                        |

### Deployment

Deploy to Vercel:

```bash
vercel
```

Or connect your GitHub repo for automatic deployments.

**Required Vercel Environment Variables:**

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

---

## 🎨 Branding

The calendar uses TRAILS brand colors:

| Color      | Hex       | Usage                        |
| ---------- | --------- | ---------------------------- |
| Lime Green | `#b5d334` | Primary buttons, headers     |
| Teal       | `#00a99d` | Default event color, accents |
| Orange     | `#f7941d` | Highlights                   |
| Cyan       | `#29abe2` | Links, secondary actions     |

---

## 📝 License

MIT
