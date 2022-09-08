/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
let tasks = {};

const createTask = function (taskText, taskDate, taskList) {
    // create elements that make up a task item
    const taskLi = $('<li>').addClass('list-group-item');
    const taskSpan = $('<span>').addClass('badge badge-primary badge-pill').text(taskDate);
    const taskP = $('<p>').addClass('m-1').text(taskText);

    // append span and p element to parent li
    taskLi.append(taskSpan, taskP);

    // append to ul list on the page
    $(`#list-${taskList}`).append(taskLi);
};

const loadTasks = function () {
    tasks = JSON.parse(localStorage.getItem('tasks'));

    // if nothing in localStorage, create a new object to track all task status arrays
    if (!tasks) {
        tasks = {
            toDo: [],
            inProgress: [],
            inReview: [],
            done: [],
        };
    }

    // loop over object properties
    $.each(tasks, (list, arr) => {
        console.log(list, arr);
        // then loop over sub-array
        arr.forEach((task) => {
            createTask(task.text, task.date, list);
        });
    });
};

const saveTasks = function () {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// enable draggable/sortable feature on list-group elements
$('.card .list-group').sortable({
    // enable dragging across lists
    connectWith: $('.card .list-group'),
    scroll: false,
    tolerance: 'pointer',
    helper: 'clone',
    activate(event, ui) {
        console.log(ui);
    },
    deactivate(event, ui) {
        console.log(ui);
    },
    over(event) {
        console.log(event);
    },
    out(event) {
        console.log(event);
    },
    update() {
        const tempArr = [];

        // loop over current set of children in sortable list
        $(this)
            .children()
            .each(function () {
                // save values in temp array
                tempArr.push({
                    text: $(this).find('p').text().trim(),
                    date: $(this).find('span').text().trim(),
                });
            });

        // trim down list's ID to match object property
        const arrName = $(this).attr('id').replace('list-', '');

        // update array on tasks object and save
        tasks[arrName] = tempArr;
        saveTasks();
    },
    stop(event) {
        $(this).removeClass('dropover');
    },
});

// trash icon can be dropped onto
$('#trash').droppable({
    accept: '.card .list-group-item',
    tolerance: 'touch',
    drop(event, ui) {
        // remove dragged element from the dom
        ui.draggable.remove();
    },
    over(event, ui) {
        console.log(ui);
    },
    out(event, ui) {
        console.log(ui);
    },
});

// modal was triggered
$('#task-form-modal').on('show.bs.modal', () => {
    // clear values
    $('#modalTaskDescription, #modalDueDate').val('');
});

// modal is fully visible
$('#task-form-modal').on('shown.bs.modal', () => {
    // highlight textarea
    $('#modalTaskDescription').trigger('focus');
});

// save button in modal was clicked
$('#task-form-modal .btn-primary').click(() => {
    // get form values
    const taskText = $('#modalTaskDescription').val();
    const taskDate = $('#modalDueDate').val();

    if (taskText && taskDate) {
        createTask(taskText, taskDate, 'toDo');

        // close modal
        $('#task-form-modal').modal('hide');

        // save in tasks array
        tasks.toDo.push({
            text: taskText,
            date: taskDate,
        });

        saveTasks();
    }
});

// task text was clicked
$('.list-group').on('click', 'p', function () {
    // get current text of p element
    const text = $(this).text().trim();

    // replace p element with a new textarea
    const textInput = $('<textarea>').addClass('form-control').val(text);
    $(this).replaceWith(textInput);

    // auto focus new element
    textInput.trigger('focus');
});

// editable field was un-focused
$('.list-group').on('blur', 'textarea', function () {
    // get current value of textarea
    const text = $(this).val();

    // get status type and position in the list
    const status = $(this).closest('.list-group').attr('id').replace('list-', '');
    const index = $(this).closest('.list-group-item').index();

    // update task in array and re-save to localstorage
    tasks[status][index].text = text;
    saveTasks();

    // recreate p element
    const taskP = $('<p>').addClass('m-1').text(text);

    // replace textarea with new content
    $(this).replaceWith(taskP);
});

// due date was clicked
$('.list-group').on('click', 'span', function () {
    // get current text
    const date = $(this).text().trim();

    // create new input element
    const dateInput = $('<input>').attr('type', 'text').addClass('form-control').val(date);
    $(this).replaceWith(dateInput);

    // automatically bring up the calendar
    dateInput.trigger('focus');
});

// value of due date was changed
$('.list-group').on('change', "input[type='text']", function () {
    const date = $(this).val();

    // get status type and position in the list
    const status = $(this).closest('.list-group').attr('id').replace('list-', '');
    const index = $(this).closest('.list-group-item').index();

    // update task in array and re-save to localstorage
    tasks[status][index].date = date;
    saveTasks();

    // recreate span and insert in place of input element
    const taskSpan = $('<span>').addClass('badge badge-primary badge-pill').text(date);
    $(this).replaceWith(taskSpan);
});

// remove all tasks
$('#remove-tasks').on('click', () => {
    for (const key in tasks) {
        tasks[key].length = 0;
        $(`#list-${key}`).empty();
    }
    console.log(tasks);
    saveTasks();
});

// load tasks for the first time
loadTasks();
