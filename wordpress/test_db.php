<?php
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully to MySQL server.\n";

// Check if database exists
$dbname = "Zorx";
$db_selected = $conn->select_db($dbname);

if (!$db_selected) {
    echo "Database '$dbname' does not exist. Trying to create it...\n";
    $sql = "CREATE DATABASE $dbname";
    if ($conn->query($sql) === TRUE) {
        echo "Database created successfully\n";
    } else {
        echo "Error creating database: " . $conn->error . "\n";
    }
} else {
    echo "Database '$dbname' exists.\n";
}

$conn->close();
?>