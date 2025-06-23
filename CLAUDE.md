# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BNI何でも教える君 - A simple AI chatbot frontend for BNI (Business Network International) members, powered by Dify backend.

## Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Dify API integration
- **API**: Server-sent events (SSE) for streaming responses

### Key Components
- `ChatInterface.tsx` - Main chat component with state management
- `SelectForm.tsx` - Initial category selection form
- `/api/dify/chat-messages/route.ts` - Dify API proxy endpoint

## Dify Integration

### Configuration
Required environment variables:
- `DIFY_APP_API_BASE_URL` - Dify API base URL
- `DIFY_APP_API_KEY` - Dify API authentication key

### API Request Format
```typescript
{
  query: string,
  select: 'BNI全般' | 'SILVISチャプター' | 'エデュケーション何でも教える君',
  conversation_id?: string,
  user?: string
}
```

### Select Categories
1. **BNI全般** - General BNI rules and regulations
2. **SILVISチャプター** - SILVIS chapter-specific rules  
3. **エデュケーション何でも教える君** - Educational content creation support

## Key Features

### Select-Based Thread Management
- Changing select category starts a new conversation thread
- conversation_id is reset when category changes
- Chat history is cleared for new threads

### Streaming Response Handling
- Real-time message streaming from Dify API
- Progressive message building with typing indicators
- Error handling for failed streams

### Simple UX Flow
1. User selects category from initial form
2. Chat interface opens with "はじめる" auto-message
3. Streaming conversation with Dify backend
4. Option to change category (resets thread)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## File Structure

```
src/
├── app/
│   ├── api/dify/chat-messages/route.ts  # Dify API proxy
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Home page
│   └── globals.css                      # Global styles
├── components/
│   ├── ChatInterface.tsx                # Main chat component
│   └── SelectForm.tsx                   # Category selection
└── lib/
    └── types.ts                         # TypeScript definitions
```

## Deployment Notes

- Set environment variables in deployment platform
- Ensure CORS is properly configured for Dify API
- Test streaming functionality in production environment
- Consider rate limiting for API endpoints

## BNI-Specific Considerations

- Japanese language interface
- BNI brand colors in Tailwind config
- Handles complex Dify workflow with multiple knowledge bases
- Supports educational content creation workflows