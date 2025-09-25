# BrainBloom - Digital Garden Note-Taking App

## Project Overview
- **Type**: Next.js React Application with TypeScript
- **Purpose**: A beautiful note-taking app called "BrainBloom" with organic design and fluid interactions
- **Status**: Successfully imported and configured for Replit environment

## Technology Stack
- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **UI Components**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom animations
- **Fonts**: Lexend, Lora, and Geist Mono
- **Analytics**: Vercel Analytics
- **Package Manager**: npm (converted from pnpm)
- **Database**: Supabase (configured with development defaults)

## Project Structure
- `app/` - Next.js app directory with layout, page, and global styles
- `components/` - React components including UI components and feature modules
- `hooks/` - Custom React hooks (e.g., use-notes.ts)
- `lib/` - Utility functions
- `public/` - Static assets and images
- `styles/` - Additional CSS files

## Key Features
- Note-taking system with rich text editing
- Graph visualization of note connections
- Task management system
- Journaling functionality
- Learning system modules
- Animated search interface
- Theme support (light/dark)
- Modular screen system (notes, editor, graph, modules, settings, etc.)

## Configuration
- **Development Server**: Runs on port 5000 with 0.0.0.0 binding for Replit
- **Next.js Config**: Secure headers, unoptimized images, and proper Content-Security-Policy for iframe embedding
- **Deployment**: Configured for autoscale deployment with build and start scripts

## Development Workflow
- Primary workflow: "Development Server" runs `npm run dev -- --hostname 0.0.0.0 --port 5000`
- Hot reload and Fast Refresh enabled
- TypeScript compilation with some build error tolerance

## Recent Changes (September 25, 2025)
- **Fresh GitHub import setup completed for Replit environment**:
  - Installed all npm dependencies (252 packages) including Next.js 15.2.4
  - Resolved React 19 compatibility issues with legacy peer deps flag
  - Maintained existing Supabase integration with development defaults
  - Fixed cross-origin request issues by adding *.janeway.replit.dev to allowedDevOrigins
- **Next.js configuration optimized for Replit**:
  - Updated allowedDevOrigins to include current Replit domain patterns
  - Maintained proper Content-Security-Policy headers for iframe embedding
  - Configured host binding to 0.0.0.0:5000 for Replit proxy compatibility
  - Kept unoptimized images for development environment
- **Development workflow fully operational**:
  - Development server running successfully on port 5000
  - Application compiling with 2367 modules
  - Hot reload and Fast Refresh working properly
  - Cross-origin warnings resolved
- **Production deployment configured**:
  - Set up autoscale deployment target for stateless web app
  - Configured build process with npm run build
  - Set production start command with npm start
- **Application status - fully functional**:
  - Server responding with 200 status codes
  - Supabase integration working with development defaults
  - Vercel Analytics configured for development mode
  - Ready for immediate use and further development

## User Preferences
- Project follows existing code conventions and structure
- Uses the original v0.app design and component architecture
- Maintains soft UI design aesthetics with organic feel
