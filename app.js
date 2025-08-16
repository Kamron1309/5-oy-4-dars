document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoTasks = document.getElementById('todo-tasks');
    const doneTasks = document.getElementById('done-tasks');
    const todoCount = document.getElementById('todo-count');
    const doneCount = document.getElementById('done-count');
    
    // Initialize tasks array
    let tasks = loadTasks();
    renderTasks();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Functions
    function addTask() {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            newTaskInput.value = '';
            newTaskInput.focus();
        }
    }
    
    function renderTasks() {
        // Clear containers
        todoTasks.innerHTML = '';
        doneTasks.innerHTML = '';
        
        // Filter tasks
        const todoTasksArray = tasks.filter(task => !task.completed);
        const doneTasksArray = tasks.filter(task => task.completed);
        
        // Update counters
        todoCount.textContent = todoTasksArray.length;
        doneCount.textContent = doneTasksArray.length;
        
        // Render to-do tasks (sorted by creation date, newest first)
        todoTasksArray
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(task => {
                todoTasks.appendChild(createTaskElement(task));
            });
        
        // Render done tasks (sorted by completion date, newest first)
        doneTasksArray
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .forEach(task => {
                doneTasks.appendChild(createTaskElement(task));
            });
    }
    
    function createTaskElement(task) {
        // Main task container
        const taskDiv = document.createElement('div');
        taskDiv.className = `flex items-center justify-between p-3 rounded-lg ${
            task.completed ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
        } border border-gray-200`;
        
        // Left side (checkbox and text)
        const leftSide = document.createElement('div');
        leftSide.className = 'flex items-center flex-grow';
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'w-5 h-5 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer';
        checkbox.addEventListener('change', function() {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            saveTasks();
            renderTasks();
        });
        
        // Task text (with edit functionality)
        const textContainer = document.createElement('div');
        textContainer.className = 'flex-grow';
        
        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = `text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`;
        taskTextSpan.textContent = task.text;
        
        // Timestamps
        const timeInfo = document.createElement('div');
        timeInfo.className = 'text-xs text-gray-500 mt-1';
        
        const createdTime = document.createElement('div');
        createdTime.textContent = `Created: ${formatDate(task.createdAt)}`;
        
        const updatedTime = document.createElement('div');
        updatedTime.textContent = task.completed 
            ? `Completed: ${formatDate(task.updatedAt)}`
            : `Updated: ${formatDate(task.updatedAt)}`;
        
        timeInfo.appendChild(createdTime);
        timeInfo.appendChild(updatedTime);
        
        textContainer.appendChild(taskTextSpan);
        textContainer.appendChild(timeInfo);
        
        // Right side (buttons)
        const rightSide = document.createElement('div');
        rightSide.className = 'flex items-center space-x-2 ml-3';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'text-gray-500 hover:text-blue-600 transition-colors';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', function() {
            editTask(task, taskTextSpan);
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-gray-500 hover:text-red-600 transition-colors';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            }
        });
        
        // Assemble elements
        rightSide.appendChild(editBtn);
        rightSide.appendChild(deleteBtn);
        
        leftSide.appendChild(checkbox);
        leftSide.appendChild(textContainer);
        
        taskDiv.appendChild(leftSide);
        taskDiv.appendChild(rightSide);
        
        return taskDiv;
    }
    
    function editTask(task, textElement) {
        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'flex-grow px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500';
        
        // Replace text with input field
        textElement.replaceWith(input);
        input.focus();
        
        function saveEdit() {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                task.text = newText;
                task.updatedAt = new Date().toISOString();
                saveTasks();
            }
            renderTasks();
        }
        
        // Save on Enter or blur
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveEdit();
        });
        
        input.addEventListener('blur', saveEdit);
    }
    
    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString();
    }
    
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});