# JobQuest Single Page Application

This application has been converted to a single page application (SPA) with client-side routing.

## Architecture

### Main App Component
- **File**: `src/app/page.tsx`
- **Purpose**: Main application component that handles all routing logic
- **Features**:
  - Client-side routing using state management
  - Browser back/forward button support
  - URL synchronization without page reloads
  - Authentication-based route protection

### Page Components
All page components are located in `src/components/pages/` and include:

- `landing-page.tsx` - Landing page for non-authenticated users
- `login-page.tsx` - User authentication
- `register-page.tsx` - User registration
- `dashboard-page.tsx` - Main dashboard for authenticated users
- `jobs-page.tsx` - Job tracking functionality
- `learning-page.tsx` - Learning resources
- `missions-page.tsx` - Focus missions
- `settings-page.tsx` - User settings
- `about-page.tsx` - About page
- `achievements-page.tsx` - User achievements
- `notebook-page.tsx` - Daily notebook

### Navigation
- **Type**: `Route` - Union type of all available routes
- **Function**: `navigate(route: string)` - Client-side navigation function
- **Features**:
  - Updates URL without page reload
  - Maintains browser history
  - Validates route before navigation

### Layout Components
- **DashboardLayout**: Updated to accept `navigate` prop for client-side routing
- **Sidebar**: Updated to use `navigate` function instead of Next.js `Link` components
- **Header**: Remains unchanged

## Routing Flow

1. **Initial Load**: App checks authentication status
2. **Authenticated User**: Redirected to dashboard
3. **Non-authenticated User**: Redirected to landing page
4. **Navigation**: Uses client-side routing with URL updates
5. **Browser Navigation**: Back/forward buttons work correctly

## Benefits

- **Faster Navigation**: No page reloads between routes
- **Better UX**: Smoother transitions and state preservation
- **Reduced Server Load**: Less server requests for navigation
- **Consistent State**: Application state persists across route changes

## Technical Implementation

### URL Handling
- Uses `window.history.pushState()` for URL updates
- Listens to `popstate` events for browser navigation
- Maintains route history in component state

### Route Validation
- Type-safe routing with TypeScript
- Route validation before navigation
- Fallback to landing page for invalid routes

### Authentication Integration
- Seamless integration with existing auth context
- Automatic redirects based on authentication status
- Protected routes for authenticated users

## File Structure

```
src/
├── app/
│   ├── page.tsx          # Main SPA component
│   ├── layout.tsx        # Root layout
│   └── api/              # API routes (unchanged)
├── components/
│   ├── pages/            # All page components
│   └── layout/           # Layout components (updated)
└── contexts/             # React contexts (unchanged)
```

## Migration Notes

- Removed all individual page directories from `src/app/`
- Updated all navigation to use client-side routing
- Maintained all existing functionality
- Preserved API routes and backend logic
- Updated TypeScript types for type safety
