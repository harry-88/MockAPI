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
- A Firebase project on the **Blaze** plan (Cloud Functions require it; the free
  monthly allowance covers small projects)
- Firebase CLI: `npm install -g firebase-tools`

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mock-api-platform
   ```

2. **Create a Firebase project**

   - Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project
   - Upgrade it to the **Blaze** plan (⚙️ → Usage and billing → Modify plan)
   - Enable **Firestore** (Build → Firestore Database → Create database)
   - Enable **Authentication** providers you want: Email/Password, Google, GitHub
     (Build → Authentication → Sign-in method)
   - Register a **Web app** (⚙️ → Project settings → Your apps) and copy its config

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```
   Fill `.env` with your Firebase web config values. Leave
   `VITE_FUNCTIONS_BASE_URL` for now — you'll get it after the first deploy.

4. **Deploy the backend (Cloud Function + Firestore rules)**

   ```bash
   firebase login
   # set your project id in .firebaserc, or:
   firebase use --add
   cd functions && npm install && cd ..
   firebase deploy --only functions,firestore:rules
   ```

   After deploy, copy the printed function URL (e.g.
   `https://us-central1-<project>.cloudfunctions.net/api`) into
   `VITE_FUNCTIONS_BASE_URL` in `.env`.

5. **Install and run the frontend**
   ```bash
   npm install
   npm run dev
   ```

## Setting Up Social Authentication (Optional)

Both run through Firebase Authentication (Build → Authentication → Sign-in method).
Firebase's OAuth callback URL is `https://<your-project>.firebaseapp.com/__/auth/handler`.

### Google

1. In Firebase Console → **Authentication** → **Sign-in method**, enable **Google**. That's usually all that's needed.

### GitHub

1. Create an OAuth App at [GitHub → Developer settings → OAuth Apps](https://github.com/settings/developers):
   - **Authorization callback URL**: `https://<your-project>.firebaseapp.com/__/auth/handler`
2. In Firebase Console → **Authentication** → **Sign-in method**, enable **GitHub** and paste the Client ID and Client Secret.

Add your dev/prod domains under Authentication → Settings → **Authorized domains**.
See the [Firebase Auth docs](https://firebase.google.com/docs/auth/web/start) for details.

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

Mock endpoints are public — no API key needed:

```javascript
fetch('https://us-central1-your-project.cloudfunctions.net/api/users')
  .then(res => res.json())
  .then(data => console.log(data));
```

### With Authentication Enabled

If you enabled authentication on your endpoint, send the `X-Auth-Token` header:

```javascript
fetch('https://us-central1-your-project.cloudfunctions.net/api/protected', {
  headers: {
    'X-Auth-Token': 'your-endpoint-auth-token'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Firebase Cloud Functions (Node + Express)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth (Email, GitHub, Google)

## Key Files

- `/src/App.tsx` - Main application component
- `/functions/index.js` - Cloud Function (management API + mock serving)
- `/src/utils/firebase.ts` - Firebase client init
- `/src/utils/api.tsx` - API client functions
- `/src/pages/dashboard/` - Dashboard pages
- `/src/components/` - Reusable UI components

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

