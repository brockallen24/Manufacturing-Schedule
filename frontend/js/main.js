// Manufacturing Schedule - Main JavaScript
// API-integrated version for multi-workstation data sharing

// ============================================
// CONFIGURATION
// ============================================

// API Base URL - UPDATE THIS after deploying to Heroku
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://your-heroku-app-name.herokuapp.com/api';

// Machine list
const MACHINES = [
  '22', '55', '90-1', '90-2', '90-3', 'Sumi1',
  '170-1', '170-2', 'Sumi2', '260-1', '260-2', '260-3', '260-4',
  '500-1', '500-2', '550', '770', '950',
  '1100-1', '1100-2', '1200-1', '1200-2'
];

// Priority levels
const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'];

// ============================================
// STATE
// ============================================

let jobs = [];
let priorities = {};
let editingJobId = null;
let editingSetupId = null;
let isOnline = true;

// ============================================
// API FUNCTIONS
// ============================================

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    updateConnectionStatus(false);
    throw error;
  }
}

// Jobs API
async function fetchJobs() {
  try {
    const data = await apiRequest('/jobs');
    jobs = data.jobs || [];
    updateConnectionStatus(true);
    return jobs;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    // Fall back to localStorage if API fails
    loadFromLocalStorage();
    return jobs;
  }
}

async function createJob(jobData) {
  try {
    const data = await apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
    jobs.push(data.job);
    saveToLocalStorage(); // Backup
    return data.job;
  } catch (error) {
    // Fallback: save locally
    jobData.id = generateId();
    jobs.push(jobData);
    saveToLocalStorage();
    return jobData;
  }
}

async function updateJob(jobId, jobData) {
  try {
    const data = await apiRequest(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    });
    const index = jobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      jobs[index] = data.job;
    }
    saveToLocalStorage(); // Backup
    return data.job;
  } catch (error) {
    // Fallback: update locally
    const index = jobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...jobData };
    }
    saveToLocalStorage();
    return jobs[index];
  }
}

async function deleteJob(jobId) {
  try {
    await apiRequest(`/jobs/${jobId}`, {
      method: 'DELETE'
    });
    jobs = jobs.filter(j => j.id !== jobId);
    saveToLocalStorage(); // Backup
  } catch (error) {
    // Fallback: delete locally
    jobs = jobs.filter(j => j.id !== jobId);
    saveToLocalStorage();
  }
}

// Priorities API
async function fetchPriorities() {
  try {
    const data = await apiRequest('/priorities');
    priorities = data.priorities || {};
    updateConnectionStatus(true);
    return priorities;
  } catch (error) {
    console.error('Failed to fetch priorities:', error);
    loadPrioritiesFromLocalStorage();
    return priorities;
  }
}

async function updatePriority(machine, priority) {
  try {
    await apiRequest(`/priorities/${machine}`, {
      method: 'PUT',
      body: JSON.stringify({ priority })
    });
    priorities[machine] = priority;
    savePrioritiesToLocalStorage(); // Backup
  } catch (error) {
    // Fallback: save locally
    priorities[machine] = priority;
    savePrioritiesToLocalStorage();
  }
}

// ============================================
// LOCAL STORAGE FALLBACK
// ============================================

function saveToLocalStorage() {
  localStorage.setItem('manufacturingScheduleJobs', JSON.stringify(jobs));
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem('manufacturingScheduleJobs');
  if (stored) {
    jobs = JSON.parse(stored);
  }
}

function savePrioritiesToLocalStorage() {
  localStorage.setItem('manufacturingSchedulePriorities', JSON.stringify(priorities));
}

function loadPrioritiesFromLocalStorage() {
  const stored = localStorage.getItem('manufacturingSchedulePriorities');
  if (stored) {
    priorities = JSON.parse(stored);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
  return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function calculateTotalHours(numParts, cycleTime, numCavities) {
  if (!numParts || !cycleTime || !numCavities) return 0;
  const partsPerHour = (3600 / cycleTime) * numCavities;
  return (numParts / partsPerHour).toFixed(2);
}

function updateConnectionStatus(connected) {
  isOnline = connected;
  const statusEl = document.getElementById('connectionStatus');
  if (statusEl) {
    statusEl.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
    statusEl.innerHTML = `
      <span class="status-dot"></span>
      ${connected ? 'Connected to server' : 'Offline mode'}
    `;
  }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderScheduleBoard() {
  const board = document.getElementById('scheduleBoard');
  board.innerHTML = '';

  MACHINES.forEach(machine => {
    const column = createMachineColumn(machine);
    board.appendChild(column);
  });
}

function createMachineColumn(machine) {
  const column = document.createElement('div');
  column.className = 'machine-column';
  column.dataset.machine = machine;

  const machineJobs = jobs.filter(job => job.machine === machine);
  const priority = priorities[machine] || 'low';

  // Calculate totals
  const totalHours = machineJobs.reduce((sum, job) => sum + (parseFloat(job.totalHours) || 0), 0);
  const totalMaterial = machineJobs.reduce((sum, job) => sum + (parseFloat(job.totalMaterial) || 0), 0);

  // Material breakdown
  const materialBreakdown = {};
  machineJobs.forEach(job => {
    if (job.material && job.totalMaterial) {
      if (!materialBreakdown[job.material]) {
        materialBreakdown[job.material] = 0;
      }
      materialBreakdown[job.material] += parseFloat(job.totalMaterial) || 0;
    }
  });

  column.innerHTML = `
    <div class="machine-header">
      <h3>${machine}</h3>
      <span class="priority-badge priority-${priority}" data-machine="${machine}">${priority}</span>
    </div>
    <div class="jobs-container" data-machine="${machine}">
      ${renderJobs(machineJobs)}
    </div>
    <div class="machine-totals">
      <p><span>Total Hours:</span> <strong>${totalHours.toFixed(2)} hrs</strong></p>
      <p><span>Total Material:</span> <strong>${totalMaterial.toFixed(2)} lbs</strong></p>
      ${Object.keys(materialBreakdown).length > 0 ? `
        <div class="material-breakdown">
          <h4>By Material</h4>
          ${Object.entries(materialBreakdown).map(([mat, amt]) =>
            `<div class="material-item"><span>${mat}:</span> <span>${amt.toFixed(2)} lbs</span></div>`
          ).join('')}
        </div>
      ` : ''}
    </div>
  `;

  // Setup drag and drop
  const jobsContainer = column.querySelector('.jobs-container');
  setupDragAndDrop(jobsContainer);

  // Setup priority click
  const priorityBadge = column.querySelector('.priority-badge');
  priorityBadge.addEventListener('click', () => cyclePriority(machine));

  return column;
}

function renderJobs(machineJobs) {
  let cumulativeHours = 0;

  return machineJobs.map(job => {
    cumulativeHours += parseFloat(job.totalHours) || 0;
    const daysToComplete = (cumulativeHours / 24).toFixed(2);
    const percentComplete = job.percentComplete || 0;

    if (job.type === 'setup') {
      return `
        <div class="job-block ${job.toolReady === 'yes' ? 'setup-ready' : 'setup-not-ready'}"
             draggable="true"
             data-id="${job.id}"
             data-type="setup">
          <div class="job-content">
            <div class="job-header">
              <span class="job-title"><i class="fas fa-tools"></i> Setup: ${job.toolNumber || 'N/A'}</span>
              <div class="job-actions">
                <button class="edit-btn" onclick="editSetup('${job.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="confirmDelete('${job.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div class="job-details">
              <p><i class="fas fa-check-circle"></i> Tool Ready: <strong>${job.toolReady === 'yes' ? 'Yes' : 'No'}</strong></p>
              <p><i class="fas fa-clock"></i> Hours: <strong>${job.totalHours || 0}</strong></p>
              ${job.setupNotes ? `<p><i class="fas fa-sticky-note"></i> ${job.setupNotes}</p>` : ''}
              <p class="days-to-complete"><i class="fas fa-calendar-check"></i> Days to Complete: ${daysToComplete}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar" onclick="updateProgress(event, '${job.id}')">
              <div class="progress-fill" style="height: ${percentComplete}%"></div>
            </div>
            <span class="progress-text">${percentComplete}%</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="job-block"
           draggable="true"
           data-id="${job.id}"
           data-type="job">
        <div class="job-content">
          <div class="job-header">
            <span class="job-title">${job.jobName || 'Untitled'}</span>
            <div class="job-actions">
              <button class="edit-btn" onclick="editJob('${job.id}')"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" onclick="confirmDelete('${job.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="job-details">
            <p><i class="fas fa-file-alt"></i> WO: <strong>${job.workOrder || 'N/A'}</strong></p>
            <p><i class="fas fa-cubes"></i> Parts: <strong>${job.numParts || 0}</strong></p>
            <p><i class="fas fa-grip-horizontal"></i> Cavities: <strong>${job.numCavities || 0}</strong></p>
            <p><i class="fas fa-clock"></i> Cycle: <strong>${job.cycleTime || 0}s</strong></p>
            <p><i class="fas fa-layer-group"></i> Material: <strong>${job.material || 'N/A'}</strong></p>
            <p><i class="fas fa-weight-hanging"></i> Total Mat: <strong>${job.totalMaterial || 0} lbs</strong></p>
            <p><i class="fas fa-hourglass-half"></i> Hours: <strong>${job.totalHours || 0}</strong></p>
            <p><i class="fas fa-calendar-alt"></i> Due: <strong>${job.dueDate || 'N/A'}</strong></p>
            <p class="days-to-complete"><i class="fas fa-calendar-check"></i> Days to Complete: ${daysToComplete}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar" onclick="updateProgress(event, '${job.id}')">
            <div class="progress-fill" style="height: ${percentComplete}%"></div>
          </div>
          <span class="progress-text">${percentComplete}%</span>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// DRAG AND DROP
// ============================================

function setupDragAndDrop(container) {
  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('dragenter', handleDragEnter);
  container.addEventListener('dragleave', handleDragLeave);
  container.addEventListener('drop', handleDrop);

  // Setup draggable items after render
  setTimeout(() => {
    container.querySelectorAll('.job-block').forEach(block => {
      block.addEventListener('dragstart', handleDragStart);
      block.addEventListener('dragend', handleDragEnd);
    });
  }, 0);
}

function handleDragStart(e) {
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  const jobId = e.dataTransfer.getData('text/plain');
  const newMachine = e.currentTarget.dataset.machine;

  const job = jobs.find(j => j.id === jobId);
  if (job && job.machine !== newMachine) {
    job.machine = newMachine;
    await updateJob(jobId, { machine: newMachine });
    renderScheduleBoard();
  }
}

// ============================================
// PRIORITY MANAGEMENT
// ============================================

async function cyclePriority(machine) {
  const currentPriority = priorities[machine] || 'low';
  const currentIndex = PRIORITY_LEVELS.indexOf(currentPriority);
  const newPriority = PRIORITY_LEVELS[(currentIndex + 1) % PRIORITY_LEVELS.length];

  await updatePriority(machine, newPriority);
  renderScheduleBoard();
}

// ============================================
// PROGRESS UPDATE
// ============================================

async function updateProgress(event, jobId) {
  event.stopPropagation();
  const progressBar = event.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const clickY = event.clientY - rect.top;
  const percentage = Math.round(100 - (clickY / rect.height) * 100);
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const job = jobs.find(j => j.id === jobId);
  if (job) {
    job.percentComplete = clampedPercentage;
    await updateJob(jobId, { percentComplete: clampedPercentage });
    renderScheduleBoard();
  }
}

// ============================================
// MODAL HANDLERS
// ============================================

function openJobModal(jobId = null) {
  const modal = document.getElementById('jobModal');
  const form = document.getElementById('jobForm');
  const title = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');

  form.reset();
  editingJobId = jobId;

  if (jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      title.textContent = 'Edit Job';
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Job';

      document.getElementById('jobName').value = job.jobName || '';
      document.getElementById('workOrder').value = job.workOrder || '';
      document.getElementById('numParts').value = job.numParts || '';
      document.getElementById('numCavities').value = job.numCavities || '';
      document.getElementById('cycleTime').value = job.cycleTime || '';
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
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Job';
  }

  modal.classList.add('show');
}

function closeJobModal() {
  const modal = document.getElementById('jobModal');
  modal.classList.remove('show');
  editingJobId = null;
}

function openSetupModal(setupId = null) {
  const modal = document.getElementById('setupModal');
  const form = document.getElementById('setupForm');
  const title = document.getElementById('setupModalTitle');
  const submitBtn = document.getElementById('submitSetupBtn');

  form.reset();
  editingSetupId = setupId;

  if (setupId) {
    const setup = jobs.find(j => j.id === setupId);
    if (setup) {
      title.textContent = 'Edit Setup/Maintenance';
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Setup';

      document.getElementById('toolNumber').value = setup.toolNumber || '';
      document.getElementById('toolReady').value = setup.toolReady || '';
      document.getElementById('setupHours').value = setup.totalHours || '';
      document.getElementById('setupNotes').value = setup.setupNotes || '';
      document.getElementById('setupPercentComplete').value = setup.percentComplete || 0;
      document.getElementById('setupPercentCompleteValue').textContent = setup.percentComplete || 0;
      document.getElementById('setupMachineSelect').value = setup.machine || '';
    }
  } else {
    title.textContent = 'Add Setup/Maintenance';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Setup/Maintenance';
  }

  modal.classList.add('show');
}

function closeSetupModal() {
  const modal = document.getElementById('setupModal');
  modal.classList.remove('show');
  editingSetupId = null;
}

// ============================================
// FORM HANDLERS
// ============================================

async function handleJobSubmit(e) {
  e.preventDefault();

  const jobData = {
    type: 'job',
    jobName: document.getElementById('jobName').value,
    workOrder: document.getElementById('workOrder').value,
    numParts: parseInt(document.getElementById('numParts').value) || 0,
    numCavities: parseInt(document.getElementById('numCavities').value) || 0,
    cycleTime: parseFloat(document.getElementById('cycleTime').value) || 0,
    material: document.getElementById('material').value,
    totalMaterial: parseFloat(document.getElementById('totalMaterial').value) || 0,
    totalHours: parseFloat(document.getElementById('totalHours').value) || 0,
    dueDate: document.getElementById('dueDate').value,
    percentComplete: parseInt(document.getElementById('percentComplete').value) || 0,
    machine: document.getElementById('machineSelect').value
  };

  if (editingJobId) {
    await updateJob(editingJobId, jobData);
  } else {
    await createJob(jobData);
  }

  closeJobModal();
  renderScheduleBoard();
}

async function handleSetupSubmit(e) {
  e.preventDefault();

  const setupData = {
    type: 'setup',
    toolNumber: document.getElementById('toolNumber').value,
    toolReady: document.getElementById('toolReady').value,
    totalHours: parseFloat(document.getElementById('setupHours').value) || 0,
    setupNotes: document.getElementById('setupNotes').value,
    percentComplete: parseInt(document.getElementById('setupPercentComplete').value) || 0,
    machine: document.getElementById('setupMachineSelect').value
  };

  if (editingSetupId) {
    await updateJob(editingSetupId, setupData);
  } else {
    await createJob(setupData);
  }

  closeSetupModal();
  renderScheduleBoard();
}

// ============================================
// DELETE HANDLER
// ============================================

async function confirmDelete(jobId) {
  if (confirm('Are you sure you want to delete this item?')) {
    await deleteJob(jobId);
    renderScheduleBoard();
  }
}

async function clearAllJobs() {
  if (confirm('Are you sure you want to clear ALL jobs and setups? This cannot be undone.')) {
    for (const job of [...jobs]) {
      await deleteJob(job.id);
    }
    renderScheduleBoard();
  }
}

// ============================================
// EDIT HANDLERS
// ============================================

function editJob(jobId) {
  openJobModal(jobId);
}

function editSetup(setupId) {
  openSetupModal(setupId);
}

// ============================================
// AUTO-CALCULATE HOURS
// ============================================

function setupAutoCalculate() {
  const numParts = document.getElementById('numParts');
  const cycleTime = document.getElementById('cycleTime');
  const numCavities = document.getElementById('numCavities');
  const totalHours = document.getElementById('totalHours');

  const calculate = () => {
    const hours = calculateTotalHours(
      parseInt(numParts.value) || 0,
      parseFloat(cycleTime.value) || 0,
      parseInt(numCavities.value) || 0
    );
    totalHours.value = hours;
  };

  numParts.addEventListener('input', calculate);
  cycleTime.addEventListener('input', calculate);
  numCavities.addEventListener('input', calculate);
}

// ============================================
// PERCENT COMPLETE SLIDER
// ============================================

function setupPercentSliders() {
  const jobSlider = document.getElementById('percentComplete');
  const jobDisplay = document.getElementById('percentCompleteValue');
  const setupSlider = document.getElementById('setupPercentComplete');
  const setupDisplay = document.getElementById('setupPercentCompleteValue');

  jobSlider.addEventListener('input', () => {
    jobDisplay.textContent = jobSlider.value;
  });

  setupSlider.addEventListener('input', () => {
    setupDisplay.textContent = setupSlider.value;
  });
}

// ============================================
// PRINT FUNCTION
// ============================================

function printSchedule() {
  window.print();
}

// ============================================
// REFRESH DATA (for multi-workstation sync)
// ============================================

async function refreshData() {
  await fetchJobs();
  await fetchPriorities();
  renderScheduleBoard();
}

// Auto-refresh every 30 seconds for real-time sync
setInterval(refreshData, 30000);

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  // Add connection status indicator
  const statusDiv = document.createElement('div');
  statusDiv.id = 'connectionStatus';
  statusDiv.className = 'connection-status connected';
  statusDiv.innerHTML = '<span class="status-dot"></span> Connecting...';
  document.body.appendChild(statusDiv);

  // Load data
  await fetchJobs();
  await fetchPriorities();

  // Render
  renderScheduleBoard();

  // Setup event listeners
  document.getElementById('addJobBtn').addEventListener('click', () => openJobModal());
  document.getElementById('addSetupBtn').addEventListener('click', () => openSetupModal());
  document.getElementById('clearAllBtn').addEventListener('click', clearAllJobs);
  document.getElementById('printBtn').addEventListener('click', printSchedule);

  document.querySelector('.close').addEventListener('click', closeJobModal);
  document.querySelector('.close-setup').addEventListener('click', closeSetupModal);

  document.getElementById('cancelBtn').addEventListener('click', closeJobModal);
  document.getElementById('cancelSetupBtn').addEventListener('click', closeSetupModal);

  document.getElementById('jobForm').addEventListener('submit', handleJobSubmit);
  document.getElementById('setupForm').addEventListener('submit', handleSetupSubmit);

  // Close modals on outside click
  document.getElementById('jobModal').addEventListener('click', (e) => {
    if (e.target.id === 'jobModal') closeJobModal();
  });
  document.getElementById('setupModal').addEventListener('click', (e) => {
    if (e.target.id === 'setupModal') closeSetupModal();
  });

  // Setup auto-calculate and sliders
  setupAutoCalculate();
  setupPercentSliders();

  // Check connection periodically
  setInterval(async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      updateConnectionStatus(response.ok);
    } catch {
      updateConnectionStatus(false);
    }
  }, 10000);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
