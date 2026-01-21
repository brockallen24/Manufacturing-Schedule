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
                <div class="machine-priority priority-${priority}" data-machine="${machine}" style="cursor: pointer;" title="Click to change priority">
                    Priority: ${priority}
                </div>
            </div>
            <div class="jobs-container" data-machine="${machine}">
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No jobs scheduled</p>
                </div>
            </div>
        `;

        scheduleBoard.appendChild(column);

        // Setup click handler for priority badge
        const priorityBadge = column.querySelector('.machine-priority');
        priorityBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            cyclePriority(machine);
        });

        // Setup drag and drop
        const jobsContainer = column.querySelector('.jobs-container');
        setupDragAndDrop(jobsContainer);
    });

    // Add Material Summary Column
    createMaterialSummaryColumn(scheduleBoard);
}

// Create Material Summary Column
function createMaterialSummaryColumn(scheduleBoard) {
    const summary = calculateMaterialSummary();
    const column = document.createElement('div');
    column.className = 'machine-column summary-column';
    column.id = 'material-summary-column';

    let summaryHTML = `
        <div class="machine-header">
            <div class="machine-name">
                <i class="fas fa-chart-bar"></i>
                Material Summary
            </div>
        </div>
        <div class="summary-container">
    `;

    // Sort materials alphabetically
    const materials = Object.keys(summary).sort();

    if (materials.length === 0) {
        summaryHTML += `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No materials scheduled</p>
            </div>
        `;
    } else {
        materials.forEach(material => {
            const week1 = summary[material].week1.toFixed(2);
            const week2 = summary[material].week2.toFixed(2);

            summaryHTML += `
                <div class="summary-card">
                    <div class="summary-material-name">${material}</div>
                    <div class="summary-detail">
                        <span class="summary-label">0-168 hrs:</span>
                        <span class="summary-value">${week1} lbs</span>
                    </div>
                    <div class="summary-detail">
                        <span class="summary-label">169-336 hrs:</span>
                        <span class="summary-value">${week2} lbs</span>
                    </div>
                </div>
            `;
        });
    }

    summaryHTML += `</div>`;
    column.innerHTML = summaryHTML;
    scheduleBoard.appendChild(column);
}

// Update Material Summary (called after jobs are rendered)
function updateMaterialSummary() {
    const summaryColumn = document.getElementById('material-summary-column');
    if (!summaryColumn) {
        // If summary column doesn't exist, create it
        const scheduleBoard = document.getElementById('scheduleBoard');
        if (scheduleBoard) {
            createMaterialSummaryColumn(scheduleBoard);
        }
        return;
    }

    const summary = calculateMaterialSummary();
    const summaryContainer = summaryColumn.querySelector('.summary-container');
    if (!summaryContainer) return;

    let summaryHTML = '';

    // Sort materials alphabetically
    const materials = Object.keys(summary).sort();

    if (materials.length === 0) {
        summaryHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No materials scheduled</p>
            </div>
        `;
    } else {
        materials.forEach(material => {
            const week1 = summary[material].week1.toFixed(2);
            const week2 = summary[material].week2.toFixed(2);

            summaryHTML += `
                <div class="summary-card">
                    <div class="summary-material-name">${material}</div>
                    <div class="summary-detail">
                        <span class="summary-label">0-168 hrs:</span>
                        <span class="summary-value">${week1} lbs</span>
                    </div>
                    <div class="summary-detail">
                        <span class="summary-label">169-336 hrs:</span>
                        <span class="summary-value">${week2} lbs</span>
                    </div>
                </div>
            `;
        });
    }

    summaryContainer.innerHTML = summaryHTML;
}

// Get Machine Priority
function getMachinePriority(machine) {
    const priority = state.machinePriorities.find(p => p.machine === machine);
    return priority ? priority.priority : 'N/A';
}

// Calculate material summary with per-machine cumulative hour tracking
function calculateMaterialSummary() {
    const summary = {};

    console.log('📊 Calculating material summary for', state.jobs.length, 'jobs');
    console.log('📋 Using per-machine cumulative hours (each machine starts at 0)');

    // Process each machine independently
    MACHINES.forEach(machine => {
        const machineJobs = state.jobs.filter(job => job.machine === machine);
        let machineCumulativeHours = 0;

        if (machineJobs.length > 0) {
            console.log(`\n🔧 Machine ${machine}: ${machineJobs.length} jobs`);
        }

        machineJobs.forEach((job, index) => {
            const material = job.material || 'Unknown';
            const totalHours = parseFloat(job.totalHours || job.setupHours) || 0;
            const totalMaterial = parseFloat(job.totalMaterial) || 0;

            if (!summary[material]) {
                summary[material] = {
                    week1: 0,  // 0-168 hours
                    week2: 0   // 169-336 hours
                };
            }

            const jobStartHour = machineCumulativeHours;
            const jobEndHour = machineCumulativeHours + totalHours;

            console.log(`  Job ${index + 1}: ${job.jobName || 'Tool #' + job.toolNumber}, Material: ${material}, Hours: ${totalHours}, Machine Cumulative: ${jobStartHour.toFixed(2)} → ${jobEndHour.toFixed(2)}`);

            // Job entirely in week 1 (0-168)
            if (jobEndHour < 169) {
                summary[material].week1 += totalMaterial;
                console.log(`    → All in Week 1 (0-168): ${totalMaterial} lbs`);
            }
            // Job entirely in week 2 (169-336)
            else if (jobStartHour >= 169) {
                summary[material].week2 += totalMaterial;
                console.log(`    → All in Week 2 (169-336): ${totalMaterial} lbs`);
            }
            // Job spans the boundary between week 1 and week 2
            else {
                const hoursInWeek1 = Math.min(jobEndHour, 169) - jobStartHour;
                const hoursInWeek2 = jobEndHour - 169;

                console.log(`    → Spans both weeks:`);
                console.log(`       Hours in Week 1 (${jobStartHour.toFixed(2)} to 169): ${hoursInWeek1.toFixed(2)} hrs`);
                console.log(`       Hours in Week 2 (169 to ${jobEndHour.toFixed(2)}): ${hoursInWeek2.toFixed(2)} hrs`);

                if (hoursInWeek1 > 0) {
                    const week1Ratio = hoursInWeek1 / totalHours;
                    const week1Material = totalMaterial * week1Ratio;
                    summary[material].week1 += week1Material;
                    console.log(`       Week 1 material: ${week1Material.toFixed(2)} lbs (${(week1Ratio * 100).toFixed(1)}%)`);
                }
                if (hoursInWeek2 > 0) {
                    const week2Ratio = hoursInWeek2 / totalHours;
                    const week2Material = totalMaterial * week2Ratio;
                    summary[material].week2 += week2Material;
                    console.log(`       Week 2 material: ${week2Material.toFixed(2)} lbs (${(week2Ratio * 100).toFixed(1)}%)`);
                }
            }

            machineCumulativeHours = jobEndHour;
        });
    });

    // Process any jobs not assigned to known machines
    const unassignedJobs = state.jobs.filter(job => !MACHINES.includes(job.machine));
    if (unassignedJobs.length > 0) {
        console.log(`\n⚠️  Unassigned jobs: ${unassignedJobs.length}`);
        let unassignedCumulativeHours = 0;

        unassignedJobs.forEach((job, index) => {
            const material = job.material || 'Unknown';
            const totalHours = parseFloat(job.totalHours || job.setupHours) || 0;
            const totalMaterial = parseFloat(job.totalMaterial) || 0;

            if (!summary[material]) {
                summary[material] = {
                    week1: 0,
                    week2: 0
                };
            }

            const jobStartHour = unassignedCumulativeHours;
            const jobEndHour = unassignedCumulativeHours + totalHours;

            console.log(`  Job ${index + 1}: ${job.jobName || 'Tool #' + job.toolNumber}, Material: ${material}, Cumulative: ${jobStartHour.toFixed(2)} → ${jobEndHour.toFixed(2)}`);

            if (jobEndHour < 169) {
                summary[material].week1 += totalMaterial;
            } else if (jobStartHour >= 169) {
                summary[material].week2 += totalMaterial;
            } else {
                const hoursInWeek1 = Math.min(jobEndHour, 169) - jobStartHour;
                const hoursInWeek2 = jobEndHour - 169;

                if (hoursInWeek1 > 0) {
                    const week1Material = totalMaterial * (hoursInWeek1 / totalHours);
                    summary[material].week1 += week1Material;
                }
                if (hoursInWeek2 > 0) {
                    const week2Material = totalMaterial * (hoursInWeek2 / totalHours);
                    summary[material].week2 += week2Material;
                }
            }

            unassignedCumulativeHours = jobEndHour;
        });
    }

    console.log('\n✅ Material summary calculated:', summary);
    console.log('📦 Materials found:', Object.keys(summary));

    return summary;
}

// Setup Drag and Drop
function setupDragAndDrop(container) {
    container.addEventListener('dragover', handleContainerDragOver);
    container.addEventListener('drop', handleContainerDrop);
    container.addEventListener('dragleave', handleDragLeave);
}

let draggedElement = null;
let placeholder = null;

function handleDragStart(e) {
    draggedElement = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);

    const jobId = e.currentTarget.getAttribute('data-job-id');
    e.dataTransfer.setData('jobId', jobId);

    // Add dragging class after a slight delay to avoid flickering
    setTimeout(() => {
        if (draggedElement) {
            draggedElement.classList.add('dragging');
        }
    }, 0);
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');

    // Remove all drag-over classes
    document.querySelectorAll('.drag-over, .drag-over-top, .drag-over-bottom').forEach(el => {
        el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    });

    // Remove placeholder if it exists
    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
    }
    placeholder = null;
    draggedElement = null;
}

function handleDragEnter(e) {
    e.preventDefault();
    const target = e.currentTarget;

    if (target === draggedElement || !target.classList.contains('job-card')) {
        return;
    }
}

function handleCardDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;

    if (target === draggedElement || !target.classList.contains('job-card')) {
        return;
    }

    const rect = target.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    // Remove previous classes
    target.classList.remove('drag-over-top', 'drag-over-bottom');

    // Add class based on cursor position
    if (e.clientY < midpoint) {
        target.classList.add('drag-over-top');
    } else {
        target.classList.add('drag-over-bottom');
    }

    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragLeaveCard(e) {
    const target = e.currentTarget;
    target.classList.remove('drag-over-top', 'drag-over-bottom');
}

function handleContainerDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Add visual feedback to empty containers
    const container = e.currentTarget;
    const hasCards = container.querySelectorAll('.job-card:not(.dragging)').length > 0;
    if (!hasCards) {
        container.classList.add('drag-over');
    }

    return false;
}

function handleDragLeave(e) {
    if (e.currentTarget === e.target) {
        e.currentTarget.classList.remove('drag-over');
    }
}

function handleContainerDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const jobId = e.dataTransfer.getData('jobId');
    const targetMachine = e.currentTarget.getAttribute('data-machine');

    // Find the card being dropped on
    const afterCard = getCardAfterCursor(e.currentTarget, e.clientY);

    // Update job machine and position
    updateJobMachineAndPosition(jobId, targetMachine, afterCard);

    // Clean up all drag-related classes
    document.querySelectorAll('.drag-over, .drag-over-top, .drag-over-bottom').forEach(el => {
        el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    });

    e.currentTarget.classList.remove('drag-over');

    return false;
}

function getCardAfterCursor(container, y) {
    const cards = [...container.querySelectorAll('.job-card:not(.dragging)')];

    return cards.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
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

    // Track cumulative hours per machine
    const machineCumulativeHours = {};

    // Render jobs into their assigned machines
    state.jobs.forEach(job => {
        const container = document.querySelector(`.jobs-container[data-machine="${job.machine}"]`);
        if (container) {
            // Remove empty state if it exists
            const emptyState = container.querySelector('.empty-state');
            if (emptyState) emptyState.remove();

            // Initialize cumulative hours for this machine if not exists
            if (!machineCumulativeHours[job.machine]) {
                machineCumulativeHours[job.machine] = 0;
            }

            // Add this job's hours to cumulative total
            const jobHours = parseFloat(job.totalHours || job.setupHours) || 0;
            machineCumulativeHours[job.machine] += jobHours;

            // Create job card with cumulative hours
            const jobCard = createJobCard(job, machineCumulativeHours[job.machine]);
            container.appendChild(jobCard);
        }
    });

    // Update material summary after rendering jobs
    updateMaterialSummary();
}

// Create Job Card
function createJobCard(job, cumulativeHours) {
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

    // Add drag event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragover', handleCardDragOver);
    card.addEventListener('dragleave', handleDragLeaveCard);

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
                <i class="fas fa-chart-line"></i> Cumulative: ${cumulativeHours.toFixed(2)} hrs
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
                <i class="fas fa-chart-line"></i> Cumulative: ${cumulativeHours.toFixed(2)} hrs
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
        closeModal(document.getElementById('jobModal'));
        await loadJobs();
        renderJobs();
    } catch (error) {
        console.error('Error saving job:', error);
        showToast('Failed to save job', 'error');
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
        closeModal(document.getElementById('setupModal'));
        await loadJobs();
        renderJobs();
    } catch (error) {
        console.error('Error saving setup:', error);
        showToast('Failed to save setup/maintenance', 'error');
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

async function updateJobMachineAndPosition(jobId, targetMachine, afterElement) {
    try {
        // Find the job being moved
        const jobIndex = state.jobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return;

        const job = state.jobs[jobIndex];
        const oldMachine = job.machine;

        // Update machine if it changed
        if (oldMachine !== targetMachine) {
            job.machine = targetMachine;
            await updateJob(jobId, { machine: targetMachine });
        }

        // Reorder jobs in state based on position
        state.jobs.splice(jobIndex, 1); // Remove from current position

        if (afterElement) {
            const afterJobId = afterElement.getAttribute('data-job-id');
            const afterIndex = state.jobs.findIndex(j => j.id === afterJobId);
            if (afterIndex !== -1) {
                state.jobs.splice(afterIndex, 0, job); // Insert before the after element
            } else {
                state.jobs.push(job); // Add to end if not found
            }
        } else {
            // No after element means drop at the end
            state.jobs.push(job);
        }

        // Re-render to show new order
        renderJobs();
        showToast('Job repositioned successfully', 'success');
    } catch (error) {
        console.error('Error updating job position:', error);
        showToast('Failed to reposition job', 'error');
        // Reload jobs to restore correct state
        await loadJobs();
        renderJobs();
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

// Cycle machine priority
window.cyclePriority = async function(machine) {
    const priorityLevels = ['low', 'medium', 'high', 'critical'];
    const currentPriority = getMachinePriority(machine);
    const currentIndex = priorityLevels.indexOf(currentPriority);
    const nextIndex = (currentIndex + 1) % priorityLevels.length;
    const newPriority = priorityLevels[nextIndex];

    console.log(`Cycling priority for ${machine}: ${currentPriority} → ${newPriority}`);

    try {
        const response = await fetch(`${API_BASE_URL}/priorities/${machine}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority: newPriority })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Priority update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update priority');
        }

        const result = await response.json();
        console.log('Priority update successful:', result);

        // Reload priorities and refresh display
        await loadMachinePriorities();
        createMachineColumns();
        renderJobs();

        showToast(`${machine} priority updated to ${newPriority}`, 'success');
    } catch (error) {
        console.error('Error updating priority:', error);
        showToast(`Failed to update priority: ${error.message}`, 'error');
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
