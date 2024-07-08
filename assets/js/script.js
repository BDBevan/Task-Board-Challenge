// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Todo: create a function to create a task card
// Function to create a task card
function createTaskCard(task) {
  let cardColor = '';
  const now = dayjs();
  const deadline = dayjs(task.deadline);
  if (now.isAfter(deadline)) {
    cardColor = 'bg-danger text-white';
  } else if (now.add(2, 'day').isAfter(deadline)) {
    cardColor = 'bg-warning';
  }

  return `
    <div class="card ${cardColor} mb-3" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;
}

// Todo: create a function to render the task list and make cards draggable
// Function to render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();

  taskList.forEach(task => {
    const cardHtml = createTaskCard(task);
    if (task.status === 'to-do') {
      $('#todo-cards').append(cardHtml);
    } else if (task.status === 'in-progress') {
      $('#in-progress-cards').append(cardHtml);
    } else if (task.status === 'done') {
      $('#done-cards').append(cardHtml);
    }
  });

  applyDraggable();
  $('.delete-task').click(handleDeleteTask);
}


// Todo: create a function to handle dropping a task into a new status lane
// Function to apply draggable and droppable
function applyDraggable() {
  $('.card').draggable({
    revert: "invalid",
    start: function (event, ui) {
      $(this).addClass('dragging');
      ui.helper.css('z-index', 9999);
    },
    stop: function (event, ui) {
      $(this).removeClass('dragging');
    }
  });

  $('.lane .card-body').droppable({
    accept: '.card',
    hoverClass: 'bg-primary',
    drop: function (event, ui) {
      const taskId = ui.draggable.data('id');
      const newStatus = $(this).closest('.lane').attr('id').replace('-cards', '');

      const task = taskList.find(task => task.id === taskId);
      task.status = newStatus;

      localStorage.setItem('tasks', JSON.stringify(taskList));
      renderTaskList();
    }
  });
}

// Todo: create a function to handle adding a new task
// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#taskTitle').val();
  const description = $('#taskDescription').val();
  const deadline = $('#taskDeadline').val();

  if (title && description && deadline) {
    const newTask = {
      id: generateTaskId(),
      title: title,
      description: description,
      deadline: deadline,
      status: 'to-do'
    };

    taskList.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    localStorage.setItem('nextId', JSON.stringify(nextId));

    renderTaskList();
  }

  $('#formModal').modal('hide');
}


// Todo: create a function to handle deleting a task
// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.card').data('id');
  taskList = taskList.filter(task => task.id !== taskId);

  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
// Initialize the page
$(document).ready(function () {
  renderTaskList();

  $('#addTaskForm').submit(handleAddTask);
  $('#taskDeadline').datepicker({
    dateFormat: 'yy-mm-dd'
  });

  // Make sure the swimlanes are not draggable
  $('.lane').draggable({
    disabled: true
  });
});
