
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = localStorage.getItem("currentFilter") || "all";

setActiveFilterButton(currentFilter);
renderTasks();

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    const msgMap = {
      all: "🌸 No tasks yet — add one above!",
      active: "✅ No active tasks!",
      completed: "🎉 No completed tasks yet!"
    };
    emptyMessage.textContent = msgMap[currentFilter] || msgMap.all;
    emptyMessage.classList.add("show");
    return;
  } else {
    emptyMessage.classList.remove("show");
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type="checkbox";
    checkbox.checked=task.completed;
    checkbox.classList.add("task-checkbox");
    checkbox.addEventListener("change", ()=>{
      task.completed=checkbox.checked;
      updateLocalStorage();
    });

    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;
    textSpan.style.flex = "1";

    if (task.completed) li.classList.add("completed");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tasks = tasks.filter(t => t.id !== task.id);
      updateLocalStorage();
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      enableEditMode(task, textSpan);
    });

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("action-buttons");
    btnContainer.appendChild(deleteBtn);
    btnContainer.appendChild(editBtn);
    
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(btnContainer);
    taskList.appendChild(li);
  });
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false
  };

  tasks.push(newTask);
  updateLocalStorage();
  taskInput.value = "";
});

function updateLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

document.getElementById("filter-all").addEventListener("click", () => setFilter("all"));
document.getElementById("filter-active").addEventListener("click", () => setFilter("active"));
document.getElementById("filter-completed").addEventListener("click", () => setFilter("completed"));

function setFilter(filterType) {
  currentFilter = filterType;
  localStorage.setItem("currentFilter", filterType);
  setActiveFilterButton(filterType);
  renderTasks();
}

function setActiveFilterButton(filterType) {
  const btns = document.querySelectorAll(".filters button");
  btns.forEach(btn => btn.classList.remove("active-filter"));
  const activeBtn = document.getElementById(`filter-${filterType}`);
  if (activeBtn) activeBtn.classList.add("active-filter");
}

const clearAllBtn = document.getElementById("clear-all");
clearAllBtn.addEventListener("click", () => {
  if (tasks.length === 0) {
    alert("There are no tasks to clear!");
    return;
  }

  if (confirm("Are you sure you want to clear all tasks?")) {
    tasks = [];
    updateLocalStorage();
  }
});

function enableEditMode(task, textSpan) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.text;
  input.classList.add("edit-input");
  textSpan.replaceWith(input);
  input.focus();

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveEdit(task, input);
  });

  input.addEventListener("blur", () => saveEdit(task, input));
}

function saveEdit(task, input) {
  const newText = input.value.trim();
  if (newText) {
    task.text = newText;
    updateLocalStorage();
  } else {
    alert("Task text cannot be empty!");
    input.focus();
  }
}
