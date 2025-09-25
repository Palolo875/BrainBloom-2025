# BrainBloom - Digital Garden Note-Taking App

## Project Overview
- **Type**: Next.js React Application with TypeScript
- **Purpose**: A beautiful note-taking app called "BrainBloom" with organic design and fluid interactions
- **Status**: Successfully imported and configured for Replit environment

## Technology Stack
- **Framework**: Next.js 14.2.16
- **Language**: TypeScript
- **UI Components**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom animations
- **Fonts**: Lexend, Lora, and Geist Mono
- **Analytics**: Vercel Analytics
- **Package Manager**: npm (converted from pnpm)

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

## Recent Changes (September 20, 2025)
- **Successfully set up fresh GitHub import for Replit environment**:
  - Installed all npm dependencies including Next.js 14.2.32 (with security updates)
  - Fixed Supabase integration compatibility by removing deprecated auth-helpers dependency
  - Updated Supabase client configuration to use modern @supabase/supabase-js approach
  - Created development environment configuration with placeholder Supabase credentials
  - Modified Supabase validation to use warnings instead of errors for development
- **Verified Next.js configuration for Replit compatibility**:
  - Confirmed proper Content-Security-Policy headers for iframe embedding
  - Validated host binding to 0.0.0.0:5000 for Replit proxy access
  - Ensured unoptimized images for development environment
- **Development workflow successfully configured**:
  - Development server running on port 5000 with proper host binding
  - Application compiling successfully (2147 modules)
  - Hot reload and Fast Refresh working properly
- **Production deployment configured**:
  - Set up autoscale deployment target for stateless operation
  - Configured build process with npm run build
  - Set production start command with npm start
- **Application verified as fully functional**:
  - Welcome screen loading with constellation illustration
  - All UI components rendering correctly
  - Navigation and theming working as expected
  - Ready for user interaction and further development

## User Preferences
- Project follows existing code conventions and structure
- Uses the original v0.app design and component architecture
- Maintains soft UI design aesthetics with organic feel
