// Manufacturing Schedule - Main JavaScript
// API Configuration
const API_BASE_URL = 'https://manufacturing-schedule-7575b6f1cdb3.herokuapp.com/api';
// Machine list
const machines = [
    '22', '55', '90-1', '90-2', '90-3', 'Sumi1', '170-1', '170-2', 'Sumi2',
    '260-1', '260-2', '260-3', '260-4', '500-1', '500-2', '550',
    '770', '950', '1100-1', '1100-2', '1200-1', '1200-2'
];

// Global state
let jobs = [];
let machinePriorities = {};
let editingJobId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    loadJobs();
    loadPriorities();
    setupEventListeners();
});

// Initialize schedule board
function initializeBoard() {
    const board = document.getElementById('scheduleBoard');
    board.innerHTML = '';

    machines.forEach(machine => {
        const column = createMachineColumn(machine);
        board.appendChild(column);
    });
}

// Create machine column
function createMachineColumn(machine) {
    const column = document.createElement('div');
    column.className = 'machine-column';
    column.dataset.machine = machine;

    column.innerHTML = `
        <div class="machine-header">
            <span class="machine-name">${machine}</span>
            <select class="priority-selector" data-machine="${machine}">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
            </select>
        </div>
    `;

    // Enable drag and drop
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);

    return column;
}

// Setup event listeners
function setupEventListeners() {
    // Modal controls
    document.getElementById('addJobBtn').addEventListener('click', () => openJobModal());
    document.getElementById('addSetupBtn').addEventListener('click', () => openSetupModal());
    document.querySelector('.close').addEventListener('click', closeJobModal);
    document.querySelector('.close-setup').addEventListener('click', closeSetupModal);
    document.getElementById('cancelBtn').addEventListener('click', closeJobModal);
    document.getElementById('cancelSetupBtn').addEventListener('click', closeSetupModal);

    // Form submissions
    document.getElementById('jobForm').addEventListener('submit', handleJobSubmit);
    document.getElementById('setupForm').addEventListener('submit', handleSetupSubmit);

    // Other buttons
    document.getElementById('printBtn').addEventListener('click', () => window.print());
    document.getElementById('clearAllBtn').addEventListener('click', handleClearAll);

    // Auto-calculate total hours
    ['numParts', 'cycleTime', 'numCavities'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateTotalHours);
    });

    // Percent complete sliders
    document.getElementById('percentComplete').addEventListener('input', (e) => {
        document.getElementById('percentCompleteValue').textContent = e.target.value;
    });

    document.getElementById('setupPercentComplete').addEventListener('input', (e) => {
        document.getElementById('setupPercentCompleteValue').textContent = e.target.value;
    });

    // Priority change
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('priority-selector')) {
            updatePriority(e.target.dataset.machine, e.target.value);
        }
    });
}

// Calculate total hours
function calculateTotalHours() {
    const numParts = parseFloat(document.getElementById('numParts').value) || 0;
    const cycleTime = parseFloat(document.getElementById('cycleTime').value) || 0;
    const numCavities = parseFloat(document.getElementById('numCavities').value) || 1;

    const totalHours = (numParts * cycleTime) / (numCavities * 3600);
    document.getElementById('totalHours').value = totalHours.toFixed(2);
}

// Load jobs from API
async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (!response.ok) throw new Error('Failed to load jobs');

        const data = await response.json();
        jobs = data.jobs || [];
        renderJobs();
    } catch (error) {
        console.error('Error loading jobs:', error);
        // Fallback to empty array if API not available
        jobs = [];
        renderJobs();
    }
}

// Load priorities from API
async function loadPriorities() {
    try {
        const response = await fetch(`${API_BASE_URL}/priorities`);
        if (!response.ok) throw new Error('Failed to load priorities');

        const data = await response.json();
        machinePriorities = data || {};
        updatePrioritySelectors();
    } catch (error) {
        console.error('Error loading priorities:', error);
        // Fallback to default priorities
        machines.forEach(machine => {
            machinePriorities[machine] = 'medium';
        });
        updatePrioritySelectors();
    }
}

// Render jobs on board
function renderJobs() {
    // Clear all columns
    document.querySelectorAll('.machine-column').forEach(column => {
        const header = column.querySelector('.machine-header');
        column.innerHTML = '';
        column.appendChild(header);
    });

    // Add jobs to columns
    jobs.forEach(job => {
        const column = document.querySelector(`[data-machine="${job.machine}"]`);
        if (column) {
            column.appendChild(createJobCard(job));
        }
    });
}

// Create job card
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = `job-card ${job.type === 'setup' ? 'setup' : ''}`;
    card.draggable = true;
    card.dataset.jobId = job.id;

    if (job.type === 'setup') {
        card.innerHTML = `
            <div class="job-title">
                <span><i class="fas fa-tools"></i> Tool ${job.toolNumber}</span>
                <button class="btn-delete" onclick="deleteJob('${job.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="job-info"><i class="fas fa-check-circle"></i> Ready: ${job.toolReady}</div>
            <div class="job-info"><i class="fas fa-hourglass-half"></i> ${job.setupHours} hours</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="job-title">
                <span>${job.jobName}</span>
                <button class="btn-delete" onclick="deleteJob('${job.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="job-info"><i class="fas fa-file-alt"></i> WO: ${job.workOrder}</div>
            <div class="job-info"><i class="fas fa-cubes"></i> ${job.numParts} parts</div>
            <div class="job-info"><i class="fas fa-hourglass-half"></i> ${job.totalHours} hrs</div>
            <div class="job-info"><i class="fas fa-calendar-alt"></i> Due: ${job.dueDate}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
            </div>
        `;
    }

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dblclick', () => editJob(job.id));

    return card;
}

// Drag and drop handlers
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const draggedCard = document.querySelector('.dragging');
    if (draggedCard && this.classList.contains('machine-column')) {
        const jobId = draggedCard.dataset.jobId;
        const newMachine = this.dataset.machine;

        // Update job machine
        updateJobMachine(jobId, newMachine);
    }

    return false;
}

// Update job machine
async function updateJobMachine(jobId, newMachine) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    job.machine = newMachine;

    try {
        await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ machine: newMachine })
        });
        renderJobs();
    } catch (error) {
        console.error('Error updating job:', error);
        renderJobs();
    }
}

// Modal functions
function openJobModal(job = null) {
    const modal = document.getElementById('jobModal');
    const form = document.getElementById('jobForm');

    if (job) {
        // Edit mode
        editingJobId = job.id;
        document.getElementById('modalTitle').textContent = 'Edit Job';
        document.getElementById('jobName').value = job.jobName;
        document.getElementById('workOrder').value = job.workOrder;
        document.getElementById('numParts').value = job.numParts;
        document.getElementById('cycleTime').value = job.cycleTime;
        document.getElementById('numCavities').value = job.numCavities;
        document.getElementById('material').value = job.material;
        document.getElementById('totalMaterial').value = job.totalMaterial;
        document.getElementById('totalHours').value = job.totalHours;
        document.getElementById('dueDate').value = job.dueDate;
        document.getElementById('percentComplete').value = job.percentComplete || 0;
        document.getElementById('percentCompleteValue').textContent = job.percentComplete || 0;
        document.getElementById('machineSelect').value = job.machine;
    } else {
        // Add mode
        editingJobId = null;
        document.getElementById('modalTitle').textContent = 'Add New Job';
        form.reset();
    }

    modal.style.display = 'block';
}

function closeJobModal() {
    document.getElementById('jobModal').style.display = 'none';
    editingJobId = null;
}

function openSetupModal() {
    document.getElementById('setupModal').style.display = 'block';
}

function closeSetupModal() {
    document.getElementById('setupModal').style.display = 'none';
}

// Form submission handlers
async function handleJobSubmit(e) {
    e.preventDefault();

    const jobData = {
        type: 'job',
        jobName: document.getElementById('jobName').value,
        workOrder: document.getElementById('workOrder').value,
        numParts: parseInt(document.getElementById('numParts').value),
        cycleTime: parseFloat(document.getElementById('cycleTime').value),
        numCavities: parseInt(document.getElementById('numCavities').value),
        material: document.getElementById('material').value,
        totalMaterial: parseFloat(document.getElementById('totalMaterial').value),
        totalHours: parseFloat(document.getElementById('totalHours').value),
        dueDate: document.getElementById('dueDate').value,
        percentComplete: parseInt(document.getElementById('percentComplete').value),
        machine: document.getElementById('machineSelect').value,
        id: editingJobId || `job_${Date.now()}`
    };

    try {
        if (editingJobId) {
            // Update existing job
            await fetch(`${API_BASE_URL}/jobs/${editingJobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
            const index = jobs.findIndex(j => j.id === editingJobId);
            if (index !== -1) jobs[index] = jobData;
        } else {
            // Create new job
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
            const data = await response.json();
            jobs.push(data.job || jobData);
        }

        renderJobs();
        closeJobModal();
    } catch (error) {
        console.error('Error saving job:', error);
        // Fallback to local storage
        if (editingJobId) {
            const index = jobs.findIndex(j => j.id === editingJobId);
            if (index !== -1) jobs[index] = jobData;
        } else {
            jobs.push(jobData);
        }
        renderJobs();
        closeJobModal();
    }
}

async function handleSetupSubmit(e) {
    e.preventDefault();

    const setupData = {
        type: 'setup',
        toolNumber: document.getElementById('toolNumber').value,
        toolReady: document.getElementById('toolReady').value,
        setupHours: parseFloat(document.getElementById('setupHours').value),
        setupNotes: document.getElementById('setupNotes').value,
        percentComplete: parseInt(document.getElementById('setupPercentComplete').value),
        machine: document.getElementById('setupMachineSelect').value,
        id: `setup_${Date.now()}`
    };

    try {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setupData)
        });
        const data = await response.json();
        jobs.push(data.job || setupData);

        renderJobs();
        closeSetupModal();
    } catch (error) {
        console.error('Error saving setup:', error);
        // Fallback to local storage
        jobs.push(setupData);
        renderJobs();
        closeSetupModal();
    }
}

// Delete job
async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
        await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
            method: 'DELETE'
        });
        jobs = jobs.filter(j => j.id !== jobId);
        renderJobs();
    } catch (error) {
        console.error('Error deleting job:', error);
        // Fallback to local deletion
        jobs = jobs.filter(j => j.id !== jobId);
        renderJobs();
    }
}

// Edit job
function editJob(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
        openJobModal(job);
    }
}

// Update priority
async function updatePriority(machine, priority) {
    machinePriorities[machine] = priority;

    try {
        await fetch(`${API_BASE_URL}/priorities/${machine}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority })
        });
    } catch (error) {
        console.error('Error updating priority:', error);
    }
}

// Update priority selectors
function updatePrioritySelectors() {
    document.querySelectorAll('.priority-selector').forEach(select => {
        const machine = select.dataset.machine;
        select.value = machinePriorities[machine] || 'medium';
    });
}

// Clear all
function handleClearAll() {
    if (!confirm('Are you sure you want to clear all jobs? This cannot be undone.')) return;

    jobs = [];
    renderJobs();
}
