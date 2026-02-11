// Manufacturing Schedule Application
// Global State
const state = {
    jobs: [],
    machinePriorities: [],
    editingJobId: null,
    editingSetupId: null,
    mfgPriorityOverrides: {},  // { jobId: 'critical'|'high'|'medium'|'low' }
    mfgPriorityNotes: {},      // { jobId: 'note text' }
    activeTab: 'schedule'
};

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// Machine List
const MACHINES = [
    '22', '55', '90-1', '90-2', '90-3', 'Sumi1',
    '170-1', '170-2', 'Sumi2', '260-1', '260-2', '260-3', '260-4',
    '500-1', '500-2', '550', '770', '950', '1100-1', '1100-2', '1200-1', '1200-2'
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadData();
});

// Initialize Application
function initializeApp() {
    createMachineColumns();
    loadMfgPriorityData();
    setupPriorityDragAndDrop();
    console.log('Manufacturing Schedule initialized');
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal controls
    const jobModal = document.getElementById('jobModal');
    const setupModal = document.getElementById('setupModal');
    const addJobBtn = document.getElementById('addJobBtn');
    const addSetupBtn = document.getElementById('addSetupBtn');
    const closeBtn = document.querySelector('.close');
    const closeSetupBtn = document.querySelector('.close-setup');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelSetupBtn = document.getElementById('cancelSetupBtn');

    // Open modals
    addJobBtn.addEventListener('click', () => openJobModal());
    addSetupBtn.addEventListener('click', () => openSetupModal());

    // Close modals
    closeBtn.addEventListener('click', () => closeModal(jobModal));
    closeSetupBtn.addEventListener('click', () => closeModal(setupModal));
    cancelBtn.addEventListener('click', () => closeModal(jobModal));
    cancelSetupBtn.addEventListener('click', () => closeModal(setupModal));

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === jobModal) closeModal(jobModal);
        if (e.target === setupModal) closeModal(setupModal);
    });

    // Form submissions
    document.getElementById('jobForm').addEventListener('submit', handleJobSubmit);
    document.getElementById('setupForm').addEventListener('submit', handleSetupSubmit);

    // Auto-calculate total hours
    const cycleTime = document.getElementById('cycleTime');
    const numParts = document.getElementById('numParts');
    const numCavities = document.getElementById('numCavities');

    [cycleTime, numParts, numCavities].forEach(input => {
        input?.addEventListener('input', calculateTotalHours);
    });

    // Percent complete sliders
    document.getElementById('percentComplete')?.addEventListener('input', (e) => {
        document.getElementById('percentCompleteValue').textContent = e.target.value;
    });

    document.getElementById('setupPercentComplete')?.addEventListener('input', (e) => {
        document.getElementById('setupPercentCompleteValue').textContent = e.target.value;
    });

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });

    // Other buttons
    document.getElementById('printBtn')?.addEventListener('click', handlePrint);
    document.getElementById('clearAllBtn')?.addEventListener('click', handleClearAll);
}

// Create Machine Columns
function createMachineColumns() {
    const scheduleBoard = document.getElementById('scheduleBoard');
    scheduleBoard.innerHTML = '';

    MACHINES.forEach(machine => {
        const column = document.createElement('div');
        column.className = 'machine-column';
        column.setAttribute('data-machine', machine);

        const priority = getMachinePriority(machine);

        column.innerHTML = `
            <div class="machine-header">
                <div class="machine-name">
                    <i class="fas fa-cog"></i>
                    ${machine}
                </div>
                <div class="machine-priority">Priority: ${priority}</div>
            </div>
            <div class="jobs-container" data-machine="${machine}">
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No jobs scheduled</p>
                </div>
            </div>
        `;

        scheduleBoard.appendChild(column);

        // Setup drag and drop
        const jobsContainer = column.querySelector('.jobs-container');
        setupDragAndDrop(jobsContainer);
    });
}

// Get Machine Priority
function getMachinePriority(machine) {
    const priority = state.machinePriorities.find(p => p.machine === machine);
    return priority ? priority.priority : 'N/A';
}

// Setup Drag and Drop
function setupDragAndDrop(container) {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    e.target.classList.add('dragging');

    const jobId = e.target.getAttribute('data-job-id');
    e.dataTransfer.setData('jobId', jobId);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
    return false;
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();

    const jobId = e.dataTransfer.getData('jobId');
    const targetMachine = e.currentTarget.getAttribute('data-machine');

    // Update job machine assignment
    updateJobMachine(jobId, targetMachine);

    e.currentTarget.classList.remove('drag-over');
    return false;
}

// Load Data from API
async function loadData() {
    try {
        showLoading();
        await Promise.all([
            loadJobs(),
            loadMachinePriorities()
        ]);
        renderJobs();
        if (state.activeTab === 'mfgPriorities') {
            renderMfgPriorities();
        }
        hideLoading();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Failed to load data. Using offline mode.', 'error');
        loadFromLocalStorage();
        hideLoading();
    }
}

async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (!response.ok) throw new Error('Failed to fetch jobs');
            const jobsData = await response.json();
                    state.jobs = jobsData.jobs || jobsData || [];
    } catch (error) {
        console.error('Error loading jobs:', error);
        throw error;
    }
}

async function loadMachinePriorities() {
    try {
        const response = await fetch(`${API_BASE_URL}/priorities`);
        if (!response.ok) throw new Error('Failed to fetch priorities');
        state.machinePriorities = await response.json();
                    if (!Array.isArray(state.machinePriorities)) {
                                        state.machinePriorities = state.machinePriorities.priorities || [];
                    }
        saveToLocalStorage('priorities', state.machinePriorities);
        createMachineColumns(); // Refresh columns with priorities
    } catch (error) {
        console.error('Error loading priorities:', error);
        throw error;
    }
}

// Render Jobs
function renderJobs() {
    // Clear all job containers
    document.querySelectorAll('.jobs-container').forEach(container => {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No jobs scheduled</p>
            </div>
        `;
    });

    // Group jobs by machine for cumulative hours calculation
    const jobsByMachine = {};
    state.jobs.forEach(job => {
        if (!jobsByMachine[job.machine]) {
            jobsByMachine[job.machine] = [];
        }
        jobsByMachine[job.machine].push(job);
    });

    // Render jobs into their assigned machines with cumulative hours
    Object.keys(jobsByMachine).forEach(machine => {
        const container = document.querySelector(`.jobs-container[data-machine="${machine}"]`);
        if (container) {
            // Remove empty state if it exists
            const emptyState = container.querySelector('.empty-state');
            if (emptyState) emptyState.remove();

            let cumulativeHours = 0;

            // Render each job with cumulative hours
            jobsByMachine[machine].forEach(job => {
                // Calculate remaining hours for this job
                const totalHours = job.type === 'setup' ? (job.setupHours || 0) : (job.totalHours || 0);
                const percentComplete = job.percentComplete || 0;
                const remainingHours = totalHours * (1 - percentComplete / 100);

                // Add to cumulative total
                cumulativeHours += remainingHours;

                // Create job card with cumulative hours
                const jobCard = createJobCard(job, cumulativeHours);
                container.appendChild(jobCard);
            });
        }
    });
}

// Create Job Card
function createJobCard(job, cumulativeHours = 0) {
    const card = document.createElement('div');

    // Add conditional class based on toolReady status for setup cards
    if (job.type === 'setup') {
        const readyClass = job.toolReady === 'yes' ? 'tool-ready' : 'tool-not-ready';
        card.className = `job-card setup-card ${readyClass}`;
    } else {
        card.className = 'job-card';
    }

    card.setAttribute('draggable', 'true');
    card.setAttribute('data-job-id', job.id);

    const dueDate = job.dueDate ? new Date(job.dueDate) : null;
    const today = new Date();
    const daysUntilDue = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;

    let dueDateClass = '';
    if (daysUntilDue !== null) {
        if (daysUntilDue < 0) dueDateClass = 'overdue';
        else if (daysUntilDue <= 3) dueDateClass = 'due-soon';
    }

    if (job.type === 'setup') {
        card.innerHTML = `
            <div class="job-header">
                <div>
                    <div class="job-name"><i class="fas fa-tools"></i> Tool #${job.toolNumber}</div>
                    <div class="work-order">Status: ${job.toolReady === 'yes' ? 'Ready' : 'Not Ready'}</div>
                </div>
                <div class="job-actions">
                    <button class="job-action-btn" draggable="false" onclick="editJob('${job.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="job-action-btn" draggable="false" onclick="deleteJob('${job.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="job-details">
                <div class="job-detail">
                    <i class="fas fa-hourglass-half"></i>
                    <span>${job.setupHours || 0} hrs</span>
                </div>
            </div>
            ${job.setupNotes ? `<div class="job-detail"><i class="fas fa-sticky-note"></i> ${job.setupNotes}</div>` : ''}
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
            </div>
            <div class="cumulative-hours">
                <i class="fas fa-calculator"></i>
                <span>Cumulative: ${cumulativeHours.toFixed(2)} hrs</span>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="job-header">
                <div>
                    <div class="job-name">${job.jobName}</div>
                    <div class="work-order">WO: ${job.workOrder}</div>
                </div>
                <div class="job-actions">
                    <button class="job-action-btn" draggable="false" onclick="editJob('${job.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="job-action-btn" draggable="false" onclick="deleteJob('${job.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${dueDate ? `<div class="due-date-indicator ${dueDateClass}">${formatDate(dueDate)}</div>` : ''}
            <div class="job-details">
                <div class="job-detail">
                    <i class="fas fa-cubes"></i>
                    <span>${job.numParts} parts</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-clock"></i>
                    <span>${job.cycleTime}s</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-layer-group"></i>
                    <span>${job.material}</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-hourglass-half"></i>
                    <span>${job.totalHours} hrs</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
            </div>
            <div class="cumulative-hours">
                <i class="fas fa-calculator"></i>
                <span>Cumulative: ${cumulativeHours.toFixed(2)} hrs</span>
            </div>
        `;
    }

    // Add drag event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    return card;
}

// Modal Functions
function openJobModal(jobId = null) {
    const modal = document.getElementById('jobModal');
    const form = document.getElementById('jobForm');
    const title = document.getElementById('modalTitle');

    form.reset();
    state.editingJobId = jobId;

    if (jobId) {
        title.textContent = 'Edit Job';
        const job = state.jobs.find(j => j.id === jobId);
        if (job) {
            document.getElementById('jobName').value = job.jobName || '';
            document.getElementById('workOrder').value = job.workOrder || '';
            document.getElementById('numParts').value = job.numParts || '';
            document.getElementById('cycleTime').value = job.cycleTime || '';
            document.getElementById('numCavities').value = job.numCavities || '';
            document.getElementById('material').value = job.material || '';
            document.getElementById('totalMaterial').value = job.totalMaterial || '';
            document.getElementById('totalHours').value = job.totalHours || '';
            document.getElementById('dueDate').value = job.dueDate || '';
            document.getElementById('percentComplete').value = job.percentComplete || 0;
            document.getElementById('percentCompleteValue').textContent = job.percentComplete || 0;
            document.getElementById('machineSelect').value = job.machine || '';
        }
    } else {
        title.textContent = 'Add New Job';
    }

    modal.classList.add('show');
}

function openSetupModal(jobId = null) {
    const modal = document.getElementById('setupModal');
    const form = document.getElementById('setupForm');
    const title = document.getElementById('setupModalTitle');

    form.reset();
    state.editingSetupId = jobId;

    if (jobId) {
        title.textContent = 'Edit Setup/Maintenance';
        const job = state.jobs.find(j => j.id === jobId);
        if (job) {
            document.getElementById('toolNumber').value = job.toolNumber || '';
            document.getElementById('toolReady').value = job.toolReady || '';
            document.getElementById('setupHours').value = job.setupHours || '';
            document.getElementById('setupNotes').value = job.setupNotes || '';
            document.getElementById('setupPercentComplete').value = job.percentComplete || 0;
            document.getElementById('setupPercentCompleteValue').textContent = job.percentComplete || 0;
            document.getElementById('setupMachineSelect').value = job.machine || '';
        }
    } else {
        title.textContent = 'Add Setup/Maintenance';
    }

    modal.classList.add('show');
}

function closeModal(modal) {
    modal.classList.remove('show');
    state.editingJobId = null;
    state.editingSetupId = null;
}

// Form Handlers
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
        machine: document.getElementById('machineSelect').value
    };

    try {
        if (state.editingJobId) {
            await updateJob(state.editingJobId, jobData);
            showToast('Job updated successfully', 'success');
        } else {
            await createJob(jobData);
            showToast('Job created successfully', 'success');
        }
        await loadJobs();
        renderJobs();
        if (state.activeTab === 'mfgPriorities') renderMfgPriorities();
    } catch (error) {
        console.error('Error saving job:', error);
        showToast('Failed to save job', 'error');
    } finally {
        closeModal(document.getElementById('jobModal'));
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
        machine: document.getElementById('setupMachineSelect').value
    };

    try {
        if (state.editingSetupId) {
            await updateJob(state.editingSetupId, setupData);
            showToast('Setup/Maintenance updated successfully', 'success');
        } else {
            await createJob(setupData);
            showToast('Setup/Maintenance created successfully', 'success');
        }
        await loadJobs();
        renderJobs();
        if (state.activeTab === 'mfgPriorities') renderMfgPriorities();
    } catch (error) {
        console.error('Error saving setup:', error);
        showToast('Failed to save setup/maintenance', 'error');
    } finally {
        closeModal(document.getElementById('setupModal'));
    }
}

// API Functions
async function createJob(jobData) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
    });
    if (!response.ok) throw new Error('Failed to create job');
    return await response.json();
}

async function updateJob(jobId, jobData) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
    });
    if (!response.ok) throw new Error('Failed to update job');
    return await response.json();
}

async function updateJobMachine(jobId, machine) {
    try {
        await updateJob(jobId, { machine });
        await loadJobs();
        renderJobs();
        if (state.activeTab === 'mfgPriorities') renderMfgPriorities();
        showToast('Job moved successfully', 'success');
    } catch (error) {
        console.error('Error updating job machine:', error);
        showToast('Failed to move job', 'error');
    }
}

// Global functions for inline event handlers
window.editJob = function(jobId) {
    const job = state.jobs.find(j => j.id === jobId);
    if (job) {
        if (job.type === 'setup') {
            openSetupModal(jobId);
        } else {
            openJobModal(jobId);
        }
    }
};

window.deleteJob = async function(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete job');

        showToast('Job deleted successfully', 'success');
        await loadJobs();
        renderJobs();
        if (state.activeTab === 'mfgPriorities') renderMfgPriorities();
    } catch (error) {
        console.error('Error deleting job:', error);
        showToast('Failed to delete job', 'error');
    }
};

// Utility Functions
function calculateTotalHours() {
    const cycleTime = parseFloat(document.getElementById('cycleTime')?.value) || 0;
    const numParts = parseInt(document.getElementById('numParts')?.value) || 0;
    const numCavities = parseInt(document.getElementById('numCavities')?.value) || 1;

    const totalSeconds = (cycleTime * numParts) / numCavities;
    const totalHours = (totalSeconds / 3600).toFixed(2);

    const totalHoursInput = document.getElementById('totalHours');
    if (totalHoursInput) {
        totalHoursInput.value = totalHours;
    }
}

function formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}

function handlePrint() {
    window.print();
}

async function handleClearAll() {
    if (!confirm('Are you sure you want to clear ALL jobs? This cannot be undone!')) return;

    try {
        // Delete all jobs
        const deletePromises = state.jobs.map(job =>
            fetch(`${API_BASE_URL}/jobs/${job.id}`, { method: 'DELETE' })
        );
        await Promise.all(deletePromises);

        showToast('All jobs cleared successfully', 'success');
        await loadJobs();
        renderJobs();
        if (state.activeTab === 'mfgPriorities') renderMfgPriorities();
    } catch (error) {
        console.error('Error clearing jobs:', error);
        showToast('Failed to clear jobs', 'error');
    }
}

// Local Storage Functions
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(`manufacturing-schedule-${key}`, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const jobs = localStorage.getItem('manufacturing-schedule-jobs');
        const priorities = localStorage.getItem('manufacturing-schedule-priorities');

        if (jobs) state.jobs = JSON.parse(jobs);
        if (priorities) state.machinePriorities = JSON.parse(priorities);

        createMachineColumns();
        renderJobs();
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// UI Helpers
function showLoading() {
    // Could add a loading overlay here
    console.log('Loading...');
}

function hideLoading() {
    // Hide loading overlay
    console.log('Loading complete');
}

function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-exclamation-circle' :
                 'fa-info-circle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Tab Navigation
// ============================================
function switchTab(tabName) {
    state.activeTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'schedule') {
        document.getElementById('scheduleTab').classList.add('active');
    } else if (tabName === 'mfgPriorities') {
        document.getElementById('mfgPrioritiesTab').classList.add('active');
        renderMfgPriorities();
    }
}

// ============================================
// MFG Priorities Tab
// ============================================

// Load saved priority overrides and notes from localStorage
function loadMfgPriorityData() {
    try {
        const overrides = localStorage.getItem('manufacturing-schedule-mfg-priority-overrides');
        const notes = localStorage.getItem('manufacturing-schedule-mfg-priority-notes');
        if (overrides) state.mfgPriorityOverrides = JSON.parse(overrides);
        if (notes) state.mfgPriorityNotes = JSON.parse(notes);
    } catch (error) {
        console.error('Error loading MFG priority data:', error);
    }
}

// Save priority overrides to localStorage
function saveMfgPriorityOverrides() {
    try {
        localStorage.setItem('manufacturing-schedule-mfg-priority-overrides', JSON.stringify(state.mfgPriorityOverrides));
    } catch (error) {
        console.error('Error saving MFG priority overrides:', error);
    }
}

// Save notes to localStorage
function saveMfgPriorityNotes() {
    try {
        localStorage.setItem('manufacturing-schedule-mfg-priority-notes', JSON.stringify(state.mfgPriorityNotes));
    } catch (error) {
        console.error('Error saving MFG priority notes:', error);
    }
}

// Get effective MFG priority for a job
function getJobMfgPriority(job) {
    // Check for a manual override first
    if (state.mfgPriorityOverrides[job.id]) {
        return state.mfgPriorityOverrides[job.id];
    }
    // Fall back to machine priority
    const machinePriority = getMachinePriority(job.machine);
    const validPriorities = ['critical', 'high', 'medium', 'low'];
    if (validPriorities.includes(machinePriority)) {
        return machinePriority;
    }
    return 'low'; // default
}

// Setup drag and drop for priority containers
function setupPriorityDragAndDrop() {
    document.querySelectorAll('.priority-jobs-container').forEach(container => {
        container.addEventListener('dragover', handlePriorityDragOver);
        container.addEventListener('drop', handlePriorityDrop);
        container.addEventListener('dragleave', handlePriorityDragLeave);
    });
}

function handlePriorityDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
    return false;
}

function handlePriorityDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handlePriorityDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const jobId = e.dataTransfer.getData('jobId');
    const targetPriority = e.currentTarget.getAttribute('data-priority');

    if (jobId && targetPriority) {
        // Update the job's MFG priority override
        state.mfgPriorityOverrides[jobId] = targetPriority;
        saveMfgPriorityOverrides();
        renderMfgPriorities();
        showToast(`Job moved to ${targetPriority} priority`, 'success');
    }

    e.currentTarget.classList.remove('drag-over');
    return false;
}

// Render all jobs into priority sections
function renderMfgPriorities() {
    const priorityLevels = ['critical', 'high', 'medium', 'low'];

    // Group jobs by their effective priority
    const jobsByPriority = { critical: [], high: [], medium: [], low: [] };

    state.jobs.forEach(job => {
        const priority = getJobMfgPriority(job);
        if (jobsByPriority[priority]) {
            jobsByPriority[priority].push(job);
        } else {
            jobsByPriority['low'].push(job);
        }
    });

    priorityLevels.forEach(priority => {
        const container = document.querySelector(`.priority-jobs-container[data-priority="${priority}"]`);
        if (!container) return;

        // Update count badge
        const countEl = document.getElementById(`${priority}Count`);
        if (countEl) countEl.textContent = jobsByPriority[priority].length;

        // Clear container
        container.innerHTML = '';

        if (jobsByPriority[priority].length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No ${priority} priority jobs</p>
                </div>
            `;
            return;
        }

        // Render each job with its note
        jobsByPriority[priority].forEach(job => {
            const row = createPriorityJobRow(job);
            container.appendChild(row);
        });
    });
}

// Create a priority job row (card + notes)
function createPriorityJobRow(job) {
    const row = document.createElement('div');
    row.className = 'priority-job-row';

    // Card wrapper
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'priority-job-card-wrapper';

    const card = createPriorityJobCard(job);
    cardWrapper.appendChild(card);

    // Note wrapper
    const noteWrapper = document.createElement('div');
    noteWrapper.className = 'priority-note-wrapper';

    const noteLabel = document.createElement('label');
    noteLabel.innerHTML = '<i class="fas fa-sticky-note"></i> Notes';

    const noteTextarea = document.createElement('textarea');
    noteTextarea.placeholder = 'Add notes for this job...';
    noteTextarea.value = state.mfgPriorityNotes[job.id] || '';

    const savedIndicator = document.createElement('div');
    savedIndicator.className = 'priority-note-saved';
    savedIndicator.textContent = 'Saved';

    let saveTimeout;
    noteTextarea.addEventListener('input', () => {
        state.mfgPriorityNotes[job.id] = noteTextarea.value;
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveMfgPriorityNotes();
            savedIndicator.classList.add('visible');
            setTimeout(() => savedIndicator.classList.remove('visible'), 1500);
        }, 500);
    });

    noteWrapper.appendChild(noteLabel);
    noteWrapper.appendChild(noteTextarea);
    noteWrapper.appendChild(savedIndicator);

    row.appendChild(cardWrapper);
    row.appendChild(noteWrapper);

    return row;
}

// Create a job card for the priority view (similar to schedule but with machine badge)
function createPriorityJobCard(job) {
    const card = document.createElement('div');

    if (job.type === 'setup') {
        const readyClass = job.toolReady === 'yes' ? 'tool-ready' : 'tool-not-ready';
        card.className = `job-card setup-card ${readyClass}`;
    } else {
        card.className = 'job-card';
    }

    card.setAttribute('draggable', 'true');
    card.setAttribute('data-job-id', job.id);

    const dueDate = job.dueDate ? new Date(job.dueDate) : null;
    const today = new Date();
    const daysUntilDue = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;

    let dueDateClass = '';
    if (daysUntilDue !== null) {
        if (daysUntilDue < 0) dueDateClass = 'overdue';
        else if (daysUntilDue <= 3) dueDateClass = 'due-soon';
    }

    if (job.type === 'setup') {
        card.innerHTML = `
            <div class="job-header">
                <div>
                    <div class="job-name"><i class="fas fa-tools"></i> Tool #${job.toolNumber}</div>
                    <div class="work-order">Status: ${job.toolReady === 'yes' ? 'Ready' : 'Not Ready'}</div>
                </div>
            </div>
            <div class="job-details">
                <div class="job-detail">
                    <i class="fas fa-hourglass-half"></i>
                    <span>${job.setupHours || 0} hrs</span>
                </div>
            </div>
            ${job.setupNotes ? `<div class="job-detail"><i class="fas fa-sticky-note"></i> ${job.setupNotes}</div>` : ''}
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
            </div>
            <div class="machine-badge"><i class="fas fa-cog"></i> Machine: ${job.machine}</div>
        `;
    } else {
        card.innerHTML = `
            <div class="job-header">
                <div>
                    <div class="job-name">${job.jobName}</div>
                    <div class="work-order">WO: ${job.workOrder}</div>
                </div>
            </div>
            ${dueDate ? `<div class="due-date-indicator ${dueDateClass}">${formatDate(dueDate)}</div>` : ''}
            <div class="job-details">
                <div class="job-detail">
                    <i class="fas fa-cubes"></i>
                    <span>${job.numParts} parts</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-clock"></i>
                    <span>${job.cycleTime}s</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-layer-group"></i>
                    <span>${job.material}</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-hourglass-half"></i>
                    <span>${job.totalHours} hrs</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
            </div>
            <div class="machine-badge"><i class="fas fa-cog"></i> Machine: ${job.machine}</div>
        `;
    }

    // Add drag event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    return card;
}
