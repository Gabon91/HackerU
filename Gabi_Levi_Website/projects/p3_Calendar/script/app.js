// ===== Intro Toggle =====
function startApp() {
    document.getElementById('project-intro').style.display = 'none';
    document.getElementById('calendar-container').style.display = '';
    initCalendar();
}

// ===== State =====
var currentDate = new Date();
var currentView = 'month';
var events = [];
var initialized = false;

var MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
var DAYS_HE = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

function initCalendar() {
    if (!initialized) {
        document.getElementById('prev-btn').addEventListener('click', navigatePrev);
        document.getElementById('next-btn').addEventListener('click', navigateNext);
        document.getElementById('add-event-btn').addEventListener('click', function () { openModal(null); });
        document.getElementById('save-event-btn').addEventListener('click', saveEvent);
        document.getElementById('cancel-event-btn').addEventListener('click', closeModal);
        document.getElementById('modal-overlay').addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });
        document.getElementById('export-btn').addEventListener('click', exportJSON);
        document.getElementById('import-btn').addEventListener('click', function () {
            document.getElementById('file-input').click();
        });
        document.getElementById('file-input').addEventListener('change', importJSON);

        var viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                currentView = btn.getAttribute('data-view');
                viewBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                render();
            });
        });

        initialized = true;
    }
    render();
}

// ===== Navigation =====
function navigatePrev() {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() - 7);
    } else {
        currentDate.setDate(currentDate.getDate() - 1);
    }
    render();
}

function navigateNext() {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
    } else {
        currentDate.setDate(currentDate.getDate() + 1);
    }
    render();
}

// ===== Render Router =====
function render() {
    document.getElementById('cal-month').style.display = currentView === 'month' ? '' : 'none';
    document.getElementById('cal-week').style.display = currentView === 'week' ? '' : 'none';
    document.getElementById('cal-day-view').style.display = currentView === 'day' ? '' : 'none';

    if (currentView === 'month') renderMonth();
    else if (currentView === 'week') renderWeek();
    else renderDay();
}

// ===== Month View =====
function renderMonth() {
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth();
    document.getElementById('cal-title').textContent = MONTHS_HE[month] + ' ' + year;

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var daysInPrev = new Date(year, month, 0).getDate();
    var today = new Date();

    var container = document.getElementById('cal-days');
    container.innerHTML = '';

    for (var i = firstDay - 1; i >= 0; i--) {
        var dayNum = daysInPrev - i;
        container.appendChild(createDayCell(dayNum, year, month - 1, true));
    }

    for (var d = 1; d <= daysInMonth; d++) {
        var isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
        container.appendChild(createDayCell(d, year, month, false, isToday));
    }

    var totalCells = firstDay + daysInMonth;
    var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (var n = 1; n <= remaining; n++) {
        container.appendChild(createDayCell(n, year, month + 1, true));
    }
}

function createDayCell(dayNum, year, month, isOther, isToday) {
    var div = document.createElement('div');
    div.className = 'cal-day';
    if (isOther) div.classList.add('other-month');
    if (isToday) div.classList.add('today');

    var numSpan = document.createElement('span');
    numSpan.className = 'day-number';
    numSpan.textContent = dayNum;
    div.appendChild(numSpan);

    var dateStr = formatDate(year, month, dayNum);
    var dayEvents = getEventsForDate(dateStr);
    if (dayEvents.length > 0) {
        var evDiv = document.createElement('div');
        evDiv.className = 'day-events';
        for (var e = 0; e < Math.min(dayEvents.length, 2); e++) {
            var tag = document.createElement('div');
            tag.className = 'day-event';
            tag.textContent = dayEvents[e].title;
            tag.title = 'לחץ למחיקה';
            attachDeleteHandler(tag, dayEvents[e]);
            evDiv.appendChild(tag);
        }
        if (dayEvents.length > 2) {
            var more = document.createElement('div');
            more.className = 'day-event';
            more.textContent = '+' + (dayEvents.length - 2) + ' עוד';
            evDiv.appendChild(more);
        }
        div.appendChild(evDiv);
    }

    div.addEventListener('click', function () { openModal(dateStr); });
    return div;
}

// ===== Week View =====
function renderWeek() {
    var today = new Date();
    var dayOfWeek = currentDate.getDay();
    var startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    var endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    document.getElementById('cal-title').textContent =
        startOfWeek.getDate() + ' - ' + endOfWeek.getDate() + ' ' + MONTHS_HE[endOfWeek.getMonth()] + ' ' + endOfWeek.getFullYear();

    var container = document.getElementById('cal-week');
    container.innerHTML = '';

    var grid = document.createElement('div');
    grid.className = 'week-grid';

    // Header row
    var corner = document.createElement('div');
    corner.className = 'week-header';
    corner.textContent = '';
    grid.appendChild(corner);

    for (var d = 0; d < 7; d++) {
        var colDate = new Date(startOfWeek);
        colDate.setDate(startOfWeek.getDate() + d);
        var header = document.createElement('div');
        header.className = 'week-header';
        if (colDate.toDateString() === today.toDateString()) header.classList.add('today-header');
        header.textContent = DAYS_HE[d] + ' ' + colDate.getDate();
        grid.appendChild(header);
    }

    // Hour rows (8-20)
    for (var h = 8; h <= 20; h++) {
        var timeCell = document.createElement('div');
        timeCell.className = 'week-time';
        timeCell.textContent = (h < 10 ? '0' : '') + h + ':00';
        grid.appendChild(timeCell);

        for (var d2 = 0; d2 < 7; d2++) {
            var colDate2 = new Date(startOfWeek);
            colDate2.setDate(startOfWeek.getDate() + d2);
            var dateStr = formatDate(colDate2.getFullYear(), colDate2.getMonth(), colDate2.getDate());
            var cell = document.createElement('div');
            cell.className = 'week-cell';

            var hourEvents = getEventsForDateAndHour(dateStr, h);
            for (var e = 0; e < hourEvents.length; e++) {
                var ev = document.createElement('div');
                ev.className = 'week-event';
                ev.textContent = hourEvents[e].title;
                ev.title = 'לחץ למחיקה';
                attachDeleteHandler(ev, hourEvents[e]);
                cell.appendChild(ev);
            }

            (function (ds) {
                cell.addEventListener('click', function () { openModal(ds); });
            })(dateStr);

            grid.appendChild(cell);
        }
    }

    container.appendChild(grid);
}

// ===== Day View =====
function renderDay() {
    var today = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth();
    var day = currentDate.getDate();
    var dateStr = formatDate(year, month, day);

    var isToday = currentDate.toDateString() === today.toDateString();
    document.getElementById('cal-title').textContent =
        DAYS_HE[currentDate.getDay()] + ', ' + day + ' ' + MONTHS_HE[month] + ' ' + year + (isToday ? ' (היום)' : '');

    var container = document.getElementById('cal-day-view');
    container.innerHTML = '';

    var hours = document.createElement('div');
    hours.className = 'day-hours';

    for (var h = 0; h < 24; h++) {
        var row = document.createElement('div');
        row.className = 'day-hour-row';

        var label = document.createElement('div');
        label.className = 'day-hour-label';
        label.textContent = (h < 10 ? '0' : '') + h + ':00';
        row.appendChild(label);

        var content = document.createElement('div');
        content.className = 'day-hour-content';

        var hourEvents = getEventsForDateAndHour(dateStr, h);
        for (var e = 0; e < hourEvents.length; e++) {
            var ev = document.createElement('div');
            ev.className = 'day-hour-event';
            ev.textContent = hourEvents[e].title;
            ev.title = 'לחץ למחיקה';
            attachDeleteHandler(ev, hourEvents[e]);
            content.appendChild(ev);
        }

        row.appendChild(content);

        (function (ds) {
            row.addEventListener('click', function () { openModal(ds); });
        })(dateStr);

        hours.appendChild(row);
    }

    container.appendChild(hours);
}

// ===== Modal =====
function openModal(dateStr) {
    document.getElementById('modal-overlay').style.display = '';
    document.getElementById('event-title').value = '';
    document.getElementById('event-desc').value = '';
    document.getElementById('event-time').value = '';

    if (dateStr) {
        document.getElementById('event-date').value = dateStr;
    } else {
        var t = new Date();
        document.getElementById('event-date').value = formatDate(t.getFullYear(), t.getMonth(), t.getDate());
    }
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

function saveEvent() {
    var date = document.getElementById('event-date').value;
    var time = document.getElementById('event-time').value;
    var title = document.getElementById('event-title').value.trim();
    var desc = document.getElementById('event-desc').value.trim();

    if (!title) {
        alert('נא להזין כותרת לאירוע');
        return;
    }

    events.push({
        date: date,
        time: time || '00:00',
        title: title,
        description: desc
    });

    closeModal();
    render();
}

// ===== Helpers =====
function formatDate(year, month, day) {
    var d = new Date(year, month, day);
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var dd = d.getDate();
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
}

function attachDeleteHandler(element, eventObj) {
    element.style.cursor = 'pointer';
    element.addEventListener('click', function (e) {
        e.stopPropagation();
        if (confirm('למחוק את האירוע "' + eventObj.title + '"?')) {
            var idx = events.indexOf(eventObj);
            if (idx > -1) {
                events.splice(idx, 1);
                render();
            }
        }
    });
}

function getEventsForDate(dateStr) {
    return events.filter(function (e) { return e.date === dateStr; });
}

function getEventsForDateAndHour(dateStr, hour) {
    return events.filter(function (e) {
        if (e.date !== dateStr) return false;
        var h = parseInt(e.time.split(':')[0]);
        return h === hour;
    });
}

// ===== Export / Import =====
function exportJSON() {
    var content = JSON.stringify(events, null, 2);
    var blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'calendar-events.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importJSON() {
    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var loaded = JSON.parse(e.target.result);
            if (Array.isArray(loaded)) {
                events = loaded;
                render();
            } else {
                alert('פורמט קובץ לא תקין');
            }
        } catch (err) {
            alert('שגיאה בקריאת הקובץ');
        }
    };
    reader.readAsText(file);
    fileInput.value = '';
}
