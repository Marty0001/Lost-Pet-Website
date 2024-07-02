<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data["username"];
    $password = password_hash($data["password"], PASSWORD_DEFAULT);
    $email = $data["email"];

    // Check if username or email already exists
    $checkSql = "SELECT * FROM users WHERE username = ? OR email = ?";
    $stmt = $conn->prepare($checkSql); // Prevent SQL injection
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        // Insert new user
        $insertSql = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bind_param("sss", $username, $password, $email);
        
        if ($insertStmt->execute()) {
            echo json_encode(["status" => "success", "message" => "User registered successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Registration failed"]);
        }
        $insertStmt->close();
    } else {
        echo json_encode(["status" => "error", "message" => "Username or email already exists"]);
    }
    
    $stmt->close();
    $conn->close();
}
?>
