// Global state
let tasks = JSON.parse(localStorage.getItem('weeklyTasks')) || [];
let currentWeekStart = getWeekStart(new Date());
let selectedDay = null;
let viewFilter = localStorage.getItem('viewFilter') || 'weekdays'; // 'all' or 'weekdays'

// DOM Elements
const weekView = document.getElementById('weekView');
const taskModal = document.getElementById('taskModal');
const taskInput = document.getElementById('taskInput');
const taskDescription = document.getElementById('taskDescription');
const taskDueDate = document.getElementById('taskDueDate');
const taskPriority = document.getElementById('taskPriority');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const prevWeekBtn = document.getElementById('prevWeekBtn');
const nextWeekBtn = document.getElementById('nextWeekBtn');
const todayBtn = document.getElementById('todayBtn');
const weekRange = document.getElementById('weekRange');
const weekStats = document.getElementById('weekStats');
const darkModeToggle = document.getElementById('darkModeToggle');
const viewTaskModal = document.getElementById('viewTaskModal');
const closeViewModal = document.getElementById('closeViewModal');
const closeViewBtn = document.getElementById('closeViewBtn');
const viewTaskTitle = document.getElementById('viewTaskTitle');
const viewTaskDescription = document.getElementById('viewTaskDescription');
const viewTaskMeta = document.getElementById('viewTaskMeta');
const toggleTaskStatusBtn = document.getElementById('toggleTaskStatusBtn');
const filterAllDays = document.getElementById('filterAllDays');
const filterWeekdays = document.getElementById('filterWeekdays');
let currentViewingTaskId = null;

// Initialize app
init();

function init() {
    loadDarkMode();
    loadViewFilter();
    rolloverIncompleteTasks();
    renderWeek();
    updateWeekInfo();
    setupEventListeners();
}

function setupEventListeners() {
    addTaskBtn.addEventListener('click', handleAddTask);
    closeModal.addEventListener('click', closeTaskModal);
    cancelBtn.addEventListener('click', closeTaskModal);
    closeViewModal.addEventListener('click', closeViewTaskModal);
    closeViewBtn.addEventListener('click', closeViewTaskModal);
    toggleTaskStatusBtn.addEventListener('click', toggleCurrentTaskStatus);
    prevWeekBtn.addEventListener('click', () => navigateWeek(-1));
    nextWeekBtn.addEventListener('click', () => navigateWeek(1));
    todayBtn.addEventListener('click', goToToday);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    filterAllDays.addEventListener('click', () => setViewFilter('all'));
    filterWeekdays.addEventListener('click', () => setViewFilter('weekdays'));

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleAddTask();
        }
    });

    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeTaskModal();
        }
    });

    viewTaskModal.addEventListener('click', (e) => {
        if (e.target === viewTaskModal) {
            closeViewTaskModal();
        }
    });
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function navigateWeek(direction) {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));

    // Don't allow navigating to past weeks
    const thisWeekStart = getWeekStart(new Date());
    if (direction < 0 && newDate < thisWeekStart) {
        return;
    }

    currentWeekStart = newDate;
    rolloverIncompleteTasks();
    renderWeek();
    updateWeekInfo();
}

function goToToday() {
    currentWeekStart = getWeekStart(new Date());
    rolloverIncompleteTasks();
    renderWeek();
    updateWeekInfo();
}

function updateWeekInfo() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const nextWeekEnd = new Date(currentWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 13);

    weekRange.textContent = `This Week: ${formatDateDisplay(currentWeekStart)} - ${formatDateDisplay(weekEnd)} | Next Week: ${formatDateDisplay(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000))} - ${formatDateDisplay(nextWeekEnd)}`;

    const allTasks = getAllDisplayedTasks();
    const completed = allTasks.filter(t => t.completed).length;
    weekStats.textContent = `${completed} / ${allTasks.length} tasks completed`;
}

function getAllDisplayedTasks() {
    const twoWeeksEnd = new Date(currentWeekStart);
    twoWeeksEnd.setDate(twoWeeksEnd.getDate() + 14);

    return tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= currentWeekStart && taskDate < twoWeeksEnd;
    });
}

function getWeekTasks() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= currentWeekStart && taskDate < weekEnd;
    });
}

function renderWeek() {
    weekView.innerHTML = '';

    // Update grid layout based on filter
    if (viewFilter === 'weekdays') {
        weekView.classList.add('weekdays-only');
    } else {
        weekView.classList.remove('weekdays-only');
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = formatDate(new Date());

    // Add "This Week" header
    const thisWeekHeader = document.createElement('div');
    thisWeekHeader.className = 'week-separator';
    thisWeekHeader.textContent = 'This Week';
    weekView.appendChild(thisWeekHeader);

    // Render current week (7 days)
    for (let i = 0; i < 7; i++) {
        renderDayColumn(i, days, today, false);
    }

    // Add "Next Week" header
    const nextWeekHeader = document.createElement('div');
    nextWeekHeader.className = 'week-separator';
    nextWeekHeader.textContent = 'Next Week';
    weekView.appendChild(nextWeekHeader);

    // Render next week (7 days)
    for (let i = 7; i < 14; i++) {
        renderDayColumn(i, days, today, true);
    }
}

function renderDayColumn(dayOffset, days, today, isNextWeek) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = formatDate(date);
    const isToday = dateStr === today;
    const dayIndex = dayOffset % 7;

    // Skip weekends if filter is set to weekdays only
    if (viewFilter === 'weekdays' && (dayIndex === 0 || dayIndex === 6)) {
        return;
    }

    const dayColumn = document.createElement('div');
    dayColumn.className = `day-column ${isToday ? 'today' : ''} ${isNextWeek ? 'next-week' : ''}`;
    dayColumn.setAttribute('data-date', dateStr);
    dayColumn.innerHTML = `
        <div class="day-header">
            <div class="day-name">${days[dayIndex]}</div>
            <div class="day-date">${date.getDate()}</div>
        </div>
        <button class="add-task-btn" onclick="openTaskModal('${dateStr}')">+ Add Task</button>
        <div class="tasks-container" id="tasks-${dateStr}" data-date="${dateStr}"></div>
    `;

    const tasksContainer = dayColumn.querySelector('.tasks-container');
    tasksContainer.addEventListener('dragover', handleDragOver);
    tasksContainer.addEventListener('drop', handleDrop);
    tasksContainer.addEventListener('dragleave', handleDragLeave);

    weekView.appendChild(dayColumn);
    renderDayTasks(dateStr);
}

function renderDayTasks(dateStr) {
    const container = document.getElementById(`tasks-${dateStr}`);
    const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    container.innerHTML = dayTasks.map(task => `
        <div
            class="task-card ${task.completed ? 'completed' : ''} ${task.rolledOver ? 'rolled-over' : ''} priority-${task.priority}"
            draggable="true"
            data-task-id="${task.id}"
            ondragstart="handleDragStart(event, '${task.id}')"
            ondragend="handleDragEnd(event)"
        >
            <div class="task-header" onclick="openViewTaskModal('${task.id}')">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    onclick="event.stopPropagation();"
                    onchange="toggleTask('${task.id}')"
                >
                <div class="task-content">
                    <div class="task-title">
                        ${task.rolledOver ? '<span class="rollover-badge">Rollover</span>' : ''}
                        ${escapeHtml(task.title)}
                    </div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                </div>
            </div>
            <div class="task-footer" onclick="openViewTaskModal('${task.id}')">
                <span class="priority-badge ${task.priority}">${task.priority}</span>
                ${task.dueDate ? `<span class="due-date">Due: ${formatDateDisplay(new Date(task.dueDate))}</span>` : ''}
                <button class="delete-task-btn" onclick="event.stopPropagation(); deleteTask('${task.id}')" title="Delete task">×</button>
            </div>
        </div>
    `).join('');
}

function openTaskModal(dateStr) {
    selectedDay = dateStr;
    taskModal.classList.add('show');
    taskInput.focus();
}

function closeTaskModal() {
    taskModal.classList.remove('show');
    taskInput.value = '';
    taskDescription.value = '';
    taskDueDate.value = '';
    taskPriority.value = 'medium';
    selectedDay = null;
}

function openViewTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    currentViewingTaskId = taskId;

    viewTaskTitle.textContent = task.title;
    viewTaskDescription.innerHTML = task.description
        ? `<strong>Description:</strong><br>${escapeHtml(task.description)}`
        : '<em>No description</em>';

    const metaInfo = [];
    metaInfo.push(`<strong>Priority:</strong> <span class="priority-badge ${task.priority}">${task.priority}</span>`);
    metaInfo.push(`<strong>Date:</strong> ${formatDateDisplay(new Date(task.date))}`);
    if (task.dueDate) {
        metaInfo.push(`<strong>Due Date:</strong> ${formatDateDisplay(new Date(task.dueDate))}`);
    }
    metaInfo.push(`<strong>Status:</strong> ${task.completed ? '✓ Completed' : 'Pending'}`);
    if (task.rolledOver) {
        metaInfo.push(`<strong>Rolled Over:</strong> Yes (from previous week)`);
    }
    metaInfo.push(`<strong>Created:</strong> ${formatDateDisplay(new Date(task.createdAt))}`);

    viewTaskMeta.innerHTML = metaInfo.join('<br>');

    // Update button text based on completion status
    if (task.completed) {
        toggleTaskStatusBtn.textContent = 'Reopen Task';
        toggleTaskStatusBtn.className = 'status-toggle-btn reopen';
    } else {
        toggleTaskStatusBtn.textContent = 'Mark as Complete';
        toggleTaskStatusBtn.className = 'status-toggle-btn complete';
    }

    viewTaskModal.classList.add('show');
}

function closeViewTaskModal() {
    viewTaskModal.classList.remove('show');
    currentViewingTaskId = null;
}

function toggleCurrentTaskStatus() {
    if (!currentViewingTaskId) return;

    const task = tasks.find(t => t.id === currentViewingTaskId);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    renderDayTasks(task.date);
    updateWeekInfo();

    // Update the modal to reflect the new status
    openViewTaskModal(currentViewingTaskId);
}

function handleAddTask() {
    const title = taskInput.value.trim();

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    if (!selectedDay) {
        alert('Please select a day');
        return;
    }

    const task = {
        id: Date.now().toString(),
        title: title,
        description: taskDescription.value.trim(),
        dueDate: taskDueDate.value || null,
        priority: taskPriority.value,
        date: selectedDay,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderDayTasks(selectedDay);
    updateWeekInfo();
    closeTaskModal();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderDayTasks(task.date);
        updateWeekInfo();
    }
}

function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderDayTasks(task.date);
        updateWeekInfo();
    }
}

function saveTasks() {
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Dark mode functions
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
}

// View filter functions
function setViewFilter(filter) {
    viewFilter = filter;
    localStorage.setItem('viewFilter', filter);
    updateFilterButtons();
    renderWeek();
}

function loadViewFilter() {
    updateFilterButtons();
}

function updateFilterButtons() {
    if (viewFilter === 'all') {
        filterAllDays.classList.add('active');
        filterWeekdays.classList.remove('active');
    } else {
        filterAllDays.classList.remove('active');
        filterWeekdays.classList.add('active');
    }
}

// Drag and drop functions
let draggedTaskId = null;

function handleDragStart(event, taskId) {
    draggedTaskId = taskId;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.innerHTML);
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    draggedTaskId = null;

    // Remove all drag-over classes
    document.querySelectorAll('.tasks-container').forEach(container => {
        container.classList.remove('drag-over');
    });
}

function handleDragOver(event) {
    if (event.preventDefault) {
        event.preventDefault();
    }

    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');
    return false;
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    }

    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    if (!draggedTaskId) return;

    const newDate = event.currentTarget.getAttribute('data-date');
    const task = tasks.find(t => t.id === draggedTaskId);

    if (task && task.date !== newDate) {
        const oldDate = task.date;
        task.date = newDate;
        saveTasks();
        renderDayTasks(oldDate);
        renderDayTasks(newDate);
        updateWeekInfo();
    }

    return false;
}

// Get next Monday from a given date
function getNextMonday(fromDate) {
    const nextMonday = new Date(fromDate);
    const currentDay = nextMonday.getDay();

    // Calculate days until next Monday
    // If Friday (5), add 3 days to get to Monday
    // If Saturday (6), add 2 days
    // If Sunday (0), add 1 day
    // For other days, calculate normally
    let daysToAdd;
    if (currentDay === 5) { // Friday
        daysToAdd = 3;
    } else if (currentDay === 6) { // Saturday
        daysToAdd = 2;
    } else if (currentDay === 0) { // Sunday
        daysToAdd = 1;
    } else {
        // For Mon-Thu, go to next Monday (7 - currentDay + 1)
        daysToAdd = (8 - currentDay) % 7;
        if (daysToAdd === 0) daysToAdd = 7;
    }

    nextMonday.setDate(nextMonday.getDate() + daysToAdd);
    return nextMonday;
}

// Rollover incomplete tasks - Friday tasks move to next Monday
function rolloverIncompleteTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all incomplete tasks that are before today
    const incompleteTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return !task.completed && taskDate < today && !task.rolledOver;
    });

    if (incompleteTasks.length === 0) return;

    // Roll over each incomplete task
    // Friday tasks always move to next Monday
    // Other tasks move to next Monday as well
    incompleteTasks.forEach(task => {
        const oldDate = new Date(task.date);
        oldDate.setHours(0, 0, 0, 0);

        const newDate = getNextMonday(oldDate);

        task.date = formatDate(newDate);
        task.rolledOver = true;
    });

    saveTasks();
}
