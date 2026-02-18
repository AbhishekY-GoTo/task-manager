# AI Coding Instructions for Weekly To-Do App

## Architecture Overview

This is a **vanilla JavaScript single-page application** with no build tools, frameworks, or dependencies. The entire app consists of three files:
- `index.html` - Structure with semantic HTML and modal dialog
- `script.js` - All application logic using DOM manipulation and localStorage
- `style.css` - Complete styling with dark mode and responsive layouts

**No npm, webpack, or transpilation**. Changes take effect immediately on browser refresh.

## State Management

The app uses a single global state array stored in localStorage:
```javascript
let tasks = JSON.parse(localStorage.getItem('weeklyTasks')) || [];
```

Each task object structure:
```javascript
{
  id: Date.now().toString(),    // Timestamp-based unique ID
  title: string,
  description: string,           // Optional
  priority: 'low'|'medium'|'high',
  date: 'YYYY-MM-DD',           // ISO date format
  completed: boolean,
  createdAt: ISO timestamp
}
```

**Critical**: Always call `saveTasks()` after modifying the `tasks` array to persist to localStorage.

## Week Navigation System

The app operates on a Sunday-to-Saturday week system:
- `currentWeekStart` is always set to the Sunday of the current view
- `getWeekStart(date)` calculates the Sunday for any given date
- Week navigation moves in 7-day increments
- Tasks are filtered by date range: `taskDate >= currentWeekStart && taskDate < weekEnd`

## Rendering Patterns

**Full rerender approach**: The app uses `innerHTML` replacement rather than incremental DOM updates:
- `renderWeek()` rebuilds all 7 day columns from scratch
- `renderDayTasks(dateStr)` rebuilds a single day's task list
- Always call `updateWeekInfo()` after task changes to refresh stats

**Inline event handlers**: Event handlers use `onclick` attributes with function names (e.g., `onclick="toggleTask('${task.id}')"`). This pattern is established throughout - maintain consistency.

## Dark Mode Implementation

Dark mode is a body class toggle with localStorage persistence:
```javascript
body.classList.toggle('dark-mode')
localStorage.setItem('darkMode', isDark)
```

All dark mode styles use `body.dark-mode` prefixed selectors in [style.css](style.css). When adding new UI elements, always include corresponding dark mode variants.

## Security & XSS Prevention

Use `escapeHtml()` helper for all user-generated content displayed via `innerHTML`:
```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;  // Leverages browser's native escaping
  return div.innerHTML;
}
```

Apply to `task.title` and `task.description` in all rendering contexts.

## Priority System

Tasks use a three-level priority with visual indicators:
- **high**: Red left border (`#ff6b6b`), red badge
- **medium**: Orange border (`#fab005`), orange badge  
- **low**: Green border (`#51cf66`), green badge

Tasks are automatically sorted by priority when rendered (high → medium → low).

## Modal Workflow

The task modal (`#taskModal`) uses class toggling:
- Open: `taskModal.classList.add('show')` + set `selectedDay` variable
- Close: Remove class, clear inputs, reset `selectedDay` to null
- Modal supports Enter key submission and backdrop click-to-close

## Responsive Grid

The week view uses CSS Grid with breakpoints:
- Desktop: 7 columns (full week)
- Tablet (≤1200px): 4 columns
- Mobile (≤768px): 2 columns
- Small mobile (≤480px): 1 column

No JavaScript handling needed - pure CSS media queries.

## Development Workflow

1. Edit files directly (no build step)
2. Refresh browser to see changes
3. Check browser console for errors (no linting configured)
4. Test localStorage persistence in DevTools Application tab
5. Use "Today" button to reset to current week for testing

## Common Patterns

- **Date formatting**: Use `formatDate()` for storage (`YYYY-MM-DD`), `formatDateDisplay()` for UI display
- **Task filtering**: Filter by `date` field matching ISO string: `tasks.filter(t => t.date === dateStr)`
- **IDs**: Generate with `Date.now().toString()` (no UUID library)
- **Confirmation dialogs**: Use native `alert()` and `confirm()` for user prompts

## Testing Notes

- localStorage data persists across page reloads but not across browsers/incognito
- Clear localStorage: `localStorage.clear()` in console
- Week navigation wraps naturally (no bounds checking)
- No unit tests or testing framework configured
