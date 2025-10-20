<?php
// Set header to return JSON data
header('Content-Type: application/json');

// Include database configuration and connection
// **NOTE:** db_config.php must be in the same folder
require_once 'db_config.php';

// Get the action from the URL query parameter
$action = $_GET['action'] ?? '';

// Get the JSON data sent from the front-end (e.g., login credentials, vote data)
$data = json_decode(file_get_contents('php://input'), true);

// Use a switch statement to route the request to the appropriate function
switch ($action) {
    case 'login':
        handleLogin($conn, $data);
        break;
    case 'register':
        handleRegistration($conn, $data);
        break;
    case 'get_candidates':
        getCandidates($conn);
        break;
    case 'submit_vote':
        submitVote($conn, $data);
        break;
    case 'get_results':
        getResults($conn);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid API action']);
}

// Close the database connection after processing the request
close_db_connection($conn);


// --- CORE FUNCTIONS ---

/**
 * Handles user login for voter, candidate, or admin.
 */
function handleLogin($conn, $data) {
    $id = $data['id'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? '';
    
    // 1. Admin/Officer Login Check (SIMPLE & INSECURE for demo)
    if ($role === 'admin') {
        if ($id === 'admin' && $password === 'admin123') { 
            echo json_encode(['success' => true, 'role' => 'admin', 'user' => ['username' => 'admin', 'name' => 'System Admin']]);
            return;
        }
    }
    
    // 2. Voter Login Check (using prepared statements for security)
    $stmt = $conn->prepare("SELECT id, name, password_hash, has_voted FROM voters WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Verify password against the hash stored in the database
        if (password_verify($password, $user['password_hash'])) {
            // For simplicity, we're treating all logged-in users from the voters table as 'voter'
            $role_final = 'voter'; 
            
            // Note: If you have a separate candidate login, you would check a candidate table here.
            
            echo json_encode(['success' => true, 'role' => $role_final, 'user' => $user]);
            return;
        }
    }

    echo json_encode(['success' => false, 'message' => 'Invalid credentials or registration status.']);
}

/**
 * Handles new voter registration and saves data to the voters table.
 */
function handleRegistration($conn, $data) {
    $id = $data['id'] ?? '';
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $phone = $data['phone'] ?? '';
    $department = $data['department'] ?? '';
    $year = $data['year'] ?? '';
    $password = $data['password'] ?? '';
    
    // Hash the password securely before storage
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO voters (id, name, email, phone, department, year, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)");
    // 'sssssss' indicates 7 string parameters
    $stmt->bind_param("sssssss", $id, $name, $email, $phone, $department, $year, $hashed_password);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful!']);
    } else {
        // MySQL error 1062 is typically a duplicate entry error
        if ($conn->errno === 1062) {
            echo json_encode(['success' => false, 'message' => 'Student ID or Email already registered.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
        }
    }
}

/**
 * Fetches all candidates grouped by position for ballot generation.
 */
function getCandidates($conn) {
    // Fetch all active candidates from the database
    $candidates_result = $conn->query("SELECT id, name, position, department, year, manifesto, symbol FROM candidates ORDER BY position, name");
    $candidates = $candidates_result->fetch_all(MYSQLI_ASSOC);
    
    // Determine the list of positions based on the candidates found
    $positions = array_unique(array_column($candidates, 'position'));
    
    echo json_encode(['success' => true, 'candidates' => $candidates, 'positions' => array_values($positions)]);
}

/**
 * Records the votes in the 'votes' table and updates the voter's status.
 */
function submitVote($conn, $data) {
    $voterId = $data['voter_id'] ?? '';
    $selectedVotes = $data['votes'] ?? []; // Expected format: {"President": 1, "Vice President": 3}

    // 1. Check if voter has already voted (via the database, not a local variable)
    $stmt_check = $conn->prepare("SELECT has_voted FROM voters WHERE id = ?");
    $stmt_check->bind_param("s", $voterId);
    $stmt_check->execute();
    $voter_status = $stmt_check->get_result()->fetch_assoc();
    
    if ($voter_status['has_voted']) {
        echo json_encode(['success' => false, 'message' => 'You have already cast your vote.']);
        return;
    }

    // Start a transaction to ensure all votes or none are recorded
    $conn->begin_transaction();
    $vote_successful = true;

    // 2. Insert each vote into the votes table
    $stmt_insert = $conn->prepare("INSERT INTO votes (voter_id, candidate_id, position) VALUES (?, ?, ?)");
    foreach ($selectedVotes as $position => $candidateId) {
        $stmt_insert->bind_param("sis", $voterId, $candidateId, $position);
        if (!$stmt_insert->execute()) {
            $vote_successful = false;
            break; // Exit loop on first failure
        }
    }
    
    // 3. Update voter status only if all votes were inserted successfully
    if ($vote_successful) {
        $stmt_update = $conn->prepare("UPDATE voters SET has_voted = TRUE WHERE id = ?");
        $stmt_update->bind_param("s", $voterId);
        if (!$stmt_update->execute()) {
            $vote_successful = false;
        }
    }

    // 4. Commit or Rollback
    if ($vote_successful) {
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Vote submitted successfully!']);
    } else {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Vote submission failed due to a database error.']);
    }
}

/**
 * Retrieves live vote counts for all candidates and turnout statistics.
 */
function getResults($conn) {
    // Get vote counts for all candidates (even those with 0 votes)
    $sql_votes = "
        SELECT 
            c.id, 
            c.name, 
            c.position, 
            c.department, 
            c.year,
            c.symbol,
            COUNT(v.voter_id) AS vote_count -- Count votes from the 'votes' table
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id
        GROUP BY c.id, c.name, c.position, c.department, c.year, c.symbol
        ORDER BY c.position, vote_count DESC
    ";
    $candidates_result = $conn->query($sql_votes);
    $candidates_with_votes = $candidates_result->fetch_all(MYSQLI_ASSOC);

    // Get total registered voters
    $total_voters = $conn->query("SELECT COUNT(*) FROM voters")->fetch_row()[0];
    
    // Get total unique votes cast (voters who completed the process)
    $total_votes_cast = $conn->query("SELECT COUNT(*) FROM voters WHERE has_voted = TRUE")->fetch_row()[0];

    echo json_encode([
        'success' => true, 
        'candidates' => $candidates_with_votes, 
        'total_voters' => (int)$total_voters,
        'total_votes_cast' => (int)$total_votes_cast
    ]);
}
?>