# Semi-Autonomous Website Builder Platform

A comprehensive web application that automates website analysis, rebuilding, and deployment using AI-powered automation and intelligent workflows.

## Overview

The Website Builder Platform enables users to analyze existing websites, identify improvement opportunities, and rebuild them with AI-driven enhancements. It also supports creating entirely new websites from natural language prompts. The platform handles the complete workflow from domain analysis through final deployment to customer-owned domains.

## Key Features

### 1. Website Analysis & Scraping
- **Domain Input**: Enter any website URL for analysis
- **Section Extraction**: Automatically extracts key sections (header, hero, features, testimonials, footer)
- **Content Scraping**: Intelligent parsing of website structure and content
- **Metadata Collection**: Captures language, charset, and other technical metadata

### 2. AI-Powered Analysis
- **Strengths Identification**: Recognizes what's working well on the site
- **Weakness Detection**: Identifies areas needing improvement
- **Improvement Suggestions**: Provides actionable recommendations
- **Quality Scoring**: Generates 0-10 quality score with sentiment analysis
- **Business Review Integration**: Scrapes and analyzes customer reviews from Google Places API

### 3. Intelligent Rebuilding
- **Drag-and-Drop Builder**: Select and reorder website sections
- **AI Enhancement**: Rebuilds sections with improvements based on analysis
- **HTML/CSS Generation**: Creates production-ready code
- **Responsive Design**: Ensures mobile and desktop compatibility

### 4. Preview & Approval System
- **Live Preview**: Full-page preview of rebuilt website
- **Email Sharing**: Send preview links to stakeholders
- **Approval Workflow**: Multi-step review before launch
- **Preview Tracking**: Monitor access and engagement

### 5. Domain Launch System
- **Temporary Domains**: Test websites before production launch
- **Custom Domain Support**: Launch to customer-owned domains
- **DNS Management**: Provides DNS records for domain setup
- **Deployment Automation**: One-click launch to production

### 6. AI-Powered Generation
- **Prompt-Based Creation**: Generate sites from natural language descriptions
- **Industry Templates**: Tailored designs for different business types
- **Style Selection**: Choose from multiple design styles
- **Customization**: Full control over generated content

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Tailwind CSS 4** - Styling and responsive design
- **Wouter** - Lightweight routing
- **tRPC** - Type-safe API communication
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Express 4** - Web server
- **tRPC 11** - RPC framework with full type safety
- **Drizzle ORM** - Database abstraction
- **Cheerio** - HTML parsing and scraping
- **LLM Integration** - AI-powered analysis and generation

### Database
- **MySQL/TiDB** - Primary data store
- **Tables**: projects, analyses, sections, reviews, previews, customerDomains, emailNotifications, generationPrompts

### Infrastructure
- **Manus OAuth** - Authentication
- **S3 Storage** - File and asset storage
- **Email System** - Notification delivery
- **Google Places API** - Business review integration

## Project Structure

```
client/
  src/
    pages/
      Home.tsx              - Landing page
      Dashboard.tsx         - Project dashboard
      Rebuild.tsx          - Domain input form
      Generate.tsx         - AI prompt interface
      ProjectAnalysis.tsx   - Analysis dashboard
      ProjectPreview.tsx    - Preview & approval
      ProjectLaunch.tsx     - Domain launch
      Preview.tsx          - Public preview viewer
    components/
      SectionBuilder.tsx    - Drag-and-drop section manager
    lib/
      trpc.ts             - tRPC client configuration
    App.tsx               - Route definitions

server/
  routers/
    projects.ts           - Project management APIs
    deployment.ts         - Preview and launch APIs
  services/
    scraper.ts           - Website scraping service
    analyzer.ts          - AI analysis service
    siteGenerator.ts     - Site generation service
    reviewScraper.ts     - Review scraping service
  db.ts                  - Database helpers
  routers.ts             - Main router configuration

drizzle/
  schema.ts              - Database schema definitions
  migrations/            - Database migrations
```

## API Endpoints

### Projects Router (`/api/trpc/projects.*`)

**create** - Create a new project
```typescript
Input: { title, description?, sourceUrl?, projectType }
Output: Project
```

**get** - Retrieve a project
```typescript
Input: { projectId }
Output: Project with full details
```

**list** - List user's projects
```typescript
Output: Project[]
```

**analyzeWebsite** - Analyze a website
```typescript
Input: { projectId, sourceUrl }
Output: { success, analysis }
```

**buildWebsite** - Build improved website
```typescript
Input: { projectId, selectedSections? }
Output: { success, previewUrl }
```

**getAnalysis** - Get analysis results
```typescript
Input: { projectId }
Output: Analysis
```

**getSections** - Get extracted sections
```typescript
Input: { projectId }
Output: Section[]
```

**getReviews** - Get business reviews
```typescript
Input: { projectId }
Output: Review[]
```

**updateSection** - Update section selection/order
```typescript
Input: { projectId, sectionId, included?, order? }
Output: { success }
```

**approve** - Approve project for launch
```typescript
Input: { projectId }
Output: { success }
```

**generateFromPrompt** - Generate site from prompt
```typescript
Input: { projectId, prompt, industry?, style? }
Output: { success, previewUrl }
```

### Deployment Router (`/api/trpc/deployment.*`)

**getPublicPreview** - Get public preview (no auth required)
```typescript
Input: { token }
Output: { html, expiresAt }
```

**sendPreviewEmail** - Send preview link via email
```typescript
Input: { projectId, recipientEmail, subject? }
Output: { success, emailId }
```

**createDomain** - Create temporary domain
```typescript
Input: { projectId }
Output: { domain, deploymentUrl }
```

**verifyDomain** - Verify custom domain
```typescript
Input: { projectId, customDomain }
Output: { success, dnsRecords }
```

**launchWebsite** - Launch to custom domain
```typescript
Input: { projectId, customDomain }
Output: { success, deploymentUrl }
```

**getDomain** - Get domain information
```typescript
Input: { projectId }
Output: Domain
```

## Workflow Examples

### Rebuild Existing Website
1. User navigates to Dashboard
2. Clicks "Rebuild Existing Site"
3. Enters domain URL (e.g., example.com)
4. System analyzes website and extracts sections
5. Analysis dashboard shows strengths, weaknesses, improvements
6. User reviews and selects sections to include
7. AI rebuilds selected sections with improvements
8. Preview page displays rebuilt website
9. User sends preview to stakeholders via email
10. After approval, launches to temporary domain for testing
11. Launches to customer's custom domain

### Generate New Website
1. User clicks "Generate New Site"
2. Enters business description and preferences
3. Selects industry and design style
4. AI generates complete website
5. Preview page displays generated site
6. User can customize and refine
7. After approval, launches to temporary domain
8. Launches to customer's custom domain

## Database Schema

### Projects Table
Stores project metadata and workflow status

### Analyses Table
Contains AI analysis results with scores and recommendations

### Sections Table
Manages extracted website sections with content and HTML

### Reviews Table
Stores business reviews from Google Places API

### Previews Table
Tracks temporary preview URLs with expiration and access logs

### CustomerDomains Table
Manages domain deployment and verification status

### EmailNotifications Table
Logs email sends for tracking and engagement

### GenerationPrompts Table
Stores AI generation prompts and parameters

## Authentication

The platform uses **Manus OAuth** for authentication. All protected endpoints require a valid user session. The authentication flow is handled automatically by the framework.

## Environment Variables

Required environment variables (automatically injected):
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth application ID
- `OAUTH_SERVER_URL` - OAuth backend URL
- `VITE_OAUTH_PORTAL_URL` - OAuth login portal
- `BUILT_IN_FORGE_API_URL` - Manus API endpoint
- `BUILT_IN_FORGE_API_KEY` - Manus API key

## Testing

Run the test suite:
```bash
pnpm test
```

Tests include:
- Authentication flow validation
- Project CRUD operations
- Website analysis accuracy
- API error handling
- Database transactions

## Deployment

The platform is ready for deployment to Manus hosting:

1. Ensure all tests pass: `pnpm test`
2. Build the project: `pnpm build`
3. Create a checkpoint: Use the Management UI
4. Click Publish in the Management UI

The platform will be deployed to a Manus-managed domain with automatic scaling and SSL.

## Performance Considerations

- **Caching**: Analysis results are cached to reduce API calls
- **Lazy Loading**: Frontend components load on demand
- **Database Indexing**: Optimized queries on frequently accessed tables
- **CDN Assets**: Static assets served from CDN
- **Async Operations**: Long-running tasks handled asynchronously

## Security Features

- **OAuth Authentication**: Secure user authentication
- **Session Management**: Secure cookie-based sessions
- **Input Validation**: All inputs validated with Zod schemas
- **Database Security**: Parameterized queries prevent SQL injection
- **HTTPS Only**: All communications encrypted
- **CORS Protection**: Proper CORS headers configured

## Error Handling

The platform includes comprehensive error handling:
- User-friendly error messages
- Toast notifications for feedback
- Graceful degradation for failed operations
- Detailed server-side logging
- Retry mechanisms for transient failures

## Future Enhancements

Potential improvements for future versions:
- Multi-language support
- Advanced analytics dashboard
- A/B testing framework
- Batch processing for multiple sites
- Custom domain SSL certificates
- Advanced SEO optimization
- Content management system integration
- API for third-party integrations

## Support & Documentation

For detailed API documentation, refer to the inline code comments and tRPC type definitions. The type system provides full IDE support and autocomplete for all API calls.

## License

MIT License - See LICENSE file for details
