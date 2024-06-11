<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "lost_pet_website";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Successfully connected<br>";

    // Test data retrieval
    $sql = "SELECT * FROM users WHERE user_id = '1'";
    $result = $conn->query($sql);


    // Output data of each row
    while($row = $result->fetch_assoc()) {
        echo "Username: " . $row["username"]. "<br>";
        echo "Email: " . $row["email"]. "<br>";
    }
    
    // Close connection
    $conn->close();
}
?>
