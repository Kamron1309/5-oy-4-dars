document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlari
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoTasks = document.getElementById('todo-tasks');
    const doneTasks = document.getElementById('done-tasks');
    const todoCount = document.getElementById('todo-count');
    const doneCount = document.getElementById('done-count');
    
    // Vazifalar massivi
    let tasks = loadTasks();
    renderTasks();
    
    // Event listenerlar
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Funktsiyalar
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
        // Konteynerlarni tozalash
        todoTasks.innerHTML = '';
        doneTasks.innerHTML = '';
        
        // Vazifalarni filtrlash
        const todoTasksArray = tasks.filter(task => !task.completed);
        const doneTasksArray = tasks.filter(task => task.completed);
        
        // Hisoblagichlarni yangilash
        todoCount.textContent = todoTasksArray.length;
        doneCount.textContent = doneTasksArray.length;
        
        // Bajariladigan vazifalarni chiqarish (yangi -> eski tartibda)
        if (todoTasksArray.length === 0) {
            todoTasks.innerHTML = '<div class="empty-state">Hozircha bajariladigan vazifalar yo\'q</div>';
        } else {
            todoTasksArray
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .forEach(task => {
                    todoTasks.appendChild(createTaskElement(task));
                });
        }
        
        // Bajarilgan vazifalarni chiqarish (yangi -> eski tartibda)
        if (doneTasksArray.length === 0) {
            doneTasks.innerHTML = '<div class="empty-state">Hozircha bajarilgan vazifalar yo\'q</div>';
        } else {
            doneTasksArray
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .forEach(task => {
                    doneTasks.appendChild(createTaskElement(task));
                });
        }
    }
    
    function createTaskElement(task) {
        // Asosiy vazifa konteyneri
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        // Chap tomon (checkbox va matn)
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'task-checkbox';
        checkbox.addEventListener('change', function() {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            saveTasks();
            renderTasks();
        });
        
        // Vazifa matni
        const textContainer = document.createElement('div');
        
        const taskTextSpan = document.createElement('div');
        taskTextSpan.className = 'task-text';
        taskTextSpan.textContent = task.text;
        
        // Vaqt ma'lumotlari
        const timeInfo = document.createElement('div');
        timeInfo.className = 'task-time';
        
        const createdTime = document.createElement('div');
        createdTime.textContent = `Yaratilgan: ${formatDate(task.createdAt)}`;
        
        const updatedTime = document.createElement('div');
        updatedTime.textContent = task.completed 
            ? `Yakunlangan: ${formatDate(task.updatedAt)}`
            : `Yangilangan: ${formatDate(task.updatedAt)}`;
        
        timeInfo.appendChild(createdTime);
        timeInfo.appendChild(updatedTime);
        
        textContainer.appendChild(taskTextSpan);
        textContainer.appendChild(timeInfo);
        
        // O'ng tomon (tugmalar)
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        
        // Tahrirlash tugmasi
        const editBtn = document.createElement('button');
        editBtn.className = 'task-btn edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Vazifani tahrirlash';
        editBtn.addEventListener('click', function() {
            editTask(task, taskTextSpan);
        });
        
        // O'chirish tugmasi
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Vazifani o\'chirish';
        deleteBtn.addEventListener('click', function() {
            if (confirm('Haqiqatan ham bu vazifani o\'chirmoqchimisiz?')) {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            }
        });
        
        // Elementlarni yig'ish
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);
        
        taskContent.appendChild(checkbox);
        taskContent.appendChild(textContainer);
        
        taskDiv.appendChild(taskContent);
        taskDiv.appendChild(taskActions);
        
        return taskDiv;
    }
    
    function editTask(task, textElement) {
        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'task-input';
        input.style.margin = '0';
        input.style.width = '100%';
        
        // Matnni input bilan almashtirish
        const parent = textElement.parentNode;
        parent.replaceChild(input, textElement);
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
        
        // Enter yoki blur orqali saqlash
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveEdit();
        });
        
        input.addEventListener('blur', saveEdit);
    }
    
    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('uz-UZ');
    }
    
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});