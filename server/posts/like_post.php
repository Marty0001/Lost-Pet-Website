<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data["username"];
    $post_id = $data["post_id"];

    // Fetch the user ID based on the username
    $get_user_id_sql = "SELECT user_id FROM users WHERE username = ?";
    $stmt = $conn->prepare($get_user_id_sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user) {
        $user_id = $user["user_id"];

        // Check if the user has already liked the post
        $check_like_sql = "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";
        $check_like_stmt = $conn->prepare($check_like_sql);
        $check_like_stmt->bind_param("ii", $user_id, $post_id);
        $check_like_stmt->execute();
        $like_result = $check_like_stmt->get_result();

        if ($like_result->num_rows > 0) {
            // Unlike the post
            $delete_like_sql = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
            $delete_like_stmt = $conn->prepare($delete_like_sql);
            $delete_like_stmt->bind_param("ii", $user_id, $post_id);
            $delete_like_stmt->execute();
        } else {
            // Like the post
            $insert_like_sql = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";
            $insert_like_stmt = $conn->prepare($insert_like_sql);
            $insert_like_stmt->bind_param("ii", $user_id, $post_id);
            $insert_like_stmt->execute();
        }

        // Get the updated like count
        $get_likes_sql = "SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?";
        $get_likes_stmt = $conn->prepare($get_likes_sql);
        $get_likes_stmt->bind_param("i", $post_id);
        $get_likes_stmt->execute();
        $likes_result = $get_likes_stmt->get_result();
        $likes = $likes_result->fetch_assoc();

        echo json_encode(["success" => true, "likes" => $likes["like_count"]]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>
