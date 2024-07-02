<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $usernameOrEmail = $data["username"];
    $password = $data["password"];

    // Check if user exists and password is correct
    $sql = "SELECT * FROM users WHERE username = ? OR email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $usernameOrEmail, $usernameOrEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Fetch user data
    $user = $result->fetch_assoc();
    if ($user && password_verify($password, $user["password"])) {
        unset($user["password"]);
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
    }
    
    $stmt->close();
    $conn->close();
}
?>
