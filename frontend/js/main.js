// Manufacturing Schedule Application
// Global State
const state = {
    jobs: [],
    machinePriorities: [],
    editingJobId: null,
    editingSetupId: null,
    archivingJobId: null,
    currentTab: 'schedule'
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
    console.log('Manufacturing Schedule initialized');
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal controls
    const jobModal = document.getElementById('jobModal');
    const setupModal = document.getElementById('setupModal');
    const archiveModal = document.getElementById('archiveModal');
    const addJobBtn = document.getElementById('addJobBtn');
    const addSetupBtn = document.getElementById('addSetupBtn');
    const closeBtn = document.querySelector('.close');
    const closeSetupBtn = document.querySelector('.close-setup');
    const closeArchiveBtn = document.querySelector('.close-archive');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelSetupBtn = document.getElementById('cancelSetupBtn');
    const cancelArchiveBtn = document.getElementById('cancelArchiveBtn');

    // Open modals
    addJobBtn.addEventListener('click', () => openJobModal());
    addSetupBtn.addEventListener('click', () => openSetupModal());

    // Close modals
    closeBtn.addEventListener('click', () => closeModal(jobModal));
    closeSetupBtn.addEventListener('click', () => closeModal(setupModal));
    closeArchiveBtn.addEventListener('click', () => closeModal(archiveModal));
    cancelBtn.addEventListener('click', () => closeModal(jobModal));
    cancelSetupBtn.addEventListener('click', () => closeModal(setupModal));
    cancelArchiveBtn.addEventListener('click', () => closeModal(archiveModal));

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === jobModal) closeModal(jobModal);
        if (e.target === setupModal) closeModal(setupModal);
        if (e.target === archiveModal) closeModal(archiveModal);
    });

    // Form submissions
    document.getElementById('jobForm').addEventListener('submit', handleJobSubmit);
    document.getElementById('setupForm').addEventListener('submit', handleSetupSubmit);
    document.getElementById('archiveForm').addEventListener('submit', handleArchiveSubmit);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Auto-calculate total hours
    const cycleTime = document.getElementById('cycleTime');
    const numParts = document.getElementById('numParts');
    const numCavities = document.getElementById('numCavities');

    [cycleTime, numParts, numCavities].forEach(input => {
        input?.addEventListener('input', calculateTotalHours);
    });

    // Auto-calculate total material from grams/part
    const gramsPerPart = document.getElementById('gramsPerPart');
    [gramsPerPart, numParts].forEach(input => {
        input?.addEventListener('input', calculateTotalMaterial);
    });

    // Auto-calculate percent complete from parts completed
    const partsCompleted = document.getElementById('partsCompleted');
    partsCompleted?.addEventListener('input', calculatePercentFromParts);
    // Also recalculate percent when numParts changes (if partsCompleted has a value)
    numParts?.addEventListener('input', calculatePercentFromParts);

    // Percent complete sliders
    document.getElementById('percentComplete')?.addEventListener('input', (e) => {
        document.getElementById('percentCompleteValue').textContent = e.target.value;
    });

    document.getElementById('setupPercentComplete')?.addEventListener('input', (e) => {
        document.getElementById('setupPercentCompleteValue').textContent = e.target.value;
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
                <button class="machine-priority priority-${priority.toLowerCase()}" data-machine="${machine}" onclick="togglePriority('${machine}')">
                    ${priority}
                </button>
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

    // Add Material Usage column
    const materialColumn = document.createElement('div');
    materialColumn.className = 'machine-column material-usage-column';
    materialColumn.id = 'materialUsageColumn';
    materialColumn.innerHTML = `
        <div class="machine-header">
            <div class="machine-name">
                <i class="fas fa-box"></i>
                Material Usage
            </div>
        </div>
        <div class="material-usage-container">
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No materials to display</p>
            </div>
        </div>
    `;
    scheduleBoard.appendChild(materialColumn);
}

// Get Machine Priority
function getMachinePriority(machine) {
    const priority = state.machinePriorities.find(p => p.machine === machine);
    return priority ? priority.priority : 'Low';
}

// Toggle Machine Priority
async function togglePriority(machine) {
    const priorityLevels = ['Low', 'Medium', 'High', 'Critical'];
    const currentPriority = getMachinePriority(machine);
    const currentIndex = priorityLevels.indexOf(currentPriority);
    const nextIndex = (currentIndex + 1) % priorityLevels.length;
    const newPriority = priorityLevels[nextIndex];

    try {
        await updateMachinePriority(machine, newPriority);

        const priorityObj = state.machinePriorities.find(p => p.machine === machine);
        if (priorityObj) {
            priorityObj.priority = newPriority;
        } else {
            state.machinePriorities.push({ machine, priority: newPriority });
        }

        const button = document.querySelector(`.machine-priority[data-machine="${machine}"]`);
        if (button) {
            button.textContent = newPriority;
            button.className = `machine-priority priority-${newPriority.toLowerCase()}`;
        }

        showToast(`Priority updated to ${newPriority}`, 'success');
    } catch (error) {
        console.error('Error updating priority:', error);
        showToast('Failed to update priority', 'error');
    }
}

window.togglePriority = togglePriority;

// Update Machine Priority API call
async function updateMachinePriority(machine, priority) {
    const response = await fetch(`${API_BASE_URL}/priorities/${machine}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: priority.toLowerCase() })
    });
    if (!response.ok) throw new Error('Failed to update priority');
    return response.json();
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
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const container = e.currentTarget;
    container.classList.add('drag-over');

    // Remove any existing drop indicator
    container.querySelectorAll('.drop-indicator').forEach(el => el.remove());

    // Show a visual indicator of where the card will be inserted
    const afterElement = getDragAfterElement(container, e.clientY);
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';

    if (afterElement) {
        container.insertBefore(indicator, afterElement);
    } else {
        container.appendChild(indicator);
    }
}

function handleDragLeave(e) {
    // Only handle if we're actually leaving the container (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
        e.currentTarget.classList.remove('drag-over');
        e.currentTarget.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    }
}

// Find the element the dragged card should be placed before
function getDragAfterElement(container, y) {
    const cards = [...container.querySelectorAll('.job-card:not(.dragging)')];

    return cards.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const container = e.currentTarget;
    container.classList.remove('drag-over');
    container.querySelectorAll('.drop-indicator').forEach(el => el.remove());

    const jobId = e.dataTransfer.getData('jobId');
    if (!jobId) return;

    const targetMachine = container.getAttribute('data-machine');
    const afterElement = getDragAfterElement(container, e.clientY);

    // Build the new ordered list of job IDs for the target machine
    const existingCards = [...container.querySelectorAll('.job-card:not(.dragging)')];
    const orderedIds = existingCards.map(card => card.getAttribute('data-job-id'));

    // Determine insertion index
    let insertIndex;
    if (afterElement) {
        const afterId = afterElement.getAttribute('data-job-id');
        insertIndex = orderedIds.indexOf(afterId);
    } else {
        insertIndex = orderedIds.length;
    }

    // Remove dragged job from list if it was already in this machine
    const existingIndex = orderedIds.indexOf(jobId);
    if (existingIndex !== -1) {
        orderedIds.splice(existingIndex, 1);
        if (existingIndex < insertIndex) insertIndex--;
    }

    // Insert at new position
    orderedIds.splice(insertIndex, 0, jobId);

    // Check if the job is moving to a different machine
    const draggedJob = state.jobs.find(j => j.id === jobId);
    const machineChanged = draggedJob && draggedJob.machine !== targetMachine;

    // Update sortOrder for all jobs in the target machine
    try {
        const updatePromises = orderedIds.map((id, index) => {
            const newSortOrder = index + 1;
            const job = state.jobs.find(j => j.id === id);

            if (id === jobId && machineChanged) {
                // Moving to a different machine — update machine and sortOrder
                return fetch(`${API_BASE_URL}/jobs/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ machine: targetMachine, sortOrder: newSortOrder })
                });
            } else if (!job || job.sortOrder !== newSortOrder) {
                // Just update sortOrder if it changed
                return fetch(`${API_BASE_URL}/jobs/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sortOrder: newSortOrder })
                });
            }
            return Promise.resolve();
        });

        await Promise.all(updatePromises);
        await loadJobs();
        renderJobs();
        showToast('Job moved successfully', 'success');
    } catch (error) {
        console.error('Error reordering jobs:', error);
        showToast('Failed to move job', 'error');
    }
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

    // Filter out archived jobs
    const activeJobs = state.jobs.filter(job => !job.archived);

    // Group jobs by machine for cumulative hours calculation
    const jobsByMachine = {};
    activeJobs.forEach(job => {
        if (!jobsByMachine[job.machine]) {
            jobsByMachine[job.machine] = [];
        }
        jobsByMachine[job.machine].push(job);
    });

    // Sort jobs within each machine by sortOrder so new items appear at the end
    Object.keys(jobsByMachine).forEach(machine => {
        jobsByMachine[machine].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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

    // Render material usage box
    renderMaterialUsage(jobsByMachine);
}

// Calculate remaining material for a job based on percentage complete
function calculateRemainingMaterial(job) {
    const totalMaterial = parseFloat(job.totalMaterial || 0);
    const percentComplete = parseFloat(job.percentComplete || 0);
    const remainingMaterial = totalMaterial * ((100 - percentComplete) / 100);
    return remainingMaterial;
}

// Create Job Card
function createJobCard(job, cumulativeHours = 0) {
    const card = document.createElement('div');

    // Calculate remaining material for regular jobs
    const remainingMaterial = job.type !== 'setup' ? calculateRemainingMaterial(job) : 0;

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
            <div class="due-date-row">
                ${dueDate ? `<div class="due-date-indicator ${dueDateClass}">${formatDate(dueDate)}</div>` : '<div></div>'}
                <button class="archive-btn" draggable="false" onclick="openArchiveModal('${job.id}')" title="Archive Job">
                    <i class="fas fa-archive"></i> Archive
                </button>
            </div>
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
            ${job.partsCompleted ? `<div class="job-detail parts-completed"><i class="fas fa-check-double"></i> Parts: ${job.partsCompleted} / ${job.numParts}</div>` : ''}
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
            </div>
            <div class="cumulative-hours">
                <i class="fas fa-calculator"></i>
                <span>Cumulative: ${cumulativeHours.toFixed(2)} hrs</span>
            </div>
            <div class="material-summary">
                <i class="fas fa-box"></i>
                <span class="material-label">Material Remaining:</span>
                <span class="material-value">${remainingMaterial.toFixed(1)} lbs ${job.material || ''}</span>
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
            document.getElementById('gramsPerPart').value = job.gramsPerPart || '';
            document.getElementById('totalMaterial').value = job.totalMaterial || '';
            document.getElementById('totalHours').value = job.totalHours || '';
            document.getElementById('dueDate').value = job.dueDate || '';
            document.getElementById('partsCompleted').value = job.partsCompleted || '';
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
    state.archivingJobId = null;
}

function openArchiveModal(jobId) {
    const modal = document.getElementById('archiveModal');
    const form = document.getElementById('archiveForm');

    form.reset();
    state.archivingJobId = jobId;

    // Set default to today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('completeDate').value = today;

    modal.classList.add('show');
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
        gramsPerPart: parseFloat(document.getElementById('gramsPerPart').value),
        totalMaterial: parseFloat(document.getElementById('totalMaterial').value),
        totalHours: parseFloat(document.getElementById('totalHours').value),
        dueDate: document.getElementById('dueDate').value,
        partsCompleted: parseInt(document.getElementById('partsCompleted').value) || 0,
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
    } catch (error) {
        console.error('Error saving setup:', error);
        showToast('Failed to save setup/maintenance', 'error');
    } finally {
        closeModal(document.getElementById('setupModal'));
    }
}

async function handleArchiveSubmit(e) {
    e.preventDefault();

    const completeDate = document.getElementById('completeDate').value;

    if (!completeDate) {
        showToast('Complete date is required', 'error');
        return;
    }

    try {
        await archiveJob(state.archivingJobId, completeDate);
        showToast('Job archived successfully', 'success');
        await loadJobs();
        renderCurrentView();
    } catch (error) {
        console.error('Error archiving job:', error);
        showToast('Failed to archive job', 'error');
    } finally {
        closeModal(document.getElementById('archiveModal'));
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

async function archiveJob(jobId, completeDate) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completeDate })
    });
    if (!response.ok) throw new Error('Failed to archive job');
    return await response.json();
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
        renderCurrentView();
    } catch (error) {
        console.error('Error deleting job:', error);
        showToast('Failed to delete job', 'error');
    }
};

window.openArchiveModal = openArchiveModal;

window.unarchiveJob = async function(jobId) {
    if (!confirm('Are you sure you want to restore this job to the schedule?')) return;

    try {
        await updateJob(jobId, { archived: false, completeDate: null });
        showToast('Job restored to schedule', 'success');
        await loadJobs();
        renderCurrentView();
    } catch (error) {
        console.error('Error unarchiving job:', error);
        showToast('Failed to restore job', 'error');
    }
};

// Utility Functions
function calculatePercentFromParts() {
    const partsCompleted = parseInt(document.getElementById('partsCompleted')?.value) || 0;
    const numParts = parseInt(document.getElementById('numParts')?.value) || 0;

    if (numParts > 0) {
        const percent = Math.min(100, Math.round((partsCompleted / numParts) * 100));
        document.getElementById('percentComplete').value = percent;
        document.getElementById('percentCompleteValue').textContent = percent;
    }
}

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

function calculateTotalMaterial() {
    const gramsPerPart = parseFloat(document.getElementById('gramsPerPart')?.value) || 0;
    const numParts = parseInt(document.getElementById('numParts')?.value) || 0;

    // Convert grams to pounds: (gramsPerPart × numParts) / 454
    const totalMaterialLbs = (gramsPerPart * numParts) / 454;

    const totalMaterialInput = document.getElementById('totalMaterial');
    if (totalMaterialInput) {
        totalMaterialInput.value = totalMaterialLbs.toFixed(2);
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

// Tab Switching
function switchTab(tab) {
    state.currentTab = tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tab === 'schedule') {
        document.getElementById('scheduleTab').classList.add('active');
        renderJobs();
    } else if (tab === 'priorities') {
        document.getElementById('prioritiesTab').classList.add('active');
        renderPrioritiesView();
    } else if (tab === 'archive') {
        document.getElementById('archiveTab').classList.add('active');
        renderArchive();
    }
}

// Render Current View (helper function)
function renderCurrentView() {
    if (state.currentTab === 'schedule') {
        renderJobs();
    } else if (state.currentTab === 'priorities') {
        renderPrioritiesView();
    } else if (state.currentTab === 'archive') {
        renderArchive();
    }
}

// Render Archive
function renderArchive() {
    const archiveBoard = document.getElementById('archiveBoard');
    archiveBoard.innerHTML = '';

    // Filter archived jobs
    const archivedJobs = state.jobs.filter(job => job.archived);

    if (archivedJobs.length === 0) {
        archiveBoard.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-archive"></i>
                <p>No archived jobs</p>
            </div>
        `;
        return;
    }

    // Sort by complete date (most recent first)
    archivedJobs.sort((a, b) => {
        const dateA = new Date(a.completeDate || 0);
        const dateB = new Date(b.completeDate || 0);
        return dateB - dateA;
    });

    // Create archive table
    const table = document.createElement('table');
    table.className = 'archive-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Complete Date</th>
                <th>Job Name</th>
                <th>Work Order</th>
                <th>Machine</th>
                <th>Material</th>
                <th>Total Hours</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${archivedJobs.map(job => `
                <tr>
                    <td>${job.completeDate ? formatDate(new Date(job.completeDate)) : 'N/A'}</td>
                    <td>${job.type === 'setup' ? `Tool #${job.toolNumber}` : job.jobName}</td>
                    <td>${job.workOrder || 'N/A'}</td>
                    <td>${job.machine}</td>
                    <td>${job.material || (job.type === 'setup' ? 'Setup/Maintenance' : 'N/A')}</td>
                    <td>${job.totalHours || job.setupHours || 'N/A'}</td>
                    <td>
                        <button class="job-action-btn" onclick="unarchiveJob('${job.id}')" title="Restore">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="job-action-btn" onclick="deleteJob('${job.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    archiveBoard.appendChild(table);
}

// Render MFG Priorities View
function renderPrioritiesView() {
    const prioritiesBoard = document.getElementById('prioritiesBoard');
    prioritiesBoard.innerHTML = '';

    // Get non-archived jobs
    const activeJobs = state.jobs.filter(job => !job.archived);

    // Group jobs by their machine's priority
    const priorityGroups = {
        critical: [],
        high: [],
        medium: [],
        low: []
    };

    activeJobs.forEach(job => {
        const machinePriority = getMachinePriority(job.machine).toLowerCase();
        if (priorityGroups[machinePriority]) {
            priorityGroups[machinePriority].push(job);
        } else {
            priorityGroups.low.push(job);
        }
    });

    // Sort jobs within each priority group by sortOrder
    Object.keys(priorityGroups).forEach(priority => {
        priorityGroups[priority].sort((a, b) => (a.prioritySortOrder || a.sortOrder || 0) - (b.prioritySortOrder || b.sortOrder || 0));
    });

    // Load saved notes from localStorage
    const savedNotes = JSON.parse(localStorage.getItem('manufacturing-schedule-priority-notes') || '{}');

    // Create sections for each priority level
    const priorityLevels = [
        { key: 'critical', label: 'Critical', icon: 'fa-exclamation-circle', color: '#dc3545' },
        { key: 'high', label: 'High', icon: 'fa-arrow-up', color: '#ffc107' },
        { key: 'medium', label: 'Medium', icon: 'fa-minus', color: '#007bff' },
        { key: 'low', label: 'Low', icon: 'fa-arrow-down', color: '#28a745' }
    ];

    priorityLevels.forEach(({ key, label, icon, color }) => {
        const section = document.createElement('div');
        section.className = 'priority-section';
        section.setAttribute('data-priority', key);

        const jobs = priorityGroups[key];

        section.innerHTML = `
            <div class="priority-section-header" style="border-left: 4px solid ${color};">
                <i class="fas ${icon}" style="color: ${color};"></i>
                <span class="priority-section-title">${label} Priority</span>
                <span class="priority-count">${jobs.length} job${jobs.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="priority-jobs-container" data-priority="${key}">
                ${jobs.length === 0 ? `
                    <div class="empty-state small">
                        <p>No ${label.toLowerCase()} priority jobs</p>
                    </div>
                ` : ''}
            </div>
        `;

        const container = section.querySelector('.priority-jobs-container');

        jobs.forEach(job => {
            const jobRow = document.createElement('div');
            jobRow.className = 'priority-job-row';
            jobRow.setAttribute('draggable', 'true');
            jobRow.setAttribute('data-job-id', job.id);

            const dueDate = job.dueDate ? new Date(job.dueDate) : null;
            const today = new Date();
            const daysUntilDue = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;
            let dueDateClass = '';
            if (daysUntilDue !== null) {
                if (daysUntilDue < 0) dueDateClass = 'overdue';
                else if (daysUntilDue <= 3) dueDateClass = 'due-soon';
            }

            const savedNote = savedNotes[job.id] || '';

            if (job.type === 'setup') {
                jobRow.innerHTML = `
                    <div class="priority-job-card setup-card ${job.toolReady === 'yes' ? 'tool-ready' : 'tool-not-ready'}">
                        <div class="priority-job-header">
                            <span class="priority-job-name"><i class="fas fa-tools"></i> Tool #${job.toolNumber}</span>
                            <span class="priority-job-machine">Machine: ${job.machine}</span>
                        </div>
                        <div class="priority-job-details">
                            <span><i class="fas fa-hourglass-half"></i> ${job.setupHours || 0} hrs</span>
                            <span><i class="fas fa-tasks"></i> ${job.percentComplete || 0}%</span>
                        </div>
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
                        </div>
                    </div>
                    <div class="priority-note-container">
                        <textarea class="priority-note" placeholder="Add notes..." data-job-id="${job.id}">${savedNote}</textarea>
                    </div>
                `;
            } else {
                jobRow.innerHTML = `
                    <div class="priority-job-card">
                        <div class="priority-job-header">
                            <span class="priority-job-name">${job.jobName}</span>
                            <span class="priority-job-machine">Machine: ${job.machine}</span>
                        </div>
                        <div class="priority-job-subheader">
                            <span class="priority-job-wo">WO: ${job.workOrder}</span>
                            ${dueDate ? `<span class="priority-due-date ${dueDateClass}">${formatDate(dueDate)}</span>` : ''}
                        </div>
                        <div class="priority-job-details">
                            <span><i class="fas fa-cubes"></i> ${job.numParts} parts</span>
                            <span><i class="fas fa-layer-group"></i> ${job.material || 'N/A'}</span>
                            <span><i class="fas fa-hourglass-half"></i> ${job.totalHours || 0} hrs</span>
                            <span><i class="fas fa-tasks"></i> ${job.percentComplete || 0}%</span>
                        </div>
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${job.percentComplete || 0}%"></div>
                        </div>
                    </div>
                    <div class="priority-note-container">
                        <textarea class="priority-note" placeholder="Add notes..." data-job-id="${job.id}">${savedNote}</textarea>
                    </div>
                `;
            }

            // Add drag event listeners
            jobRow.addEventListener('dragstart', handlePriorityDragStart);
            jobRow.addEventListener('dragend', handlePriorityDragEnd);

            container.appendChild(jobRow);
        });

        // Add drop zone event listeners
        container.addEventListener('dragover', handlePriorityDragOver);
        container.addEventListener('dragleave', handlePriorityDragLeave);
        container.addEventListener('drop', handlePriorityDrop);

        prioritiesBoard.appendChild(section);
    });

    // Add note change listeners
    document.querySelectorAll('.priority-note').forEach(textarea => {
        textarea.addEventListener('input', handlePriorityNoteChange);
    });
}

// Priority View Drag and Drop handlers
let priorityDraggedElement = null;

function handlePriorityDragStart(e) {
    priorityDraggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-job-id'));
}

function handlePriorityDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.priority-jobs-container').forEach(container => {
        container.classList.remove('drag-over');
    });
    document.querySelectorAll('.priority-drop-indicator').forEach(el => el.remove());
    priorityDraggedElement = null;
}

function handlePriorityDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');

    // Show drop indicator
    const afterElement = getPriorityDragAfterElement(this, e.clientY);
    const indicator = document.querySelector('.priority-drop-indicator') || createPriorityDropIndicator();

    if (afterElement == null) {
        this.appendChild(indicator);
    } else {
        this.insertBefore(indicator, afterElement);
    }
}

function handlePriorityDragLeave(e) {
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handlePriorityDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    document.querySelectorAll('.priority-drop-indicator').forEach(el => el.remove());

    if (!priorityDraggedElement) return;

    const jobId = e.dataTransfer.getData('text/plain');
    const newPriority = this.getAttribute('data-priority');
    const afterElement = getPriorityDragAfterElement(this, e.clientY);

    // Move the element in the DOM
    if (afterElement == null) {
        this.appendChild(priorityDraggedElement);
    } else {
        this.insertBefore(priorityDraggedElement, afterElement);
    }

    // Update the machine's priority to match the new section
    const job = state.jobs.find(j => j.id === jobId);
    if (job) {
        const capitalizedPriority = newPriority.charAt(0).toUpperCase() + newPriority.slice(1);
        updateMachinePriority(job.machine, capitalizedPriority).catch(err => {
            console.error('Error updating machine priority:', err);
        });

        // Update local state
        const priorityObj = state.machinePriorities.find(p => p.machine === job.machine);
        if (priorityObj) {
            priorityObj.priority = capitalizedPriority;
        } else {
            state.machinePriorities.push({ machine: job.machine, priority: capitalizedPriority });
        }
    }

    // Save the new sort order
    savePrioritySortOrder();
}

function getPriorityDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.priority-job-row:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function createPriorityDropIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'priority-drop-indicator';
    return indicator;
}

function savePrioritySortOrder() {
    const sortOrders = {};
    document.querySelectorAll('.priority-jobs-container').forEach(container => {
        const rows = container.querySelectorAll('.priority-job-row');
        rows.forEach((row, index) => {
            const jobId = row.getAttribute('data-job-id');
            sortOrders[jobId] = index;
        });
    });
    localStorage.setItem('manufacturing-schedule-priority-sort', JSON.stringify(sortOrders));
}

// Handle priority note changes
function handlePriorityNoteChange(e) {
    const jobId = e.target.getAttribute('data-job-id');
    const note = e.target.value;

    // Save to localStorage
    const savedNotes = JSON.parse(localStorage.getItem('manufacturing-schedule-priority-notes') || '{}');
    savedNotes[jobId] = note;
    localStorage.setItem('manufacturing-schedule-priority-notes', JSON.stringify(savedNotes));
}

// Calculate Material Usage by Timeframe
function calculateMaterialUsage(jobsByMachine) {
    const materialUsage = {
        timeframe1: {}, // 0-168 hrs
        timeframe2: {}, // 168-336 hrs
        timeframe3: {}  // 336-504 hrs
    };

    // Process each machine
    Object.keys(jobsByMachine).forEach(machine => {
        let cumulativeHours = 0;

        jobsByMachine[machine].forEach(job => {
            // Skip setup jobs (no material)
            if (job.type === 'setup' || !job.material || !job.totalMaterial) {
                const totalHours = job.type === 'setup' ? (job.setupHours || 0) : (job.totalHours || 0);
                const percentComplete = job.percentComplete || 0;
                const remainingHours = totalHours * (1 - percentComplete / 100);
                cumulativeHours += remainingHours;
                return;
            }

            const material = job.material;
            const totalHours = job.totalHours || 0;
            const percentComplete = job.percentComplete || 0;
            const remainingHours = totalHours * (1 - percentComplete / 100);
            const remainingMaterial = (job.totalMaterial || 0) * (1 - percentComplete / 100);

            const jobStartTime = cumulativeHours;
            const jobEndTime = cumulativeHours + remainingHours;

            // Split material across timeframes
            // Timeframe 1: 0-168 hrs
            if (jobStartTime < 168) {
                const timeInFrame = Math.min(jobEndTime, 168) - jobStartTime;
                const percentage = timeInFrame / remainingHours;
                const materialInFrame = remainingMaterial * percentage;

                if (!materialUsage.timeframe1[material]) {
                    materialUsage.timeframe1[material] = 0;
                }
                materialUsage.timeframe1[material] += materialInFrame;
            }

            // Timeframe 2: 168-336 hrs
            if (jobEndTime > 168 && jobStartTime < 336) {
                const frameStart = Math.max(jobStartTime, 168);
                const frameEnd = Math.min(jobEndTime, 336);
                const timeInFrame = frameEnd - frameStart;
                const percentage = timeInFrame / remainingHours;
                const materialInFrame = remainingMaterial * percentage;

                if (!materialUsage.timeframe2[material]) {
                    materialUsage.timeframe2[material] = 0;
                }
                materialUsage.timeframe2[material] += materialInFrame;
            }

            // Timeframe 3: 336-504 hrs
            if (jobEndTime > 336 && jobStartTime < 504) {
                const frameStart = Math.max(jobStartTime, 336);
                const frameEnd = Math.min(jobEndTime, 504);
                const timeInFrame = frameEnd - frameStart;
                const percentage = timeInFrame / remainingHours;
                const materialInFrame = remainingMaterial * percentage;

                if (!materialUsage.timeframe3[material]) {
                    materialUsage.timeframe3[material] = 0;
                }
                materialUsage.timeframe3[material] += materialInFrame;
            }

            cumulativeHours += remainingHours;
        });
    });

    return materialUsage;
}

// Render Material Usage Box
function renderMaterialUsage(jobsByMachine) {
    const container = document.querySelector('.material-usage-container');
    if (!container) return;

    const materialUsage = calculateMaterialUsage(jobsByMachine);

    // Check if there's any material to display
    const hasData = Object.keys(materialUsage.timeframe1).length > 0 ||
                    Object.keys(materialUsage.timeframe2).length > 0 ||
                    Object.keys(materialUsage.timeframe3).length > 0;

    if (!hasData) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No materials to display</p>
            </div>
        `;
        return;
    }

    // Build HTML for each timeframe
    let html = '';

    // Timeframe 1: 0-168 hrs
    if (Object.keys(materialUsage.timeframe1).length > 0) {
        html += `
            <div class="material-timeframe">
                <div class="timeframe-header">
                    <i class="fas fa-clock"></i>
                    0-168 Hours (1 Week)
                </div>
                <div class="material-list">
        `;
        Object.entries(materialUsage.timeframe1)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([material, amount]) => {
                html += `
                    <div class="material-item">
                        <span class="material-name">${material}</span>
                        <span class="material-amount">${amount.toFixed(2)} lbs</span>
                    </div>
                `;
            });
        html += `
                </div>
            </div>
        `;
    }

    // Timeframe 2: 168-336 hrs
    if (Object.keys(materialUsage.timeframe2).length > 0) {
        html += `
            <div class="material-timeframe">
                <div class="timeframe-header">
                    <i class="fas fa-clock"></i>
                    168-336 Hours (2 Weeks)
                </div>
                <div class="material-list">
        `;
        Object.entries(materialUsage.timeframe2)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([material, amount]) => {
                html += `
                    <div class="material-item">
                        <span class="material-name">${material}</span>
                        <span class="material-amount">${amount.toFixed(2)} lbs</span>
                    </div>
                `;
            });
        html += `
                </div>
            </div>
        `;
    }

    // Timeframe 3: 336-504 hrs
    if (Object.keys(materialUsage.timeframe3).length > 0) {
        html += `
            <div class="material-timeframe">
                <div class="timeframe-header">
                    <i class="fas fa-clock"></i>
                    336-504 Hours (3 Weeks)
                </div>
                <div class="material-list">
        `;
        Object.entries(materialUsage.timeframe3)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([material, amount]) => {
                html += `
                    <div class="material-item">
                        <span class="material-name">${material}</span>
                        <span class="material-amount">${amount.toFixed(2)} lbs</span>
                    </div>
                `;
            });
        html += `
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}
