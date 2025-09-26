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

## Recent Changes

### September 25, 2025 - Initial Setup
- **Fresh GitHub import setup completed for Replit environment**:
  - Installed all npm dependencies (252 packages) including Next.js 15.2.4
  - Resolved React 19 compatibility issues with legacy peer deps flag
  - Fixed cross-origin request issues by adding *.janeway.replit.dev to allowedDevOrigins
- **Next.js configuration optimized for Replit**:
  - Updated allowedDevOrigins to include current Replit domain patterns
  - Maintained proper Content-Security-Policy headers for iframe embedding
  - Configured host binding to 0.0.0.0:5000 for Replit proxy compatibility
- **Production deployment configured for autoscale target**

### September 26, 2025 - Modern Architecture Implementation  
- **Complete architectural modernization**:
  - **State Management**: Replaced component state with Zustand store including persist middleware for automatic local storage
  - **Local Storage**: Implemented Dexie.js IndexedDB schema replacing Supabase dependency for local-first architecture
  - **AI Integration**: Added Transformers.js with Web Workers for local semantic search and embeddings generation
  - **Type Safety**: Centralized Note type definition in lib/types/note.ts preventing interface drift
- **Core Architecture Components**:
  - `lib/stores/notes.ts` - Zustand store with CRUD operations and persistence
  - `lib/db.ts` - Dexie database schema for notes and embeddings
  - `lib/ai.ts` - AI engine with semantic search using cosine similarity
  - `workers/ai-worker.ts` - Web Worker for non-blocking AI processing
  - `components/notes/note-editor.tsx` - Modernized editor with autosave and AI suggestions
- **Critical Issues Resolved**:
  - Fixed editor route params handling (removed async wrapper)
  - Resolved AI worker module type configuration
  - Eliminated autosave duplication bugs with proper note tracking
  - Fixed embedding persistence for new notes
  - Synchronized all Note type definitions across components
- **Application Status**: Fully functional modern architecture with semantic search, local storage, and AI-powered features

## User Preferences
- Project follows existing code conventions and structure
- Uses the original v0.app design and component architecture
- Maintains soft UI design aesthetics with organic feel
