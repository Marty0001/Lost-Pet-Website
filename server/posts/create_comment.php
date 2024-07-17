<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data["username"];
    $post_id = $data["post_id"];
    $comment_text = $data["comment"];

    // Fetch the user ID based on the username
    $get_user_id_sql = "SELECT user_id FROM users WHERE username = ?";
    $stmt = $conn->prepare($get_user_id_sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $user_id = $user["user_id"];

    $insert_comment_sql = "INSERT INTO comments (user_id, post_id, comment_text) VALUES (?, ?, ?)";
    $insert_comment_stmt = $conn->prepare($insert_comment_sql);
    $insert_comment_stmt->bind_param("iis", $user_id, $post_id, $comment_text);
    $insert_comment_stmt->execute();
    

   // Get the updated comment count
    $get_comment_count_sql = "SELECT COUNT(*) AS comment_count FROM comments WHERE post_id = ?";
    $get_comment_count_stmt = $conn->prepare($get_comment_count_sql);
    $get_comment_count_stmt->bind_param("i", $post_id);
    $get_comment_count_stmt->execute();
    $comment_count_result = $get_comment_count_stmt->get_result();
    $comment_count = $comment_count_result->fetch_assoc();

    $get_comment_count_stmt->close();

    echo json_encode(["success" => true, "comment_count" => $comment_count['comment_count']]);

    

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>
