const form = document.getElementById("event-form");
const eventTitle = document.getElementById("event-title");
const eventDate = document.getElementById("event-date");
const category = document.getElementById("category");
const description = document.getElementById("description");
const container = document.getElementById("all-event-container");
const clearBtn = document.getElementById("clear-events-btn");
const sampleBtn = document.getElementById("add-sample-events-btn");
const keyDisplay = document.getElementById("key-display");
const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filter-category");
const sortOrder = document.getElementById("sort-order");
const eventCount = document.getElementById("event-count");
const themeToggle = document.getElementById("theme-toggle");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

let events = [];
let editMode = false;
let editId = null;

function saveEventsToStorage() {
    localStorage.setItem('events', JSON.stringify(events));
}

function loadEventsFromStorage() {
    const raw = localStorage.getItem('events');
    if (raw) {
        try {
            events = JSON.parse(raw);
        } catch (err) {
            events = [];
        }
    }
}

function updateEventCount() {
    eventCount.textContent = events.length;
}

form.addEventListener("submit", function(e) {
    e.preventDefault();
    const titleValue = eventTitle.value.trim();
    const dateValue = eventDate.value;
    const categoryValue = category.value;
    const descriptionValue = description.value.trim();

    if (!titleValue || !dateValue) {
        alert("Please fill required fields!");
        return;
    }

    if (editMode && editId) {
        events = events.map(ev => {
            if (ev.id === editId) {
                return Object.assign({}, ev, {
                    title: titleValue,
                    date: dateValue,
                    category: categoryValue,
                    description: descriptionValue
                });
            }
            return ev;
        });
        editMode = false;
        editId = null;
        cancelEditBtn.style.display = 'none';
        form.querySelector('.primary-btn').textContent = 'Add Event';
    } else {
        const newEvent = {
            id: Date.now(),
            title: titleValue,
            date: dateValue,
            category: categoryValue,
            description: descriptionValue
        };
        events.push(newEvent);
    }

    saveEventsToStorage();
    renderEvents();
    form.reset();
});

function renderEvents() {
    container.innerHTML = "";
    // apply search, filter, sort
    const query = searchInput.value.trim().toLowerCase();
    const filter = filterCategory.value;
    const sortVal = sortOrder.value;

    let toRender = events.slice();

    if (filter !== 'all') {
        toRender = toRender.filter(ev => ev.category === filter);
    }

    if (query) {
        toRender = toRender.filter(ev => ev.title.toLowerCase().includes(query));
    }

    if (toRender.length === 0) {
        container.innerHTML = `<p class="empty-text">No events match your search/filter.</p>`;
        updateEventCount();
        return;
    }

    if (sortVal === 'date-asc') {
        toRender.sort((a,b) => new Date(a.date) - new Date(b.date));
    } else {
        toRender.sort((a,b) => new Date(b.date) - new Date(a.date));
    }

    toRender.forEach(event => {
        const card = document.createElement("div");
        card.classList.add("event-card");

        const delBtn = document.createElement("button");
        delBtn.classList.add("delete-btn");
        delBtn.textContent = "X";
        delBtn.addEventListener("click", () => {
            events = events.filter(e => e.id !== event.id);
            saveEventsToStorage();
            renderEvents();
        });

        const editBtn = document.createElement('button');
        editBtn.classList.add('secondary-btn');
        editBtn.style.marginRight = '8px';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
            // populate form for editing
            editMode = true;
            editId = event.id;
            eventTitle.value = event.title;
            eventDate.value = event.date;
            category.value = event.category;
            description.value = event.description;
            form.querySelector('.primary-btn').textContent = 'Save Changes';
            cancelEditBtn.style.display = 'inline-block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const title = document.createElement("h4");
        title.textContent = event.title;

        const date = document.createElement("p");
        date.textContent = "Date: " + event.date;

        const cat = document.createElement("p");
        cat.textContent = "Category: " + event.category;

        const desc = document.createElement("p");
        desc.textContent = event.description;

        const actions = document.createElement('div');
        actions.style.position = 'absolute';
        actions.style.top = '12px';
        actions.style.right = '44px';
        actions.appendChild(editBtn);

        card.append(delBtn, actions, title, date, cat, desc);
        container.appendChild(card);
    });

    updateEventCount();
}

clearBtn.addEventListener("click", () => {
    if (!confirm('Clear all events?')) return;
    events = [];
    saveEventsToStorage();
    renderEvents();
});

sampleBtn.addEventListener("click", () => {

    const sampleEvents = [
        {
            id: Date.now() + 1,
            title: "Music Festival",
            date: "2026-04-10",
            category: "Entertainment",
            description: "Outdoor live music festival."
        },
        {
            id: Date.now() + 2,
            title: "Startup Meetup",
            date: "2026-05-05",
            category: "Networking",
            description: "Meet local entrepreneurs and investors."
        },
        {
            id: Date.now() + 3,
            title: "Web Development Workshop",
            date: "2026-06-20",
            category: "Workshop",
            description: "Hands-on coding session."
        },
        {
            id: Date.now() + 4,
            title: "AI Conference 2026",
            date: "2026-07-18",
            category: "Conference",
            description: "Future of Artificial Intelligence."
        }
    ];

    events = [...events, ...sampleEvents];
    saveEventsToStorage();
    renderEvents();
});

document.addEventListener("keydown", function(e) {
    keyDisplay.textContent = "You Pressed: " + e.key;
    // quick shortcut: press 'n' to focus new event title
    if (e.key === 'n' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        eventTitle.focus();
        e.preventDefault();
    }
});

// search, filter, sort listeners
searchInput.addEventListener('input', () => renderEvents());
filterCategory.addEventListener('change', () => renderEvents());
sortOrder.addEventListener('change', () => renderEvents());

cancelEditBtn.addEventListener('click', () => {
    editMode = false;
    editId = null;
    form.reset();
    cancelEditBtn.style.display = 'none';
    form.querySelector('.primary-btn').textContent = 'Add Event';
});

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    localStorage.setItem('theme-dark', isDark ? '1' : '0');
    updateThemeButton();
});

// initialize from storage and theme
loadEventsFromStorage();
if (localStorage.getItem('theme-dark') === '1') {
    document.body.classList.add('theme-dark');
}

function updateThemeButton() {
    if (!themeToggle) return;
    if (document.body.classList.contains('theme-dark')) {
        themeToggle.textContent = 'Light Theme';
    } else {
        themeToggle.textContent = 'Dark Theme';
    }
}

updateThemeButton();
renderEvents();
