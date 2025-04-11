document.addEventListener('DOMContentLoaded', function () {
    const taskfilledInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const tasksContainer = document.getElementById('tasksContainer');

    const allTab = document.getElementById('allTab');
    const pendingTab = document.getElementById('pendingTab');
    const completedTab = document.getElementById('completedTab');

    let currentView = 'all';
    let isEditing = false;
    let editingTaskId = null;

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function displayTasks() {
        tasksContainer.innerHTML = '';

        let tasksToShow = [];
        if (currentView === 'all') {
            tasksToShow = tasks;
        } else if (currentView === 'pending') {
            tasksToShow = tasks.filter(task => !task.completed);
        } else if (currentView === 'completed') {
            tasksToShow = tasks.filter(task => task.completed);
        }

        if (tasksToShow.length === 0) {
            let message = '';
            if (currentView === 'all') {
                message = 'No tasks yet. Add a task to get started!';
            } else if (currentView === 'pending') {
                message = 'No pending tasks. All done!';
            } else {
                message = 'No completed tasks yet.';
            }

            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = message;
            tasksContainer.appendChild(emptyMessage);
            return;
        }

        tasksToShow.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.completed ? 'completed-task' : ''}`;
            taskElement.dataset.id = task.id;

            const createdDate = new Date(task.createdAt);
            const formattedCreatedDate = `${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString()}`;

            let completedDateText = '';
            if (task.completed && task.completedAt) {
                const completedDate = new Date(task.completedAt);
                completedDateText = `<br>Completed: ${completedDate.toLocaleDateString()} at ${completedDate.toLocaleTimeString()}`;
            }

            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-date">
                        Created: ${formattedCreatedDate}
                        ${completedDateText}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-complete">${task.completed ? 'Undo' : 'Complete'}</button>
                    <button class="btn-edit">Edit</button>
                    <button class="btn-delete">Delete</button>
                </div>
                <div class="edit-form" id="edit-${task.id}">
                    <input type="text" class="edit-input" value="${task.title}">
                    <div class="edit-buttons">
                        <button class="btn-save">Save</button>
                        <button class="btn-cancel">Cancel</button>
                    </div>
                </div>
            `;

            tasksContainer.appendChild(taskElement);

            const completeBtn = taskElement.querySelector('.btn-complete');
            const editBtn = taskElement.querySelector('.btn-edit');
            const deleteBtn = taskElement.querySelector('.btn-delete');
            const saveBtn = taskElement.querySelector('.btn-save');
            const cancelBtn = taskElement.querySelector('.btn-cancel');
            const editForm = taskElement.querySelector('.edit-form');

            completeBtn.addEventListener('click', function () {
                toggleComplete(task.id);
            });

            editBtn.addEventListener('click', function () {
                editForm.classList.add('active');
                editingTaskId = task.id;
                isEditing = true;
            });

            deleteBtn.addEventListener('click', function () {
                deleteTask(task.id);
            });

            saveBtn.addEventListener('click', function () {
                const newTitle = taskElement.querySelector('.edit-input').value.trim();
                if (newTitle) {
                    saveEdit(task.id, newTitle);
                    editForm.classList.remove('active');
                    isEditing = false;
                }
            });

            cancelBtn.addEventListener('click', function () {
                editForm.classList.remove('active');
                isEditing = false;
            });
        });
    }

    function addTask() {
        const taskTitle = taskInput.value.trim();

        if (!taskTitle) {
            alert('Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            title: taskTitle,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        displayTasks();
    }

    function toggleComplete(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;

            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completedAt = new Date().toISOString();
            } else {
                tasks[taskIndex].completedAt = null;
            }

            saveTasks();
            displayTasks();
        }
    }

    function saveEdit(taskId, newTitle) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].title = newTitle;
            saveTasks();
            displayTasks();
        }
    }

    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            displayTasks();
        }
    }

    function switchTab(view) {
        allTab.classList.remove('active');
        pendingTab.classList.remove('active');
        completedTab.classList.remove('active');

        if (view === 'all') {
            allTab.classList.add('active');
        } else if (view === 'pending') {
            pendingTab.classList.add('active');
        } else if (view === 'completed') {
            completedTab.classList.add('active');
        }

        currentView = view;
        displayTasks();
    }

    addTaskBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    allTab.addEventListener('click', function () {
        switchTab('all');
    });

    pendingTab.addEventListener('click', function () {
        switchTab('pending');
    });

    completedTab.addEventListener('click', function () {
        switchTab('completed');
    });

    displayTasks();
});