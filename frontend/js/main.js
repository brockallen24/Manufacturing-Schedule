// Manufacturing Schedule Application
// Global State
const state = {
    jobs: [],
    machinePriorities: [],
    editingJobId: null,
    editingSetupId: null,
    archivingJobId: null,
    currentUser: null,
    userRole: null
};

// User credentials (in production, this should be handled by backend)
const USERS = {
    'TTAdmin': { password: 'Admin1', role: 'admin' },
    'TTShop': { password: 'Shopfloor', role: 'shopfloor' }
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
    checkAuthentication();
});

// Check Authentication
function checkAuthentication() {
    const savedUser = sessionStorage.getItem('currentUser');
    const savedRole = sessionStorage.getItem('userRole');

    if (savedUser && savedRole) {
        state.currentUser = savedUser;
        state.userRole = savedRole;
        startApp();
    } else {
        showLoginModal();
    }
}

// Show Login Modal
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    loginModal.style.display = 'flex';

    // Setup login form handler
    const loginForm = document.getElementById('loginForm');
    loginForm.onsubmit = handleLogin;
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');

    if (USERS[username] && USERS[username].password === password) {
        // Login successful
        state.currentUser = username;
        state.userRole = USERS[username].role;

        // Save to session storage
        sessionStorage.setItem('currentUser', username);
        sessionStorage.setItem('userRole', USERS[username].role);

        // Hide login modal and start app
        document.getElementById('loginModal').style.display = 'none';
        loginError.style.display = 'none';
        document.getElementById('loginForm').reset();

        startApp();
    } else {
        // Login failed
        loginError.style.display = 'flex';
        document.getElementById('loginPassword').value = '';
    }
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userRole');
        location.reload();
    }
}

// Start Application
function startApp() {
    initializeApp();
    setupEventListeners();
    applyRoleRestrictions();
    loadData();
    updateUserDisplay();
}

// Initialize Application
function initializeApp() {
    createMachineColumns();
    console.log('Manufacturing Schedule initialized');
}

// Update User Display
function updateUserDisplay() {
    const userSpan = document.getElementById('currentUser');
    if (userSpan) {
        userSpan.textContent = `(${state.currentUser})`;
    }
}

// Apply Role-Based Restrictions
function applyRoleRestrictions() {
    if (state.userRole === 'shopfloor') {
        // Hide all action buttons for shop floor users
        const elementsToHide = [
            'addJobBtn',
            'addSetupBtn',
            'clearAllBtn'
        ];

        elementsToHide.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Add read-only class to body for CSS targeting
        document.body.classList.add('read-only-mode');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal controls
    const jobModal = document.getElementById('jobModal');
    const setupModal = document.getElementById('setupModal');
    const archiveDateModal = document.getElementById('archiveDateModal');
    const addJobBtn = document.getElementById('addJobBtn');
    const addSetupBtn = document.getElementById('addSetupBtn');
    const closeBtn = document.querySelector('.close');
    const closeSetupBtn = document.querySelector('.close-setup');
    const closeArchiveDateBtn = document.querySelector('.close-archive-date');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelSetupBtn = document.getElementById('cancelSetupBtn');
    const cancelArchiveBtn = document.getElementById('cancelArchiveBtn');

    // Open modals
    addJobBtn.addEventListener('click', () => openJobModal());
    addSetupBtn.addEventListener('click', () => openSetupModal());

    // Close modals
    closeBtn.addEventListener('click', () => closeModal(jobModal));
    closeSetupBtn.addEventListener('click', () => closeModal(setupModal));
    closeArchiveDateBtn?.addEventListener('click', () => closeModal(archiveDateModal));
    cancelBtn.addEventListener('click', () => closeModal(jobModal));
    cancelSetupBtn.addEventListener('click', () => closeModal(setupModal));
    cancelArchiveBtn?.addEventListener('click', () => closeModal(archiveDateModal));

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === jobModal) closeModal(jobModal);
        if (e.target === setupModal) closeModal(setupModal);
        if (e.target === archiveDateModal) closeModal(archiveDateModal);
    });

    // Form submissions
    document.getElementById('jobForm').addEventListener('submit', handleJobSubmit);
    document.getElementById('setupForm').addEventListener('submit', handleSetupSubmit);
    document.getElementById('archiveDateForm')?.addEventListener('submit', handleArchiveSubmit);

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

    // Auto-calculate dollar per order
    const dollarPerPart = document.getElementById('dollarPerPart');
    [dollarPerPart, numParts].forEach(input => {
        input?.addEventListener('input', calculateDollarPerOrder);
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
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleTabSwitch(e.target.closest('.tab-btn').dataset.tab));
    });
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

    // Filter out archived jobs - only show active jobs on schedule board
    const activeJobs = state.jobs.filter(job => !job.archived);

    // Render jobs into their assigned machines
    activeJobs.forEach(job => {
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

    // Only make draggable for admin users
    const isDraggable = state.userRole === 'admin';
    card.setAttribute('draggable', isDraggable ? 'true' : 'false');
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

    // Only show action buttons for admin users
    const actionButtons = state.userRole === 'admin' ? `
        <div class="job-actions">
            <button class="job-action-btn" draggable="false" onclick="editJob('${job.id}')" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="job-action-btn job-action-archive" draggable="false" onclick="archiveJob('${job.id}')" title="Archive">
                <i class="fas fa-archive"></i>
            </button>
            <button class="job-action-btn" draggable="false" onclick="deleteJob('${job.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    ` : '';

    if (job.type === 'setup') {
        card.innerHTML = `
            <div class="job-header">
                <div>
                    <div class="job-name"><i class="fas fa-tools"></i> Tool #${job.toolNumber}</div>
                    <div class="work-order">Status: ${job.toolReady === 'yes' ? 'Ready' : 'Not Ready'}</div>
                </div>
                ${actionButtons}
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
                ${actionButtons}
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
            document.getElementById('gramsPerPart').value = job.gramsPerPart || '';
            document.getElementById('totalMaterial').value = job.totalMaterial || '';
            document.getElementById('dollarPerPart').value = job.dollarPerPart || '';
            document.getElementById('dollarPerOrder').value = job.dollarPerOrder || '';
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
        numParts: parseInt(document.getElementById('numParts').value) || 0,
        cycleTime: parseFloat(document.getElementById('cycleTime').value) || 0,
        numCavities: parseInt(document.getElementById('numCavities').value) || 0,
        material: document.getElementById('material').value,
        gramsPerPart: parseFloat(document.getElementById('gramsPerPart').value) || 0,
        totalMaterial: parseFloat(document.getElementById('totalMaterial').value) || 0,
        dollarPerPart: parseFloat(document.getElementById('dollarPerPart').value) || 0,
        dollarPerOrder: parseFloat(document.getElementById('dollarPerOrder').value) || 0,
        totalHours: parseFloat(document.getElementById('totalHours').value) || 0,
        dueDate: document.getElementById('dueDate').value,
        percentComplete: parseInt(document.getElementById('percentComplete').value) || 0,
        machine: document.getElementById('machineSelect').value
    };

    // Validate required fields
    if (!jobData.jobName || !jobData.machine) {
        showToast('Job name and machine are required', 'error');
        return;
    }

    // Clean the data - remove NaN values and convert to proper types
    Object.keys(jobData).forEach(key => {
        if (typeof jobData[key] === 'number' && isNaN(jobData[key])) {
            jobData[key] = 0;
        }
    });

    console.log('Submitting job data:', jobData);

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
    console.log('Creating job with data:', jobData);
    const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create job. Status:', response.status, 'Response:', errorText);
        let errorMessage = `Failed to create job (${response.status})`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
                errorMessage += `: ${errorJson.message}`;
            }
        } catch (e) {
            // Not JSON, use text
            if (errorText) {
                errorMessage += `: ${errorText}`;
            }
        }
        throw new Error(errorMessage);
    }
    return await response.json();
}

async function updateJob(jobId, jobData) {
    console.log('Updating job', jobId, 'with data:', jobData);
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update job. Status:', response.status, 'Response:', errorText);
        let errorMessage = `Failed to update job (${response.status})`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
                errorMessage += `: ${errorJson.message}`;
            }
        } catch (e) {
            // Not JSON, use text
            if (errorText) {
                errorMessage += `: ${errorText}`;
            }
        }
        throw new Error(errorMessage);
    }
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

// Archive Job
window.archiveJob = function(jobId) {
    // Store the job ID for later use
    state.archivingJobId = jobId;

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateCompleted').value = today;

    // Open the modal
    document.getElementById('archiveDateModal').style.display = 'block';
};

// Handle Archive Submit
async function handleArchiveSubmit(e) {
    e.preventDefault();

    const jobId = state.archivingJobId;
    const dateCompleted = document.getElementById('dateCompleted').value;

    if (!jobId || !dateCompleted) {
        showToast('Job ID and date are required', 'error');
        return;
    }

    try {
        // Update the job with dateCompleted and archived flag
        await updateJob(jobId, {
            dateCompleted: dateCompleted,
            archived: true
        });

        showToast('Job archived successfully', 'success');

        // Close modal
        document.getElementById('archiveDateModal').style.display = 'none';

        // Reload and re-render
        await loadJobs();
        renderJobs();

        // Clear the archiving job ID
        state.archivingJobId = null;
    } catch (error) {
        console.error('Error archiving job:', error);
        showToast('Failed to archive job', 'error');
    }
}

// Unarchive Job (restore to schedule)
window.unarchiveJob = async function(jobId) {
    if (!confirm('Restore this job to the schedule?')) return;

    try {
        await updateJob(jobId, {
            dateCompleted: null,
            archived: false
        });

        showToast('Job restored to schedule', 'success');
        await loadJobs();
        renderJobs();
        renderArchive();
    } catch (error) {
        console.error('Error unarchiving job:', error);
        showToast('Failed to unarchive job', 'error');
    }
};

// Cycle machine priority
window.cyclePriority = async function(machine) {
    // Only allow admin users to change priority
    if (state.userRole !== 'admin') {
        return;
    }

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

function calculateTotalMaterial() {
    const gramsPerPart = parseFloat(document.getElementById('gramsPerPart')?.value) || 0;
    const numParts = parseInt(document.getElementById('numParts')?.value) || 0;

    // Convert grams to pounds: (grams / 454) * numParts
    const totalMaterialLbs = (gramsPerPart / 454) * numParts;

    const totalMaterialInput = document.getElementById('totalMaterial');
    if (totalMaterialInput) {
        totalMaterialInput.value = totalMaterialLbs.toFixed(2);
    }
}

function calculateDollarPerOrder() {
    const dollarPerPart = parseFloat(document.getElementById('dollarPerPart')?.value) || 0;
    const numParts = parseInt(document.getElementById('numParts')?.value) || 0;

    const dollarPerOrder = dollarPerPart * numParts;

    const dollarPerOrderInput = document.getElementById('dollarPerOrder');
    if (dollarPerOrderInput) {
        dollarPerOrderInput.value = dollarPerOrder.toFixed(2);
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

// ===========================
// Tab Navigation Functions
// ===========================

function handleTabSwitch(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`[data-tab-content="${tabName}"]`).classList.add('active');

    // If switching to priorities tab, render priorities
    if (tabName === 'priorities') {
        renderPriorities();
    }

    // If switching to archive tab, render archive
    if (tabName === 'archive') {
        renderArchive();
    }
}

// ===========================
// Priorities View Functions
// ===========================

function renderPriorities() {
    const prioritiesList = document.getElementById('prioritiesList');

    // Get first item from each machine in the order they appear in state.jobs
    const priorities = [];
    const seenMachines = new Set();

    // Iterate through state.jobs in order and pick the first item from each machine
    state.jobs.forEach(item => {
        if (!seenMachines.has(item.machine)) {
            priorities.push(item);
            seenMachines.add(item.machine);
        }
    });

    console.log('Rendering priorities:', priorities.map(p => ({machine: p.machine, name: p.jobName || p.toolNumber})));

    // Check if there are any priorities
    if (priorities.length === 0) {
        prioritiesList.innerHTML = `
            <div class="priorities-empty-state">
                <i class="fas fa-inbox"></i>
                <p>No jobs or setups scheduled yet. Add items to see priorities here.</p>
            </div>
        `;
        return;
    }

    // Render priority items
    prioritiesList.innerHTML = priorities.map(item => createPriorityItem(item)).join('');

    // Setup drag and drop for priorities
    setupPrioritiesDragAndDrop();

    // Setup notes editing
    setupPriorityNotesEditing();
}

function createPriorityItem(item) {
    const priority = item.priority || 'medium';
    const priorityNotes = item.priorityNotes || '';
    const isSetup = item.type === 'setup';

    // For setup items, use different styling
    const itemTypeClass = isSetup ? 'priority-item-setup' : 'priority-item-job';
    const itemTypeIcon = isSetup ? 'fa-tools' : 'fa-briefcase';
    const itemTypeBadgeColor = isSetup ? (item.toolReady === 'ready' ? '#10b981' : '#ef4444') : '';

    // Only show drag handle for admin users
    const dragHandle = state.userRole === 'admin' ? `
        <div class="priority-drag-handle" title="Drag to reorder">
            <i class="fas fa-grip-vertical"></i>
        </div>
    ` : '';

    // Disable textarea for shop floor users
    const textareaDisabled = state.userRole === 'shopfloor' ? 'readonly' : '';

    return `
        <div class="priority-item ${itemTypeClass}"
             data-job-id="${item.id}"
             data-machine="${item.machine}"
             data-priority="${priority}"
             data-type="${item.type}"
             draggable="false"
             ${isSetup && itemTypeBadgeColor ? `style="border-left-color: ${itemTypeBadgeColor};"` : ''}>
            ${dragHandle}
            <div class="priority-job-info">
                <div class="priority-machine-badge" ${isSetup && itemTypeBadgeColor ? `style="background-color: ${itemTypeBadgeColor};"` : ''}>
                    <i class="fas ${itemTypeIcon}"></i>
                    Machine ${item.machine}
                    ${isSetup ? ' - Setup' : ''}
                </div>
                <h3 class="priority-job-name">${item.jobName || item.toolNumber || 'Untitled'}</h3>
                <div class="priority-job-details">
                    ${isSetup ? `
                        <div class="priority-detail-item">
                            <i class="fas fa-wrench"></i>
                            <span>Tool #: <strong>${item.toolNumber || 'N/A'}</strong></span>
                        </div>
                        <div class="priority-detail-item">
                            <i class="fas ${item.toolReady === 'ready' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            <span>Mold: <strong>${item.toolReady === 'ready' ? 'Ready' : 'Not Ready'}</strong></span>
                        </div>
                        <div class="priority-detail-item">
                            <i class="fas fa-clock"></i>
                            <span><strong>${(item.setupHours || 0).toFixed(1)}</strong> hrs</span>
                        </div>
                        ${item.setupNotes ? `
                        <div class="priority-detail-item">
                            <i class="fas fa-comment"></i>
                            <span>${item.setupNotes}</span>
                        </div>
                        ` : ''}
                    ` : `
                        <div class="priority-detail-item">
                            <i class="fas fa-file-alt"></i>
                            <span>WO: <strong>${item.workOrder || 'N/A'}</strong></span>
                        </div>
                        <div class="priority-detail-item">
                            <i class="fas fa-cubes"></i>
                            <span><strong>${item.numParts || 0}</strong> parts</span>
                        </div>
                        <div class="priority-detail-item">
                            <i class="fas fa-clock"></i>
                            <span><strong>${(item.totalHours || 0).toFixed(1)}</strong> hrs</span>
                        </div>
                        <div class="priority-detail-item">
                            <i class="fas fa-layer-group"></i>
                            <span>${item.material || 'N/A'}</span>
                        </div>
                        ${item.dueDate ? `
                        <div class="priority-detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>Due: <strong>${formatDate(item.dueDate)}</strong></span>
                        </div>
                        ` : ''}
                    `}
                </div>
            </div>
            <div class="priority-notes-section">
                <label class="priority-notes-label">
                    <i class="fas fa-sticky-note"></i>
                    Priority Notes
                </label>
                <textarea
                    class="priority-notes-textarea"
                    data-job-id="${item.id}"
                    placeholder="Add notes for this priority ${isSetup ? 'setup' : 'job'}..."
                    ${textareaDisabled}
                >${priorityNotes}</textarea>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===========================
// Archive View Functions
// ===========================

function renderArchive() {
    const archiveList = document.getElementById('archiveList');

    // Get archived jobs
    const archivedJobs = state.jobs.filter(job => job.archived === true);

    console.log('Rendering archive:', archivedJobs.length, 'archived jobs');

    // Check if there are any archived jobs
    if (archivedJobs.length === 0) {
        archiveList.innerHTML = `
            <div class="archive-empty-state">
                <i class="fas fa-inbox"></i>
                <p>No archived jobs yet. Archive completed jobs to see them here.</p>
            </div>
        `;
        return;
    }

    // Sort by date completed (most recent first)
    archivedJobs.sort((a, b) => {
        const dateA = new Date(a.dateCompleted || 0);
        const dateB = new Date(b.dateCompleted || 0);
        return dateB - dateA;
    });

    // Render archive items
    archiveList.innerHTML = archivedJobs.map(job => createArchiveItem(job)).join('');
}

function createArchiveItem(job) {
    const isSetup = job.type === 'setup';
    const priority = job.priority || 'medium';

    // Only show archive actions for admin users
    const archiveActions = state.userRole === 'admin' ? `
        <div class="archive-actions">
            <button class="btn btn-secondary btn-sm" onclick="unarchiveJob('${job.id}')" title="Restore to Schedule">
                <i class="fas fa-undo"></i> Restore
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteJob('${job.id}')" title="Delete Permanently">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    ` : '';

    return `
        <div class="archive-item" data-job-id="${job.id}" data-priority="${priority}">
            <div class="archive-item-header">
                <div class="archive-item-info">
                    <div class="archive-machine-badge">
                        <i class="fas ${isSetup ? 'fa-tools' : 'fa-briefcase'}"></i>
                        Machine ${job.machine}
                    </div>
                    <h3 class="archive-job-name">${job.jobName || job.toolNumber || 'Untitled'}</h3>
                </div>
                ${archiveActions}
            </div>
            <div class="archive-item-details">
                ${isSetup ? `
                    <div class="archive-detail">
                        <i class="fas fa-wrench"></i>
                        <span>Tool #: <strong>${job.toolNumber || 'N/A'}</strong></span>
                    </div>
                    <div class="archive-detail">
                        <i class="fas fa-clock"></i>
                        <span><strong>${(job.setupHours || 0).toFixed(1)}</strong> hrs</span>
                    </div>
                ` : `
                    <div class="archive-detail">
                        <i class="fas fa-file-alt"></i>
                        <span>WO: <strong>${job.workOrder || 'N/A'}</strong></span>
                    </div>
                    <div class="archive-detail">
                        <i class="fas fa-cubes"></i>
                        <span><strong>${job.numParts || 0}</strong> parts</span>
                    </div>
                    <div class="archive-detail">
                        <i class="fas fa-clock"></i>
                        <span><strong>${(job.totalHours || 0).toFixed(1)}</strong> hrs</span>
                    </div>
                    <div class="archive-detail">
                        <i class="fas fa-layer-group"></i>
                        <span>${job.material || 'N/A'}</span>
                    </div>
                `}
                <div class="archive-detail archive-date-completed">
                    <i class="fas fa-calendar-check"></i>
                    <span>Completed: <strong>${formatDate(new Date(job.dateCompleted))}</strong></span>
                </div>
            </div>
        </div>
    `;
}

// ===========================
// Priorities Drag and Drop
// ===========================

let dragState = {
    draggedItem: null,
    autoScrollInterval: null,
    scrollSpeed: 0,
    placeholder: null
};

function setupPrioritiesDragAndDrop() {
    // Skip drag and drop setup for shop floor users
    if (state.userRole !== 'admin') {
        return;
    }

    const prioritiesList = document.getElementById('prioritiesList');
    const priorityItems = document.querySelectorAll('.priority-item');

    // Remove any existing listeners
    prioritiesList.removeEventListener('dragover', handlePriorityDragOver);
    prioritiesList.removeEventListener('drop', handlePriorityDrop);

    priorityItems.forEach(item => {
        // Make only the drag handle draggable
        const dragHandle = item.querySelector('.priority-drag-handle');

        // Prevent dragging from other elements
        item.draggable = false;

        if (dragHandle) {
            dragHandle.addEventListener('mousedown', function(e) {
                // Enable dragging on the parent item
                item.draggable = true;
            });

            dragHandle.addEventListener('mouseup', function(e) {
                // Disable dragging after release
                setTimeout(() => {
                    item.draggable = false;
                }, 100);
            });
        }

        item.addEventListener('dragstart', handlePriorityDragStart);
        item.addEventListener('dragend', handlePriorityDragEnd);
        item.addEventListener('dragover', handleItemDragOver);
    });

    // Add dragover to the container for better handling
    prioritiesList.addEventListener('dragover', handlePriorityDragOver);
    prioritiesList.addEventListener('drop', handlePriorityDrop);

    function handlePriorityDragStart(e) {
        // Only allow drag if draggable is true
        if (!this.draggable) {
            e.preventDefault();
            return;
        }

        dragState.draggedItem = this;
        this.classList.add('dragging');

        // Set drag image to be the entire item
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.jobId);

        // Create a visual placeholder
        setTimeout(() => {
            this.style.opacity = '0.4';
        }, 0);

        // Start auto-scroll checking
        startAutoScroll();
    }

    function handleItemDragOver(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this === dragState.draggedItem) {
            return;
        }

        // Determine if we should insert before or after this element
        const rect = this.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (e.clientY < midpoint) {
            // Insert before
            this.classList.add('drag-over-top');
            this.classList.remove('drag-over-bottom');
        } else {
            // Insert after
            this.classList.add('drag-over-bottom');
            this.classList.remove('drag-over-top');
        }
    }

    function handlePriorityDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (!dragState.draggedItem) return;

        // Update auto-scroll speed based on cursor position
        updateAutoScroll(e.clientY);

        const afterElement = getDragAfterElement(prioritiesList, e.clientY);
        const draggable = dragState.draggedItem;

        if (!draggable) return;

        // Remove all drag-over classes
        document.querySelectorAll('.priority-item').forEach(item => {
            if (item !== draggable) {
                item.classList.remove('drag-over-top', 'drag-over-bottom');
            }
        });

        if (afterElement == null) {
            prioritiesList.appendChild(draggable);
        } else {
            const rect = afterElement.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;

            if (e.clientY < midpoint) {
                prioritiesList.insertBefore(draggable, afterElement);
                afterElement.classList.add('drag-over-top');
            } else {
                const nextSibling = afterElement.nextElementSibling;
                if (nextSibling) {
                    prioritiesList.insertBefore(draggable, nextSibling);
                } else {
                    prioritiesList.appendChild(draggable);
                }
                afterElement.classList.add('drag-over-bottom');
            }
        }
    }

    function handlePriorityDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        stopAutoScroll();

        if (!dragState.draggedItem) return;

        // Get the new order from the DOM BEFORE cleaning up
        const newOrder = Array.from(prioritiesList.querySelectorAll('.priority-item')).map(item => ({
            jobId: item.dataset.jobId,
            machine: item.dataset.machine,
            type: item.dataset.type
        }));

        console.log('DROP: New order from DOM:', newOrder.map(o => `${o.machine}:${o.jobId.substring(0, 8)}`).join(', '));

        // Remove all visual feedback
        document.querySelectorAll('.priority-item').forEach(item => {
            item.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
            item.style.opacity = '1';
            item.draggable = false;
        });

        // Save the new order (but DON'T re-render - keep DOM as-is)
        reorderPriorities(newOrder, false); // Pass false to skip re-render

        dragState.draggedItem = null;
    }

    function handlePriorityDragEnd(e) {
        this.classList.remove('dragging');
        this.style.opacity = '1';
        this.draggable = false;
        stopAutoScroll();

        // Clean up any drag-over classes
        document.querySelectorAll('.priority-item').forEach(item => {
            item.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        dragState.draggedItem = null;
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.priority-item:not(.dragging)')];

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
}

function startAutoScroll() {
    // Clear any existing interval
    stopAutoScroll();

    // Start checking for auto-scroll every 16ms (~60fps)
    dragState.autoScrollInterval = setInterval(() => {
        if (dragState.scrollSpeed !== 0) {
            window.scrollBy(0, dragState.scrollSpeed);
        }
    }, 16);
}

function stopAutoScroll() {
    if (dragState.autoScrollInterval) {
        clearInterval(dragState.autoScrollInterval);
        dragState.autoScrollInterval = null;
    }
    dragState.scrollSpeed = 0;
}

function updateAutoScroll(clientY) {
    const scrollZone = 100; // pixels from edge to start scrolling
    const maxScrollSpeed = 15; // max pixels per frame
    const viewportHeight = window.innerHeight;

    // Distance from top
    const distanceFromTop = clientY;
    // Distance from bottom
    const distanceFromBottom = viewportHeight - clientY;

    if (distanceFromTop < scrollZone) {
        // Scroll up - closer to edge = faster scroll
        const intensity = (scrollZone - distanceFromTop) / scrollZone;
        dragState.scrollSpeed = -intensity * maxScrollSpeed;
    } else if (distanceFromBottom < scrollZone) {
        // Scroll down - closer to edge = faster scroll
        const intensity = (scrollZone - distanceFromBottom) / scrollZone;
        dragState.scrollSpeed = intensity * maxScrollSpeed;
    } else {
        // No scrolling needed
        dragState.scrollSpeed = 0;
    }
}

async function reorderPriorities(newOrder, shouldRerender = true) {
    try {
        console.log('🔄 REORDER: Starting with', newOrder.length, 'priority items');
        console.log('🔄 REORDER: New order:', newOrder.map(o => `${o.machine}:${o.type}`).join(', '));

        // Build a completely new jobs array based on the priority order
        const reorderedJobs = [];

        // Track which jobs we've added
        const addedJobIds = new Set();

        // Step 1: Add all jobs from newOrder (these are the first items from each machine in new order)
        newOrder.forEach(item => {
            const job = state.jobs.find(j => j.id === item.jobId);
            if (job) {
                reorderedJobs.push(job);
                addedJobIds.add(job.id);
                console.log(`  ✅ Added priority: ${job.machine} - ${job.jobName || job.toolNumber}`);
            } else {
                console.log(`  ❌ NOT FOUND: ${item.jobId}`);
            }
        });

        // Step 2: For each machine in the new order, add any remaining jobs from that machine
        newOrder.forEach(item => {
            const remainingMachineJobs = state.jobs.filter(j =>
                j.machine === item.machine &&
                !addedJobIds.has(j.id)
            );
            remainingMachineJobs.forEach(job => {
                reorderedJobs.push(job);
                addedJobIds.add(job.id);
                console.log(`  ➕ Added remaining: ${job.machine} - ${job.jobName || job.toolNumber}`);
            });
        });

        // Step 3: Add any jobs from machines not in the priority list (shouldn't happen, but just in case)
        state.jobs.forEach(job => {
            if (!addedJobIds.has(job.id)) {
                reorderedJobs.push(job);
                addedJobIds.add(job.id);
                console.log(`  ⚠️ Added orphan: ${job.machine} - ${job.jobName || job.toolNumber}`);
            }
        });

        console.log('✅ REORDER: Final array has', reorderedJobs.length, 'items');
        console.log('✅ REORDER: Original had', state.jobs.length, 'items');

        // Update state
        const oldJobs = state.jobs;
        state.jobs = reorderedJobs;

        console.log('💾 REORDER: State updated');

        // Only re-render if requested
        if (shouldRerender) {
            console.log('🎨 REORDER: Re-rendering views...');
            renderJobs();
            renderPriorities();
        } else {
            console.log('⏭️ REORDER: Skipping re-render, keeping DOM as-is');
            // Just update the schedule board silently
            renderJobs();
        }

        showToast('Priority order updated', 'success');

    } catch (error) {
        console.error('❌ Error reordering priorities:', error);
        showToast('Error updating priority order', 'error');
        // Reload to get correct state
        await loadJobs();
        renderJobs();
        renderPriorities();
    }
}

// ===========================
// Priority Notes Editing
// ===========================

function setupPriorityNotesEditing() {
    const notesTextareas = document.querySelectorAll('.priority-notes-textarea');

    notesTextareas.forEach(textarea => {
        // Debounce to avoid too many API calls
        let debounceTimer;
        textarea.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                await savePriorityNotes(this.dataset.jobId, this.value);
            }, 1000); // Save 1 second after user stops typing
        });

        // Also save on blur
        textarea.addEventListener('blur', async function() {
            await savePriorityNotes(this.dataset.jobId, this.value);
        });
    });
}

async function savePriorityNotes(jobId, notes) {
    try {
        await updateJob(jobId, { priorityNotes: notes });

        // Update in local state
        const job = state.jobs.find(j => j.id === jobId);
        if (job) {
            job.priorityNotes = notes;
        }

        console.log('Priority notes saved for job:', jobId);
    } catch (error) {
        console.error('Error saving priority notes:', error);
        showToast('Error saving notes', 'error');
    }
}
