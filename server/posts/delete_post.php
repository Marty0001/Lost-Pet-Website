<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $postId = $data["post_id"];
    $userName = $data["username"];

    // Check if post_id and username are provided
    if (empty($postId) || empty($userName)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid request. Post ID and username are required."]);
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

    // Fetch image paths to delete them from the server
    $imageSelectSql = "SELECT image_location FROM images WHERE post_id = ?";
    $imageSelectStmt = $conn->prepare($imageSelectSql);
    $imageSelectStmt->bind_param("i", $postId);
    $imageSelectStmt->execute();
    $imageResult = $imageSelectStmt->get_result();
    $imagePaths = [];

    while ($row = $imageResult->fetch_assoc()) {
        $imagePaths[] = $row['image_location'];
    }

    $imageSelectStmt->close();

    // Delete images from `images` table
    $imageDeleteSql = "DELETE FROM images WHERE post_id = ?";
    $imageDeleteStmt = $conn->prepare($imageDeleteSql);
    $imageDeleteStmt->bind_param("i", $postId);
    $imageDeleteStmt->execute();
    if (!$imageDeleteStmt->execute()) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete images."]);
        exit;
    }
    $imageDeleteStmt->close();

    // Delete comments from `comments` table
    $commentDeleteSql = "DELETE FROM comments WHERE post_id = ?";
    $commentDeleteStmt = $conn->prepare($commentDeleteSql);
    $commentDeleteStmt->bind_param("i", $postId);
    $commentDeleteStmt->execute();
    if (!$commentDeleteStmt->execute()) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete comments."]);
        exit;
    }
    $commentDeleteStmt->close();

    // Delete likes from `likes` table
    $likeDeleteSql = "DELETE FROM likes WHERE post_id = ?";
    $likeDeleteStmt = $conn->prepare($likeDeleteSql);
    $likeDeleteStmt->bind_param("i", $postId);
    $likeDeleteStmt->execute();
    if (!$likeDeleteStmt->execute()) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete likes."]);
        exit;
    }
    $likeDeleteStmt->close();

    // Delete post from `posts` table
    $postDeleteSql = "DELETE FROM posts WHERE post_id = ?";
    $postDeleteStmt = $conn->prepare($postDeleteSql);
    $postDeleteStmt->bind_param("i", $postId);

    if ($postDeleteStmt->execute()) {
        // Delete images from the server
        foreach ($imagePaths as $path) {
            if (file_exists($path)) {
                if (!unlink($path)) {
                    error_log("Failed to delete image: $path");
                }
            }
        }

        echo json_encode(["status" => "success", "message" => "Post deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete post. Please try again later."]);
    }

    $postDeleteStmt->close();
    $conn->close();
}
?>
