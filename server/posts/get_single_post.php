<?php
include '../db.php';

header("Content-Type: application/json");


// Similar process to get_post.php but only retrives single post
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Fetch the logged in username. This is to check their liked posts
    $username = $_GET['username'];
    $postId = $_GET['post_id'];

    if (empty($postId)) {
        echo json_encode(["status" => "error", "message" => "Post ID is required"]);
        exit;
    }

    // Initialize user ID
    $userId = null;

    // Fetch user ID from the username if logged in
    if ($username != '') {
        $userIdSql = "SELECT user_id FROM users WHERE username = ?";
        $userIdStmt = $conn->prepare($userIdSql);
        $userIdStmt->bind_param("s", $username);
        $userIdStmt->execute();
        $userIdResult = $userIdStmt->get_result();
        if ($userIdResult->num_rows > 0) {
            $userId = $userIdResult->fetch_assoc()['user_id'];
        }
        $userIdStmt->close();
    }

    // Fetch the post details for the specified post_id
    $postSql = "SELECT * FROM posts WHERE post_id = ?";
    $postStmt = $conn->prepare($postSql);
    $postStmt->bind_param("i", $postId);
    $postStmt->execute();
    $postResult = $postStmt->get_result();

    if ($postResult->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Post not found"]);
        exit;
    }

    $post = $postResult->fetch_assoc();
    $postUserId = $post['user_id'];

    // Fetch images for the post
    $imageSql = "SELECT image_location FROM images WHERE post_id = ?";
    $imageStmt = $conn->prepare($imageSql);
    $imageStmt->bind_param("i", $postId);
    $imageStmt->execute();
    $imageResult = $imageStmt->get_result();
    $images = [];
    while ($row = $imageResult->fetch_assoc()) {
        $images[] = $row['image_location'];
    }
    $imageStmt->close();

    // Fetch likes count for the post
    $likesSql = "SELECT COUNT(*) as likes_count FROM likes WHERE post_id = ?";
    $likesStmt = $conn->prepare($likesSql);
    $likesStmt->bind_param("i", $postId);
    $likesStmt->execute();
    $likesResult = $likesStmt->get_result();
    $likesCount = $likesResult->fetch_assoc()['likes_count'];
    $likesStmt->close();

    // Fetch comments count for the post
    $commentsSql = "SELECT COUNT(*) as comments_count FROM comments WHERE post_id = ?";
    $commentsStmt = $conn->prepare($commentsSql);
    $commentsStmt->bind_param("i", $postId);
    $commentsStmt->execute();
    $commentsResult = $commentsStmt->get_result();
    $commentsCount = $commentsResult->fetch_assoc()['comments_count'];
    $commentsStmt->close();

    // Fetch username of the post owner
    $usernameSql = "SELECT username FROM users WHERE user_id = ?";
    $usernameStmt = $conn->prepare($usernameSql);
    $usernameStmt->bind_param("i", $postUserId);
    $usernameStmt->execute();
    $usernameResult = $usernameStmt->get_result();
    $postUsername = $usernameResult->fetch_assoc()['username'];
    $usernameStmt->close();

    // Check if the current logged-in user liked this post
    $userLiked = false;
    if ($userId) {
        $userLikedSql = "SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?";
        $userLikedStmt = $conn->prepare($userLikedSql);
        $userLikedStmt->bind_param("ii", $postId, $userId);
        $userLikedStmt->execute();
        $userLikedResult = $userLikedStmt->get_result();
        $userLiked = $userLikedResult->num_rows > 0;
        $userLikedStmt->close();
    }

    // Combine all data for the post
    $post['post_id'] = $postId;
    $post['images'] = $images;
    $post['likes'] = $likesCount;
    $post['comments'] = $commentsCount;
    $post['username'] = $postUsername;
    $post['user_liked'] = $userLiked; // Add user_liked status

    // Return the combined data as JSON
    echo json_encode(["status" => "success", "post" => $post]);
    $conn->close();
}
?>
