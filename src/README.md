# Mock API Platform

A powerful Mock API Platform where developers can easily create and manage API endpoints to unblock frontend development while waiting for backend APIs to be ready.

## Features

- 🚀 **Instant Mock APIs**: Create REST API endpoints in seconds
- 🔄 **Path-Based Routing**: Clean URLs using endpoint paths (e.g., `/users`, `/posts/1`)
- ⚡ **Simulated Delays**: Add response delays to test loading states
- 🔐 **Optional Authentication**: Require custom auth tokens for protected endpoints
- 📊 **Real-Time Analytics**: Track API usage, method distribution, and success rates
- 🎨 **Custom Responses**: Define any JSON response with custom status codes
- 🌙 **Dark Mode**: Beautiful UI with dark mode support

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Supabase account (free tier works great!)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mock-api-platform
   ```

2. **Set up Supabase Project**

   - Go to [supabase.com](https://supabase.com) and create a new project
   - Once created, go to **Project Settings** → **API**
   - Copy the following values:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **Anon/Public Key** (starts with `eyJhb...`)
     - **Service Role Key** (starts with `eyJhb...`)

3. **Configure Environment Variables**

   Create a `.env` file or set the environment variables in your Supabase project:

   ```env
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Deploy the Edge Function**

   Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

   Login to Supabase:
   ```bash
   supabase login
   ```

   Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

   Deploy the function:
   ```bash
   supabase functions deploy make-server-ade39ab0
   ```

5. **Update the project info file**

   Edit `/utils/supabase/info.tsx` with your Supabase credentials:
   ```typescript
   export const projectId = 'your-project-id';
   export const publicAnonKey = 'your-anon-key';
   ```

6. **Install and run**
   ```bash
   npm install
   npm run dev
   ```

## Setting Up Social Authentication (Optional)

### GitHub Authentication

1. Go to [GitHub Settings](https://github.com/settings/developers) → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Mock API Platform
   - **Homepage URL**: `http://localhost:5173` (or your production URL)
   - **Authorization callback URL**: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**
5. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **GitHub**
   - Paste your Client ID and Client Secret
   - Save

### Google Authentication

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:5173`, `https://your-domain.com`
   - **Authorized redirect URIs**: `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copy the **Client ID** and **Client Secret**
7. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Paste your Client ID and Client Secret
   - Save

For detailed instructions, visit:
- [GitHub OAuth](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Usage

### Creating a Mock Endpoint

1. **Sign in** to your account
2. Go to **Dashboard** → **Create Endpoint**
3. Fill in the form:
   - **Name**: Descriptive name (e.g., "Get Users")
   - **HTTP Method**: GET, POST, PUT, PATCH, or DELETE
   - **Path**: Your endpoint path (e.g., `/users`)
   - **Response Body**: JSON response data
   - **Status Code**: HTTP status code (default: 200)
   - **Delay** (optional): Simulate network latency (0-10000ms)
   - **Authentication** (optional): Require X-Auth-Token header

4. Click **Create Endpoint**

### Calling Your Mock API

All requests require the **public anon key** in the Authorization header:

```javascript
fetch('https://your-project.supabase.co/functions/v1/make-server-ade39ab0/users', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-public-anon-key'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Note**: The public anon key is safe to share and include in frontend code.

### With Authentication Enabled

If you enabled authentication on your endpoint:

```javascript
fetch('https://your-project.supabase.co/functions/v1/make-server-ade39ab0/protected', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-public-anon-key',
    'X-Auth-Token': 'your-endpoint-auth-token'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno + Hono)
- **Database**: Supabase Key-Value Store
- **Authentication**: Supabase Auth (Email, GitHub, Google)
- **Hosting**: Supabase Edge Functions

## Key Files

- `/App.tsx` - Main application component
- `/supabase/functions/server/index.tsx` - Edge function server
- `/utils/api.tsx` - API client functions
- `/pages/dashboard/` - Dashboard pages
- `/components/` - Reusable UI components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@yourplatform.com (update with your email)

## Roadmap

- [ ] Webhook support
- [ ] Request history and logs
- [ ] Team collaboration features
- [ ] API versioning
- [ ] Custom domains
- [ ] Rate limiting controls

---

