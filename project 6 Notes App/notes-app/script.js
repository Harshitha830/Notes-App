class NotesApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTheme();
        this.displayNotes();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('addNoteBtn').addEventListener('click', () => this.openModal());
        document.getElementById('noteForm').addEventListener('submit', (e) => this.saveNote(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchNotes(e.target.value));
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterNotes(e.target.dataset.filter));
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('noteModal')) {
                this.closeModal();
            }
        });
    }

    openModal(noteId = null) {
        const modal = document.getElementById('noteModal');
        const form = document.getElementById('noteForm');
        const title = document.getElementById('modalTitle');
        
        if (noteId) {
            const note = this.notes.find(n => n.id === noteId);
            title.textContent = 'Edit Note';
            document.getElementById('noteId').value = note.id;
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteDescription').value = note.description;
            document.getElementById('noteCategory').value = note.category;
            document.getElementById('notePriority').value = note.priority;
        } else {
            title.textContent = 'Add New Note';
            form.reset();
            document.getElementById('noteId').value = '';
        }
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('noteModal').style.display = 'none';
    }

    saveNote(e) {
        e.preventDefault();
        
        const id = document.getElementById('noteId').value;
        const title = document.getElementById('noteTitle').value.trim();
        const description = document.getElementById('noteDescription').value.trim();
        const category = document.getElementById('noteCategory').value;
        const priority = document.getElementById('notePriority').value;

        if (!title || !description || description.length < 10) {
            alert('Please fill all fields. Description must be at least 10 characters.');
            return;
        }

        const noteData = {
            id: id || Date.now(),
            title,
            description,
            category,
            priority,
            pinned: false,
            dateCreated: id ? this.notes.find(n => n.id == id).dateCreated : new Date().toLocaleDateString(),
            lastModified: new Date().toLocaleDateString()
        };

        if (id) {
            const index = this.notes.findIndex(n => n.id == id);
            this.notes[index] = { ...this.notes[index], ...noteData };
        } else {
            this.notes.unshift(noteData);
        }

        this.saveToStorage();
        this.displayNotes();
        this.updateStats();
        this.closeModal();
    }

    deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== id);
            this.saveToStorage();
            this.displayNotes();
            this.updateStats();
        }
    }

    togglePin(id) {
        const note = this.notes.find(n => n.id === id);
        note.pinned = !note.pinned;
        this.saveToStorage();
        this.displayNotes();
    }

    searchNotes(query) {
        const filtered = this.notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.description.toLowerCase().includes(query.toLowerCase()) ||
            note.category.toLowerCase().includes(query.toLowerCase())
        );
        this.displayFilteredNotes(filtered);
    }

    filterNotes(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.displayNotes();
    }

    displayNotes() {
        let filtered = this.currentFilter === 'all' ? 
            this.notes : 
            this.notes.filter(note => note.category === this.currentFilter);
        
        this.displayFilteredNotes(filtered);
    }

    displayFilteredNotes(notes) {
        const container = document.getElementById('notesContainer');
        
        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>📝 No notes found</h3>
                    <p>Create your first note to get started!</p>
                </div>
            `;
            return;
        }

        const sortedNotes = notes.sort((a, b) => b.pinned - a.pinned);
        
        container.innerHTML = sortedNotes.map(note => `
            <div class="note-card ${note.pinned ? 'pinned' : ''}">
                <div class="note-header">
                    <div class="note-title">${note.title}</div>
                    <div class="note-actions">
                        <button class="action-btn" onclick="app.togglePin(${note.id})" title="Pin">
                            ${note.pinned ? '📌' : '📍'}
                        </button>
                        <button class="action-btn" onclick="app.openModal(${note.id})" title="Edit">✏️</button>
                        <button class="action-btn" onclick="app.deleteNote(${note.id})" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="note-description">${note.description}</div>
                <div class="note-meta">
                    <span class="category-badge">${note.category}</span>
                    <span class="priority-badge priority-${note.priority.toLowerCase()}">${note.priority}</span>
                    <span class="note-date">${note.dateCreated}</span>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        document.getElementById('totalNotes').textContent = this.notes.length;
        document.getElementById('highPriority').textContent = 
            this.notes.filter(note => note.priority === 'High').length;
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        localStorage.setItem('theme', newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    saveToStorage() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }
}

const app = new NotesApp();