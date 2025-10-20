// Global Application State (minimal state retained for current session)
let currentUser = null;
let currentRole = null;
let selectedVotes = {};
let resultsChart = null;

// --- Helper Functions (UNCHANGED) ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showAlert(message, type = 'error') {
    const alert = document.getElementById('loginAlert');
    alert.textContent = message;
    alert.className = `alert alert--${type}`;
    alert.classList.remove('hidden');
}

function hideAlert() {
    document.getElementById('loginAlert').classList.add('hidden');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function generateReceiptId() {
    return 'RCP' + Date.now().toString().slice(-8);
}

function updateTurnoutDisplay(totalVotesCast, totalVoters) {
    const turnout = totalVoters > 0 ? Math.round((totalVotesCast / totalVoters) * 100) : 0;
    document.getElementById('voterTurnout').textContent = turnout + '%';
}


// --- API Call Utility ---
async function apiCall(action, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`api.php?action=${action}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Call failed:", error);
        return { success: false, message: `Server error: ${error.message}` };
    }
}


// --- Authentication Functions (MODIFIED) ---

function showLogin(role) {
    currentRole = role;
    const titles = {
        'voter': 'Voter Login',
        'candidate': 'Candidate Login', 
        'admin': 'Admin Login'
    };
    
    document.getElementById('loginTitle').textContent = titles[role];
    hideAlert();
    showPage('login');
}

function showRegistration() {
    showPage('registration');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const loginId = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await apiCall('login', 'POST', { 
        id: loginId, 
        password: password, 
        role: currentRole 
    });

    if (result.success) {
        currentUser = result.user;
        currentRole = result.role; // Use the definitive role from the server
        showOTPVerification();
    } else {
        showAlert(result.message || 'Login failed. Check your credentials.');
    }
}

function showOTPVerification() {
    showPage('otp');
    // Simulate OTP sent
    setTimeout(() => {
        alert(`OTP sent to registered contact: 123456 (Demo OTP - NOT secure for real use!)`);
    }, 500);
}

function verifyOTP(event) {
    event.preventDefault();
    
    const otp = document.getElementById('otpCode').value;
    
    // Demo OTP is always 123456
    if (otp === '123456') {
        // Clear login fields after successful verification
        document.getElementById('loginId').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('otpCode').value = '';
        redirectToDashboard();
    } else {
        alert('Invalid OTP. Please try again. (Demo OTP: 123456)');
    }
}

function resendOTP() {
    alert('OTP resent: 123456 (Demo OTP)');
}

async function handleRegistration(event) {
    event.preventDefault();
    
    const formData = {
        id: document.getElementById('regStudentId').value,
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        department: document.getElementById('regDepartment').value,
        year: document.getElementById('regYear').value,
        password: document.getElementById('regPassword').value,
    };
    
    const result = await apiCall('register', 'POST', formData);

    if (result.success) {
        alert('Registration successful! You can now login to vote.');
        showLogin('voter');
    } else {
        alert(result.message || 'Registration failed. Please try again.');
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    selectedVotes = {};
    showPage('home');
}


// --- Dashboard Functions (MODIFIED) ---

function redirectToDashboard() {
    if (currentRole === 'admin') {
        updateAdminDashboard();
        showPage('adminDashboard');
    } else if (currentRole === 'voter') {
        updateVoterDashboard();
        showPage('voterDashboard');
    } else if (currentRole === 'candidate') {
        updateCandidateDashboard();
        showPage('candidateDashboard');
    }
}

async function updateVoterDashboard() {
    const results = await apiCall('get_results');
    const hasVoted = currentUser.has_voted; // Status comes from login API response

    if (hasVoted) {
        document.getElementById('voterStatus').textContent = 'Vote Already Cast';
        document.getElementById('voterStatus').className = 'status status--warning';
        document.getElementById('startVotingBtn').textContent = 'View Results';
        document.getElementById('startVotingBtn').onclick = () => showPage('results');
    } else {
        document.getElementById('voterStatus').textContent = 'Eligible to Vote';
        document.getElementById('voterStatus').className = 'status status--success';
        document.getElementById('startVotingBtn').textContent = 'Start Voting';
        document.getElementById('startVotingBtn').onclick = () => startVoting();
    }

    if (results.success) {
        // Calculate total candidates from results
        const uniqueCandidates = new Set(results.candidates.map(c => c.id)).size;
        document.getElementById('totalCandidates').textContent = uniqueCandidates;
        updateTurnoutDisplay(results.total_votes_cast, results.total_voters);
    }
}

async function updateAdminDashboard() {
    const results = await apiCall('get_results');
    if (results.success) {
        const turnout = results.total_voters > 0 ? Math.round((results.total_votes_cast / results.total_voters) * 100) : 0;
        
        document.getElementById('adminTotalVoters').textContent = results.total_voters;
        document.getElementById('adminVotesCast').textContent = results.total_votes_cast;
        document.getElementById('adminTurnoutPercent').textContent = turnout + '%';
        
        const uniqueCandidates = new Set(results.candidates.map(c => c.id)).size;
        document.getElementById('adminCandidateCount').textContent = uniqueCandidates;
    }
}

async function updateCandidateDashboard() {
    // Note: A real app needs a 'get_candidate_info' API call that takes the ID 
    // and returns full details including live votes.
    const results = await apiCall('get_results');
    const candidateData = results.candidates.find(c => c.name === currentUser.name); 

    if (currentUser && candidateData) {
        document.getElementById('candidateName').textContent = currentUser.name;
        document.getElementById('candidatePosition').textContent = candidateData.position;
        document.getElementById('candidateDepartment').textContent = candidateData.department;
        document.getElementById('candidateSymbol').textContent = candidateData.symbol;
        document.getElementById('candidateVotes').textContent = candidateData.vote_count;
    }
}


// --- Voting Functions (MODIFIED) ---

async function startVoting() {
    if (currentUser.has_voted) {
        alert('You have already cast your vote!');
        return;
    }
    
    await generateBallot();
    showPage('voting');
}

async function generateBallot() {
    const ballot = document.getElementById('ballot');
    ballot.innerHTML = '';
    selectedVotes = {}; // Clear previous selections
    
    const result = await apiCall('get_candidates');

    if (!result.success) {
        ballot.innerHTML = '<div class="alert alert--error">Failed to load candidates.</div>';
        return;
    }
    
    const candidates = result.candidates;
    
    const positionsWithCandidates = {};
    
    // Group candidates by position
    candidates.forEach(candidate => {
        if (!positionsWithCandidates[candidate.position]) {
            positionsWithCandidates[candidate.position] = [];
        }
        positionsWithCandidates[candidate.position].push(candidate);
    });
    
    // Create ballot for each position
    Object.keys(positionsWithCandidates).forEach(position => {
        const positionDiv = document.createElement('div');
        positionDiv.className = 'card mb-24';
        
        positionDiv.innerHTML = `
            <h3 class="mb-16">${position}</h3>
            <div class="grid grid-2" id="position-${position.replace(/\s+/g, '-')}">
                ${positionsWithCandidates[position].map(candidate => `
                    <div class="candidate-card" onclick="selectCandidate('${position}', ${candidate.id})" id="candidate-${candidate.id}">
                        <div class="candidate-photo">${candidate.name.charAt(0)}</div>
                        <h4>${candidate.name}</h4>
                        <p class="text-sm">${candidate.department} - ${candidate.year}</p>
                        <div class="candidate-symbol">${candidate.symbol}</div>
                        <p class="text-sm mt-16">${candidate.manifesto}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        ballot.appendChild(positionDiv);
    });
}

function selectCandidate(position, candidateId) {
    // Remove previous selection for this position
    document.querySelectorAll(`#position-${position.replace(/\s+/g, '-')} .candidate-card`)
        .forEach(card => card.classList.remove('selected'));
    
    // Add selection to clicked candidate
    document.getElementById(`candidate-${candidateId}`).classList.add('selected');
    
    selectedVotes[position] = candidateId;
}

function submitVote() {
    if (Object.keys(selectedVotes).length === 0) {
        alert('Please select at least one candidate before submitting.');
        return;
    }
    
    document.getElementById('voteOtp').value = '';
    showModal('otpModal');
}

async function confirmVote() {
    const otp = document.getElementById('voteOtp').value;
    
    if (otp !== '123456') {
        alert('Invalid OTP. Please try again. (Demo OTP: 123456)');
        return;
    }
    
    // 1. Send the vote to the PHP/SQL backend
    const voteData = {
        voter_id: currentUser.id,
        votes: selectedVotes // Format: {"Position": candidateId, ...}
    };
    
    const result = await apiCall('submit_vote', 'POST', voteData);
    
    if (result.success) {
        // Update local status and UI
        if (currentUser) {
            currentUser.has_voted = true;
        }
        
        // Generate receipt
        document.getElementById('receiptId').textContent = generateReceiptId();
        
        closeModal('otpModal');
        showModal('successModal');
        
        // Reset voting state
        selectedVotes = {};
        updateResultsDisplay();
    } else {
        closeModal('otpModal');
        alert(result.message || 'Vote submission failed. Please try again.');
    }
}


// --- Results Functions (MODIFIED) ---

async function updateResultsDisplay() {
    const result = await apiCall('get_results');
    
    if (!result.success) {
        alert(result.message || 'Failed to fetch live results.');
        return;
    }
    
    const candidates = result.candidates;
    const totalVotesCast = result.total_votes_cast;
    const totalVoters = result.total_voters;

    document.getElementById('resultsTotalVotes').textContent = totalVotesCast;
    document.getElementById('resultsVoterTurnout').textContent = totalVoters > 0 ? Math.round((totalVotesCast / totalVoters) * 100) + '%' : '0%';
    
    const resultsContainer = document.getElementById('positionResults');
    resultsContainer.innerHTML = '';
    
    const positionsWithResults = {};
    
    // Group candidates by position with votes
    candidates.forEach(candidate => {
        if (!positionsWithResults[candidate.position]) {
            positionsWithResults[candidate.position] = [];
        }
        positionsWithResults[candidate.position].push(candidate);
    });
    
    // Display results for each position
    Object.keys(positionsWithResults).forEach(position => {
        const positionCandidates = positionsWithResults[position].sort((a, b) => b.vote_count - a.vote_count);
        const totalPositionVotes = positionCandidates.reduce((sum, c) => sum + parseInt(c.vote_count), 0);
        
        const positionDiv = document.createElement('div');
        positionDiv.className = 'card mb-24';
        
        positionDiv.innerHTML = `
            <h3 class="mb-16">${position}</h3>
            <div class="grid">
                ${positionCandidates.map((candidate, index) => {
                    const voteCount = parseInt(candidate.vote_count);
                    const percentage = totalPositionVotes > 0 ? ((voteCount / totalPositionVotes) * 100).toFixed(1) : 0;
                    const isWinner = index === 0 && voteCount > 0;
                    return `
                        <div class="flex justify-between items-center" style="padding: var(--space-12); ${isWinner ? 'background: var(--color-bg-3); border-radius: var(--radius-base);' : ''}">
                            <div class="flex items-center gap-16">
                                <div class="candidate-photo" style="width: 40px; height: 40px; font-size: var(--font-size-base);">
                                    ${candidate.name.charAt(0)}
                                </div>
                                <div>
                                    <strong>${candidate.name}</strong>
                                    ${isWinner ? '<span class="status status--success ml-8">Winner</span>' : ''}
                                    <br>
                                    <small>${candidate.department}</small>
                                </div>
                            </div>
                            <div class="text-center">
                                <div class="stat-number" style="font-size: var(--font-size-xl);">${voteCount}</div>
                                <div class="stat-label">${percentage}%</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        resultsContainer.appendChild(positionDiv);
    });
    
    updateResultsChart(candidates);
}

function updateResultsChart(candidates) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    
    if (resultsChart) {
        resultsChart.destroy();
    }
    
    const chartData = {
        labels: candidates.map(c => c.name),
        datasets: [{
            label: 'Votes',
            data: candidates.map(c => parseInt(c.vote_count)),
            backgroundColor: [
                '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', 
                '#5D878F', '#DB4545', '#D2BA4C', '#964325'
            ]
        }]
    };
    
    resultsChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Vote Distribution'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function declareResults() {
    // In a real system, this would trigger a final database lock/update.
    alert('Results have been officially declared!');
    showPage('results');
}

// --- Admin Functions (UNCHANGED) ---
function showManageElection() {
    alert('Election Management: Configure election parameters, timeline, and settings (requires dedicated PHP endpoint).');
}

function showManageVoters() {
    alert('Voter Management: View and manage registered voters, verify eligibility (requires dedicated PHP endpoint).');
}

function editCampaign() {
    alert('Campaign Management: Update manifesto, photos, and campaign materials (requires dedicated PHP endpoint).');
}

// Initialize Application
function initializeApp() {
    updateResultsDisplay();
    
    // Auto-refresh results every 10 seconds when on results page
    setInterval(() => {
        const currentPage = document.querySelector('.page.active');
        if (currentPage && currentPage.id === 'results') {
            updateResultsDisplay();
        }
    }, 10000);
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);