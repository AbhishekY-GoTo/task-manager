# Weekly To-Do App

A clean, modern vanilla JavaScript weekly task manager with dark mode and drag-and-drop functionality.

## Features

- 📅 **Two-Week View** - See current and next week at once
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 🎯 **Priority Levels** - High, medium, and low priority tasks with color coding
- ✨ **Drag & Drop** - Move tasks between days easily
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💾 **Local Storage** - All tasks persist in your browser
- 🔄 **Auto Rollover** - Incomplete tasks automatically move to next Monday
- 🎨 **No Dependencies** - Pure vanilla JavaScript, no frameworks or build tools

## Quick Start

Simply open `index.html` in your web browser. That's it!

```bash
# Clone the repository
git clone https://github.com/AbhishekY-GoTo/task-manager.git

# Navigate to the directory
cd task-manager

# Open in browser
open index.html
# or
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Usage

- **Add Task**: Click the "+ Add Task" button on any day
- **Complete Task**: Check the checkbox on any task  
- **View Details**: Click anywhere on a task card to see full details
- **Delete Task**: Click the × button on a task card
- **Move Task**: Drag and drop tasks between different days
- **Toggle Dark Mode**: Click the moon/sun icon in the header
- **Filter View**: Switch between "All Days" and "Weekdays Only"
- **Navigate Weeks**: Use Prev/Next buttons or click "Today" to return to current week

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Grid layout, transitions, and dark mode
- **Vanilla JavaScript** - Pure ES6+ with no dependencies
- **LocalStorage API** - Client-side data persistence

## File Structure

```
task-manager/
├── index.html          # Main HTML structure
├── script.js           # All application logic
├── style.css           # Complete styling
└── .github/
    └── copilot-instructions.md  # AI coding guidelines
```

## Features in Detail

### Priority System
- **High Priority**: Red border and badge
- **Medium Priority**: Orange border and badge  
- **Low Priority**: Green border and badge

### Smart Rollover
Incomplete tasks from past days automatically roll over to the next Monday, marked with a "Rollover" badge.

### Responsive Grid
- Desktop (>1400px): 7 columns
- Tablet (≤1200px): 4 columns  
- Mobile (≤768px): 2 columns
- Small Mobile (≤480px): 1 column

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- LocalStorage API
- Drag and Drop API

Tested on: Chrome, Firefox, Safari, Edge

## Development

No build process required! Just edit the files and refresh your browser.

### Key Functions

- `renderWeek()` - Builds the two-week calendar view
- `handleAddTask()` - Creates and saves new tasks
- `toggleTask()` - Marks tasks as complete/incomplete
- `rolloverIncompleteTasks()` - Moves past incomplete tasks to next Monday
- `toggleDarkMode()` - Switches between light and dark themes

### Data Structure

Each task is stored with:
```javascript
{
  id: string,           // Timestamp-based ID
  title: string,
  description: string,
  priority: 'low'|'medium'|'high',
  date: 'YYYY-MM-DD',
  dueDate: 'YYYY-MM-DD' | null,
  completed: boolean,
  rolledOver: boolean,
  createdAt: ISO timestamp
}
```

## License

MIT License - feel free to use this project however you'd like!

## Contributing

This is a personal project, but feel free to fork and customize it for your own use!

## Author

Built with ❤️ by Abhishek Yadav

---

**Note**: This app stores data in your browser's LocalStorage. Data will persist across sessions but is not synced across devices or browsers.
