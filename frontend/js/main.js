// Manufacturing Schedule Application
// Global State
const state = {
    jobs: [],
    machinePriorities: [],
    editingJobId: null,
    editingSetupId: null
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

    // Auto-calculate total material
    const gramsPerPart = document.getElementById('gramsPerPart');
    [gramsPerPart, numParts].forEach(input => {
        input?.addEventListener('input', calculateTotalMaterial);
    });

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
        // Update on server
        await updateMachinePriority(machine, newPriority);

        // Update local state
        const priorityObj = state.machinePriorities.find(p => p.machine === machine);
        if (priorityObj) {
            priorityObj.priority = newPriority;
        } else {
            state.machinePriorities.push({ machine, priority: newPriority });
        }

        // Update UI
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

// Update Machine Priority API call
async function updateMachinePriority(machine, priority) {
    const response = await fetch(`${API_BASE_URL}/priorities/${machine}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
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

    // Group jobs by machine for cumulative calculations
    const jobsByMachine = {};
    state.jobs.forEach(job => {
        if (!jobsByMachine[job.machine]) {
            jobsByMachine[job.machine] = [];
        }
        jobsByMachine[job.machine].push(job);
    });

    // Render jobs into their assigned machines
    Object.keys(jobsByMachine).forEach(machine => {
        const container = document.querySelector(`.jobs-container[data-machine="${machine}"]`);
        if (container) {
            // Remove empty state
            const emptyState = container.querySelector('.empty-state');
            if (emptyState) emptyState.remove();

            // Render each job with its position for cumulative calculation
            jobsByMachine[machine].forEach((job, index) => {
                const jobCard = createJobCard(job, jobsByMachine[machine], index);
                container.appendChild(jobCard);
            });
        }
    });

    // Render material summary
    renderMaterialSummary();
}

// Render Material Summary Box
function renderMaterialSummary() {
    const scheduleBoard = document.getElementById('scheduleBoard');

    // Remove existing material summary if present
    const existingSummary = document.getElementById('materialSummary');
    if (existingSummary) {
        existingSummary.remove();
    }

    // Calculate material summary
    const materialSummary = calculateMaterialSummary();

    // Create material summary column
    const summaryColumn = document.createElement('div');
    summaryColumn.id = 'materialSummary';
    summaryColumn.className = 'machine-column material-summary-column';

    // Build HTML content
    let summaryHTML = `
        <div class="machine-header">
            <div class="machine-name">
                <i class="fas fa-box"></i>
                Material Summary
            </div>
        </div>
        <div class="material-summary-content">
    `;

    // Sort materials alphabetically
    const sortedMaterials = Object.keys(materialSummary).sort();

    if (sortedMaterials.length === 0) {
        summaryHTML += `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No materials to display</p>
            </div>
        `;
    } else {
        sortedMaterials.forEach(material => {
            const data = materialSummary[material];
            summaryHTML += `
                <div class="material-item">
                    <div class="material-name">${material}</div>
                    <div class="material-breakdown">
                        <div class="material-row total">
                            <span class="material-label">Total:</span>
                            <span class="material-value">${data.total.toFixed(1)} lbs</span>
                        </div>
                        <div class="material-row">
                            <span class="material-label">1 wk:</span>
                            <span class="material-value">${data.week1.toFixed(1)} lbs</span>
                            <span class="material-timeframe">(0-168 hrs)</span>
                        </div>
                        <div class="material-row">
                            <span class="material-label">2 wk:</span>
                            <span class="material-value">${data.week2.toFixed(1)} lbs</span>
                            <span class="material-timeframe">(168-336 hrs)</span>
                        </div>
                        <div class="material-row">
                            <span class="material-label">3 wk+:</span>
                            <span class="material-value">${data.week3Plus.toFixed(1)} lbs</span>
                            <span class="material-timeframe">(336+ hrs)</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    summaryHTML += `</div>`;
    summaryColumn.innerHTML = summaryHTML;

    // Append to schedule board
    scheduleBoard.appendChild(summaryColumn);
}

// Calculate remaining hours for a job based on percentage complete
function calculateRemainingHours(job) {
    const totalHours = parseFloat(job.totalHours || job.setupHours || 0);
    const percentComplete = parseFloat(job.percentComplete || 0);
    const remainingHours = totalHours * ((100 - percentComplete) / 100);
    return remainingHours;
}

// Calculate remaining material for a job based on percentage complete
function calculateRemainingMaterial(job) {
    const totalMaterial = parseFloat(job.totalMaterial || 0);
    const percentComplete = parseFloat(job.percentComplete || 0);
    const remainingMaterial = totalMaterial * ((100 - percentComplete) / 100);
    return remainingMaterial;
}

// Calculate cumulative hours up to and including this job
function calculateCumulativeHours(jobsInMachine, currentIndex) {
    let cumulative = 0;
    for (let i = 0; i <= currentIndex; i++) {
        cumulative += calculateRemainingHours(jobsInMachine[i]);
    }
    return cumulative;
}

// Calculate material summary by time buckets
function calculateMaterialSummary() {
    const materialSummary = {};

    // Group ALL jobs by machine (including setup/maintenance for cumulative hours)
    const jobsByMachine = {};
    state.jobs.forEach(job => {
        if (!jobsByMachine[job.machine]) {
            jobsByMachine[job.machine] = [];
        }
        jobsByMachine[job.machine].push(job);
    });

    // Process each machine's jobs
    Object.keys(jobsByMachine).forEach(machine => {
        const machineJobs = jobsByMachine[machine];
        let cumulativeStart = 0;

        machineJobs.forEach((job, index) => {
            const remainingHours = calculateRemainingHours(job);
            const cumulativeEnd = cumulativeStart + remainingHours;

            // Only track material for regular jobs (not setup/maintenance)
            if (job.type === 'job') {
                const material = job.material || 'Unknown';
                const remainingMaterial = calculateRemainingMaterial(job);

                // Initialize material entry if doesn't exist
                if (!materialSummary[material]) {
                    materialSummary[material] = {
                        total: 0,
                        week1: 0,  // 0-168 hrs
                        week2: 0,  // 168-336 hrs
                        week3Plus: 0  // 336+ hrs
                    };
                }

                // Add to total
                materialSummary[material].total += remainingMaterial;

                // Distribute material across time buckets
                // Week 1: 0-168 hrs
                const week1End = 168;
                if (cumulativeStart < week1End) {
                    const hoursInWeek1 = Math.min(cumulativeEnd, week1End) - cumulativeStart;
                    const materialInWeek1 = (hoursInWeek1 / remainingHours) * remainingMaterial;
                    materialSummary[material].week1 += materialInWeek1;
                }

                // Week 2: 168-336 hrs
                const week2Start = 168;
                const week2End = 336;
                if (cumulativeEnd > week2Start && cumulativeStart < week2End) {
                    const bucketStart = Math.max(cumulativeStart, week2Start);
                    const bucketEnd = Math.min(cumulativeEnd, week2End);
                    const hoursInWeek2 = bucketEnd - bucketStart;
                    const materialInWeek2 = (hoursInWeek2 / remainingHours) * remainingMaterial;
                    materialSummary[material].week2 += materialInWeek2;
                }

                // Week 3+: 336+ hrs
                const week3Start = 336;
                if (cumulativeEnd > week3Start) {
                    const bucketStart = Math.max(cumulativeStart, week3Start);
                    const hoursInWeek3Plus = cumulativeEnd - bucketStart;
                    const materialInWeek3Plus = (hoursInWeek3Plus / remainingHours) * remainingMaterial;
                    materialSummary[material].week3Plus += materialInWeek3Plus;
                }
            }

            // Update cumulative start for next job (includes all jobs)
            cumulativeStart = cumulativeEnd;
        });
    });

    return materialSummary;
}

// Create Job Card
function createJobCard(job, jobsInMachine = [], jobIndex = 0) {
    const card = document.createElement('div');

    // Calculate hours
    const remainingHours = calculateRemainingHours(job);
    const cumulativeHours = calculateCumulativeHours(jobsInMachine, jobIndex);

    // Calculate remaining material
    const remainingMaterial = calculateRemainingMaterial(job);

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
            <div class="hours-summary">
                <div class="hours-item">
                    <span class="hours-label">Remaining:</span>
                    <span class="hours-value">${remainingHours.toFixed(1)} hrs</span>
                </div>
                <div class="hours-item cumulative">
                    <span class="hours-label">Cumulative:</span>
                    <span class="hours-value">${cumulativeHours.toFixed(1)} hrs</span>
                </div>
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
            <div class="hours-summary">
                <div class="hours-item">
                    <span class="hours-label">Remaining:</span>
                    <span class="hours-value">${remainingHours.toFixed(1)} hrs</span>
                </div>
                <div class="hours-item cumulative">
                    <span class="hours-label">Cumulative:</span>
                    <span class="hours-value">${cumulativeHours.toFixed(1)} hrs</span>
                </div>
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
        gramsPerPart: parseFloat(document.getElementById('gramsPerPart').value),
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
