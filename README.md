# Lawyer-Side Legal Consultation Application

A comprehensive, production-ready web application designed for lawyers to manage their legal practice, communicate with clients, track cases, and handle payments efficiently.

## Features

- **Professional Landing Page** with sign-up/sign-in
- **Multi-step Lawyer Registration** with document verification
- **Comprehensive Dashboard** with key metrics and quick actions
- **Advanced Case Management** with search, filters, and detailed views
- **Secure Messaging System** with real-time updates
- **Payment Tracking** with Razorpay integration support
- **Case Progress Tracking** with timeline visualization
- **Notifications System** with real-time updates
- **Help & Support** with searchable FAQ
- **Responsive Design** optimized for all devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**:  SQL
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+ installed
- 

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lawyer-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the database migration (see Database Setup below)
   - Create storage bucket named `lawyer-documents`
   - Add folders: `id-proofs`, `enrollment-certificates`, `case-docs`

5. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the migration SQL from the migration that was applied during development
4. Execute the SQL to create all tables and policies

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── cases/           # Case management components
│   ├── messages/        # Messaging components
│   ├── payments/        # Payment components
│   ├── notifications/   # Notifications components
│   └── help/            # Help & support components
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                 # Library configurations
│   ├── supabase.ts      # Supabase client
│   └── database.types.ts # TypeScript types
├── pages/               # Page components
│   └── LandingPage.tsx  # Landing page
├── utils/               # Utility functions
│   └── constants.ts     # App constants
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Key Components

### Authentication Flow
1. User lands on landing page
2. Can sign up or sign in
3. After sign up, redirected to registration form
4. After registration, verification pending screen
5. Once verified, access to full dashboard

### Case Management
- View all cases with search and filters
- Accept or reject case requests
- View detailed case information
- Track case progress with timeline
- Upload and manage documents
- Communicate with clients

### Messaging
- Real-time chat with clients
- Conversation history
- Read receipts
- File sharing support

### Payments
- Track all payments
- View earnings statistics
- Filter by payment status
- Download invoices

## Database Tables

- `lawyer_profiles` - Lawyer information and verification
- `cases` - Case details and status
- `case_documents` - Document storage references
- `case_timeline` - Case progress milestones
- `chat_messages` - Secure messaging
- `appointments` - Scheduling
- `payments` - Payment tracking
- `notifications` - Notification management
- `availability_schedule` - Lawyer availability
- `blocked_dates` - Leave management

All tables have Row-Level Security (RLS) enabled.

## Security

- Row-Level Security on all database tables
- JWT-based authentication
- Secure session management
- Data isolation between users
- Input validation
- HTTPS recommended for production

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Documentation

- [System Documentation](./SYSTEM_DOCUMENTATION.md) - Complete system architecture and features
- [API Reference](./API_REFERENCE.md) - Detailed API endpoints and data models

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Recommended Platforms

- **Vercel** (Recommended)
- Netlify
- AWS Amplify
- Cloudflare Pages

### Deployment Steps (Vercel)

1. Connect your Git repository
2. Set environment variables in Vercel dashboard
3. Deploy
4. Configure custom domain (optional)

## Testing

To test the application:

1. Create a Supabase account
2. Set up the database
3. Create a test lawyer account
4. For full testing, you'll need a client app to create cases

To test verification status:
- Update `verification_status` in `lawyer_profiles` table to `'verified'` manually

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and anon key
- Check if your IP is allowed in Supabase settings
- Ensure database is not paused

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check TypeScript errors: `npm run typecheck`

### Real-time Not Working
- Check Supabase project status
- Verify RLS policies are correct
- Check browser console for WebSocket errors

## Performance Optimization

- Code splitting with React.lazy()
- Image optimization
- Lazy loading of components
- Proper use of React.memo()
- Debounced search inputs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the [Help & Support](./SYSTEM_DOCUMENTATION.md#9-help--support-section) section
- Review [API Reference](./API_REFERENCE.md)
- Contact support team

## License

Copyright © 2024. All rights reserved.

## Acknowledgments

- React Team
- Supabase Team
- Tailwind CSS Team
- Lucide Icons Team

---

**Note**: This application is designed to work alongside a client-side application. Both applications share the same Supabase database and real-time features enable seamless communication between lawyers and clients.
