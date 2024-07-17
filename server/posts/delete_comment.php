<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    if (!isset($_GET['comment_id'])) {
        echo json_encode(['success' => false, 'message' => 'Comment ID not found']);
        exit;
    }

    $comment_id = intval($_GET['comment_id']);

    // Get the post_id associated with the comment_id before deleting the comment
    $get_post_id_sql = "SELECT post_id FROM comments WHERE comment_id = ?";
    $get_post_id_stmt = $conn->prepare($get_post_id_sql);
    $get_post_id_stmt->bind_param("i", $comment_id);
    $get_post_id_stmt->execute();
    $post_id_result = $get_post_id_stmt->get_result();

    if ($post_id_result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Comment not found']);
        $get_post_id_stmt->close();
        $conn->close();
        exit;
    }

    $post_id = $post_id_result->fetch_assoc()['post_id'];
    $get_post_id_stmt->close();

    // Delete the comment
    $delete_comment_sql = "DELETE FROM comments WHERE comment_id = ?";
    $delete_comment_stmt = $conn->prepare($delete_comment_sql);
    if ($delete_comment_stmt === false) {
        echo json_encode(["success" => false, "message" => "Failed to prepare the statement"]);
        exit;
    }

    $delete_comment_stmt->bind_param("i", $comment_id);
    $delete_comment_stmt->execute();

    if ($delete_comment_stmt->affected_rows > 0) {
        // Get and return the updated comment count for the post
        $get_comment_count_sql = "SELECT COUNT(*) AS comment_count FROM comments WHERE post_id = ?";
        $get_comment_count_stmt = $conn->prepare($get_comment_count_sql);
        $get_comment_count_stmt->bind_param("i", $post_id);
        $get_comment_count_stmt->execute();
        $comment_count_result = $get_comment_count_stmt->get_result();
        $comment_count = $comment_count_result->fetch_assoc();
        $get_comment_count_stmt->close();

        echo json_encode(["success" => true, "comment_count" => $comment_count['comment_count']]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete the comment"]);
    }

    $delete_comment_stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>
