// ===== Intro / Game Toggle =====
function startGame() {
    document.getElementById('project-intro').style.display = 'none';
    document.getElementById('todo-container').style.display = '';
}

document.addEventListener('DOMContentLoaded', function () {
    var todoList = document.getElementById('todo-list');
    var addBtn = document.getElementById('add-task-btn');
    var exportBtn = document.getElementById('export-btn');
    var importBtn = document.getElementById('import-btn');
    var clearBtn = document.getElementById('clear-btn');
    var fileInput = document.getElementById('file-input');

    // ===== Add Task =====
    addBtn.addEventListener('click', function () {
        addTask('');
    });

    function addTask(text, completed) {
        var li = document.createElement('li');
        li.className = 'todo-item';

        // Checkbox
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                li.classList.add('completed');
            } else {
                li.classList.remove('completed');
            }
        });

        // Text input
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-text';
        input.value = text;
        input.placeholder = 'הקלד משימה...';
        input.readOnly = true;

        // If new task (empty), start in edit mode
        if (text === '') {
            input.readOnly = false;
            setTimeout(function () { input.focus(); }, 0);
        }

        // Exit edit on Enter key
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                input.readOnly = true;
                input.blur();
            }
        });

        // Edit button
        var editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'ערוך';
        editBtn.addEventListener('click', function () {
            if (input.readOnly) {
                input.readOnly = false;
                input.focus();
                editBtn.textContent = 'שמור';
            } else {
                input.readOnly = true;
                editBtn.textContent = 'ערוך';
            }
        });

        // Delete button
        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'מחק';
        deleteBtn.addEventListener('click', function () {
            todoList.removeChild(li);
        });

        // Set completed state if provided
        if (completed) {
            checkbox.checked = true;
            li.classList.add('completed');
        }

        li.appendChild(checkbox);
        li.appendChild(input);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    }

    // ===== Export to JSON =====
    exportBtn.addEventListener('click', function () {
        var items = todoList.querySelectorAll('.todo-item');
        var tasks = [];

        items.forEach(function (item) {
            var checkbox = item.querySelector('.todo-checkbox');
            var text = item.querySelector('.todo-text').value;
            tasks.push({
                task: text,
                completed: checkbox.checked
            });
        });

        var content = JSON.stringify(tasks, null, 2);
        var blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = 'todo-list.json';
        a.click();

        URL.revokeObjectURL(url);
    });

    // ===== Import from JSON =====
    importBtn.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        var file = fileInput.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var tasks = JSON.parse(e.target.result);
                todoList.innerHTML = '';
                tasks.forEach(function (task) {
                    addTask(task.task, task.completed);
                });
            } catch (err) {
                alert('שגיאה בקריאת הקובץ. ודא שהקובץ בפורמט JSON תקין.');
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    });

    // ===== Clear All =====
    clearBtn.addEventListener('click', function () {
        if (todoList.children.length === 0) return;
        if (confirm('האם אתה בטוח שברצונך למחוק את כל המשימות?')) {
            todoList.innerHTML = '';
        }
    });
});
