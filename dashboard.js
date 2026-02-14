// dashboard.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// DOM Elements
const totalLabsEl = document.getElementById('total-labs');
const avgTimeEl = document.getElementById('avg-time');
const fastestTimeEl = document.getElementById('fastest-time');
const latestLabEl = document.getElementById('latest-lab');
const userEmailEl = document.getElementById('user-email');
const labsTableBody = document.getElementById('labs-table-body');

// Modal Elements
const modal = document.getElementById('details-modal');
const modalTitle = document.getElementById('modal-title');
const modalLabName = document.getElementById('modal-lab-name');
const modalTableBody = document.getElementById('modal-table-body');
const noDetailsMsg = document.getElementById('no-details-msg');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalBackdrop = document.getElementById('modal-backdrop');

let currentLabsData = {}; // Store data globally to access in modal

// --- Dashboard Logic ---

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (userEmailEl) userEmailEl.textContent = user.email;
        fetchUserData(user.uid);
    } else {
        // If we are on the dashboard page, redirect to login
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
    }
});

// --- Data Fetching & Real-time Updates ---

function fetchUserData(uid) {
    const labsRef = ref(db, 'Users/' + uid + '/Labs');

    // Real-time listener
    onValue(labsRef, (snapshot) => {
        const data = snapshot.val();
        currentLabsData = data || {};
        updateDashboard(data);
    }, (error) => {
        console.error("Error fetching data:", error);
        if (labsTableBody) labsTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading data.</td></tr>';
    });
}

// --- Dashboard Calculations & Rendering ---

function updateDashboard(labsData) {
    if (!labsData) {
        if (labsTableBody) labsTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No data found.</td></tr>';
        updateStats(0, 0, "N/A", "N/A");
        return;
    }

    let totalLabs = 0;
    let totalTime = 0;
    let labCountForAvg = 0;
    let minTime = Infinity;
    let latestLabName = "N/A";

    const tableRows = [];

    Object.keys(labsData).forEach(labName => {
        const lab = labsData[labName];
        totalLabs++;

        // --- Data Parsing Normalization ---
        let timeTaken = 0;
        let attempts = 0;
        let status = "Completed";
        let dateCompleted = "N/A";

        // 1. Time Calculation
        if (lab.Time_Passed !== undefined) {
            timeTaken = lab.Time_Passed;
        } else if (lab.Time !== undefined) {
            timeTaken = lab.Time;
        }

        // 2. Attempts Calculation
        if (lab.Experiments && Array.isArray(lab.Experiments)) {
            const validExperiments = lab.Experiments.filter(e => e !== null);
            attempts = validExperiments.length;
        } else {
            attempts = 1;
        }

        // --- Stats Aggregation ---
        totalTime += timeTaken;
        if (timeTaken > 0) {
            labCountForAvg++;
            if (timeTaken < minTime) {
                minTime = timeTaken;
            }
        }

        // Latest Lab Proxy
        latestLabName = labName;

        // Add to table data
        tableRows.push({
            name: labName,
            time: timeTaken,
            attempts: attempts,
            status: status,
            date: dateCompleted,
            rawKey: labName
        });
    });

    // Calculate Averages
    const avgTime = labCountForAvg > 0 ? (totalTime / labCountForAvg).toFixed(2) : 0;
    const fastestTime = minTime === Infinity ? "N/A" : minTime + "s";

    // Update Stats Cards
    updateStats(totalLabs, avgTime, fastestTime, latestLabName);

    // Update Table
    renderTable(tableRows);
}

function updateStats(total, avg, fastest, latest) {
    if (totalLabsEl) totalLabsEl.textContent = total;
    if (avgTimeEl) avgTimeEl.textContent = avg + "s";
    if (fastestTimeEl) fastestTimeEl.textContent = fastest;
    if (latestLabEl) latestLabEl.textContent = latest;
}

function renderTable(rows) {
    if (!labsTableBody) return;

    labsTableBody.innerHTML = "";

    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-colors";

        // Make the NAME clickable
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap cursor-pointer group" onclick="window.openModal('${row.rawKey}')">
                <div class="text-sm font-medium text-indigo-600 group-hover:text-indigo-800 underline decoration-dotted underline-offset-2">${row.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${row.time}s</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${row.attempts}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    ${row.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${row.date}
            </td>
        `;
        labsTableBody.appendChild(tr);
    });
}

// --- Modal Functions ---

// Expose openModal to global scope so HTML onclick can access it
window.openModal = function (labName) {
    const labData = currentLabsData[labName];
    if (!labData) return;

    modalTitle.textContent = `Details: ${labName}`;
    modalLabName.textContent = `Detailed experiment logs for ${labName}`;
    modalTableBody.innerHTML = "";

    const experiments = labData.Experiments;

    if (experiments && Array.isArray(experiments) && experiments.length > 0) {
        noDetailsMsg.classList.add('hidden');
        document.querySelector('#details-modal table').classList.remove('hidden');

        // Filter nulls and map to add index
        experiments.forEach((exp, index) => {
            if (!exp) return; // Skip null entries

            // Handle array Duration quirk seen in JSON (some have array of identical durations)
            let duration = exp.Duration;
            if (Array.isArray(duration)) duration = duration[0];
            if (typeof duration === 'number') duration = duration.toFixed(2);

            let gravity = exp.Gravity;
            if (typeof gravity === 'number') gravity = gravity.toFixed(2);

            let distance = exp.Distance || "-";
            let recordedAt = exp.RecordedAtSeconds ? exp.RecordedAtSeconds.toFixed(1) + 's' : '-';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${index}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${distance}m</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${gravity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${duration}s</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${recordedAt}</td>
            `;
            modalTableBody.appendChild(tr);
        });
    } else {
        // No detailed experiments found
        document.querySelector('#details-modal table').classList.add('hidden');
        noDetailsMsg.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

// Event Listeners for Modal
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

// Escape key to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});
