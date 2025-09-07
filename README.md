# MCP Resume Server + Next.js Playground

This monorepo includes:
- **MCP server** (WebSocket JSON-RPC) that parses your resume and answers questions, plus a REST fallback.
- **Email sending** via SMTP (or NO_EMAIL=true for dry-run).
- **Next.js playground** to chat and send emails.

## Quick Start (Local)

```bash
# 1) Install deps
npm install

# 2) Copy sample envs
cp apps/mcp-server/.env.example apps/mcp-server/.env
cp apps/next-playground/.env.example apps/next-playground/.env

# 3) Put your resume file at apps/mcp-server/data/Resume_sasni.md
+ # This is already set in .env as the default

# 4) Run server
npm run dev:server

# 5) In a second terminal, run the web app
npm run dev:web
```

Open http://localhost:3000

## REST Endpoints
- `POST /api/chat` `{ "question": "What was my last role?" }`
- `POST /api/email` `{ "to":"x@y.com","subject":"Hi","body":"Hello" }`
- `GET /health`

## MCP WebSocket
Connect to `ws://localhost:8080/mcp` and send JSON-RPC requests:
- `ask_cv` with params `{ "question": "..." }`
- `send_email` with params `{ "to":"...","subject":"...","body":"..." }`

## Deploy
- **Server**: Use Render with `render.yaml` or your favorite Node host.
- **Web**: Vercel/Netlify/Render. Set `NEXT_PUBLIC_API_BASE` to your server URL.

## Gmail SMTP Setup (Direct Inbox Delivery)

To send emails directly to Gmail inboxes, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

3. **Set Environment Variables** in `apps/mcp-server/.env`:
   ```bash
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

4. **For testing without sending emails**, set:
   ```bash
   NO_EMAIL=true
   ```

### Email Delivery Features:
- **Direct Gmail Delivery**: Emails are sent through Gmail's SMTP server
- **Inbox Delivery**: Optimized settings ensure emails reach the recipient's inbox
- **Professional Headers**: Proper email headers for better deliverability
- **Connection Verification**: Automatic verification of Gmail credentials before sending
- **Rate Limiting**: Built-in rate limiting to prevent spam detection

## Notes
- The email functionality now uses Gmail SMTP by default
- Emails are sent with HTML formatting and your website's theme colors
- For safe testing set `NO_EMAIL=true` to log instead of sending
