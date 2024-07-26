<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Extract form data
    $postId = $_GET["post_id"];
    $userName = $_POST["username"];
    $petName = $_POST["petName"];
    $species = $_POST["species"] === "Other" ? $_POST["customSpecies"] : $_POST["species"];
    $location = $_POST["location"];
    $description = $_POST["description"];
    $contactInfo = $_POST["contactInfo"];
    $status = $_POST["status"];
    $reward = isset($_POST["reward"]) ? $_POST["reward"] : null;
    $lastSeenDate = isset($_POST["lastSeenDate"]) ? $_POST["lastSeenDate"] : date('Y-m-d');

    // Validate required fields
    if (empty($userName) || empty($petName) || empty($species) || empty($location) || empty($description) || empty($contactInfo)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Please fill in all required fields."]);
        exit;
    }

    // Get user ID from username
    $userSql = "SELECT user_id FROM users WHERE username = ?";
    $userStmt = $conn->prepare($userSql);
    $userStmt->bind_param("s", $userName);
    $userStmt->execute();
    $userResult = $userStmt->get_result();

    if ($userResult->num_rows == 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "User not found."]);
        exit;
    }

    $userId = $userResult->fetch_assoc()['user_id'];
    $userStmt->close();

    // Verify if the post belongs to the user
    $postSql = "SELECT user_id FROM posts WHERE post_id = ?";
    $postStmt = $conn->prepare($postSql);
    $postStmt->bind_param("i", $postId);
    $postStmt->execute();
    $postResult = $postStmt->get_result();

    if ($postResult->num_rows == 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Post not found."]);
        exit;
    }

    $postUserId = $postResult->fetch_assoc()['user_id'];
    if ($postUserId != $userId) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Unauthorized action."]);
        exit;
    }

    $postStmt->close();

    // Update post data in `posts` table
    $updateSql = "UPDATE posts SET pet_name = ?, species = ?, description = ?, last_seen_location = ?, last_seen_date = ?, reward = ?, contact = ?, status = ? WHERE post_id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("ssssssssi", $petName, $species, $description, $location, $lastSeenDate, $reward, $contactInfo, $status, $postId);

    if ($updateStmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Post updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update post. Please try again later."]);
    }

    $updateStmt->close();
    $conn->close();
}
?>
