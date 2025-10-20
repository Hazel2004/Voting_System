<?php
// Database credentials
// ⚠️ CUSTOMIZE THESE VALUES ⚠️

// 1. Database Server Hostname (usually 'localhost' for local development)
define('DB_SERVER', 'localhost');

// 2. Database Username (XAMPP/WAMP default is often 'root')
define('DB_USERNAME', 'root'); 

// 3. Database Password (XAMPP default is often '' (empty string), MAMP default is often 'root')
define('DB_PASSWORD', ''); 

// 4. Database Name (Must match the name you used when running the setup_db.sql commands)
define('DB_NAME', 'college_elections'); 


// Attempt to connect to MySQL database
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    // Stop execution and show a detailed error if the connection fails
    die("Connection failed: " . $conn->connect_error . 
        ". Please check credentials in db_config.php and ensure MySQL service is running.");
}

// Function to safely close the connection
function close_db_connection($conn) {
    if ($conn) {
        $conn->close();
    }
}
?>