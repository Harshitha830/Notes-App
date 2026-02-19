let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentFilter = 'all';
let editingId = null;

function updateStats() {
    document.getElementById('totalNotes').textContent = notes.length;
    document.getElementById('highPriority').textContent = notes.filter(n => n.priority === 'high').length;
    document.getElementById('pinnedNotes').textContent = notes.filter(n => n.pinned).length;
    document.getElementById('academicNotes').textContent = notes.filter(n => n.category === 'academic').length;
}

function renderNotes(notesToRender = notes) {
    const container = document.getElementById('notesContainer');
    container.innerHTML = notesToRender.map(note => `
        <div class="note-card ${note.priority}" data-category="${note.category}">
            <div class="note-header">
                <h3>${note.title}</h3>
                <div class="note-actions">
                    <button onclick="togglePin(${note.id})">${note.pinned ? '📌' : '📍'}</button>
                    <button onclick="editNote(${note.id})">✏️</button>
                    <button onclick="deleteNote(${note.id})">🗑️</button>
                </div>
            </div>
            <p>${note.description}</p>
            <div class="note-meta">
                <span class="category">${note.category}</span>
                <span class="priority">${note.priority}</span>
                <span class="date">${new Date(note.date).toLocaleDateString()}</span>
            </div>
            ${note.tags ? `<div class="tags">${note.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}</div>` : ''}
        </div>
    `).join('');
}

function openModal() {
    document.getElementById('noteModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Add New Note';
    document.getElementById('noteForm').reset();
    editingId = null;
}

function closeModal() {
    document.getElementById('noteModal').style.display = 'none';
}

function saveNote(event) {
    event.preventDefault();
    const title = document.getElementById('noteTitle').value;
    const description = document.getElementById('noteDescription').value;
    
    if (description.length < 10) {
        alert('Description must be at least 10 characters long');
        return;
    }
    
    const note = {
        id: editingId || Date.now(),
        title,
        description,
        category: document.getElementById('noteCategory').value,
        priority: document.getElementById('notePriority').value,
        tags: document.getElementById('noteTags').value,
        date: editingId ? notes.find(n => n.id === editingId).date : new Date().toISOString(),
        pinned: editingId ? notes.find(n => n.id === editingId).pinned : false
    };
    
    if (editingId) {
        const index = notes.findIndex(n => n.id === editingId);
        notes[index] = note;
    } else {
        notes.unshift(note);
    }
    
    localStorage.setItem('notes', JSON.stringify(notes));
    closeModal();
    filterNotes(currentFilter);
    updateStats();
}

function searchNotes() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.description.toLowerCase().includes(query) ||
        (note.tags && note.tags.toLowerCase().includes(query))
    );
    renderNotes(filtered);
}

function filterNotes(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    let filtered = notes;
    if (filter !== 'all') {
        filtered = notes.filter(note => {
            if (filter === 'pinned') return note.pinned;
            if (filter === 'high') return note.priority === 'high';
            return note.category === filter;
        });
    }
    renderNotes(filtered);
}

function togglePin(id) {
    const note = notes.find(n => n.id === id);
    note.pinned = !note.pinned;
    localStorage.setItem('notes', JSON.stringify(notes));
    filterNotes(currentFilter);
    updateStats();
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteDescription').value = note.description;
    document.getElementById('noteCategory').value = note.category;
    document.getElementById('notePriority').value = note.priority;
    document.getElementById('noteTags').value = note.tags || '';
    document.getElementById('modalTitle').textContent = 'Edit Note';
    editingId = id;
    openModal();
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
        filterNotes(currentFilter);
        updateStats();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const btn = document.querySelector('.theme-toggle');
    btn.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
}

document.getElementById('noteDescription').addEventListener('input', function() {
    document.getElementById('charCount').textContent = `${this.value.length} characters`;
});

document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    renderNotes();
});