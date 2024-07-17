<?php
include '../db.php';

header("Content-Type: application/json");

if (!isset($_GET['post_id'])) {
    echo json_encode(['success' => false, 'message' => 'Post ID not found']);
    exit;
}

$post_id = intval($_GET['post_id']);

// Get get all info from comments and join users table for usernames
$sql = "
    SELECT u.username, c.comment_text, c.timestamp, c.comment_id
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.post_id = ?
    ORDER BY c.timestamp DESC
";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $post_id);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $comments = [];

    while ($row = $result->fetch_assoc()) {
        $comments[] = [
            'username' => $row['username'],
            'comment' => $row['comment_text'],
            'created_at' => $row['timestamp'],
            'comment_id' => $row['comment_id']
        ];
    }

    echo json_encode(['success' => true, 'comments' => $comments]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error fetching comments']);
}

$stmt->close();
$conn->close();
?>
