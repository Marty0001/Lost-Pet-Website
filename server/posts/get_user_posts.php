<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $username = $_GET['username'];

    // Fetch user ID from the username
    $userIdSql = "SELECT user_id FROM users WHERE username = ?";
    $userIdStmt = $conn->prepare($userIdSql);
    $userIdStmt->bind_param("s", $username);
    $userIdStmt->execute();
    $userIdResult = $userIdStmt->get_result();
    $userId = $userIdResult->fetch_assoc()['user_id'];
    $userIdStmt->close();

    // Fetch posts for the user
    $postsSql = "SELECT * FROM posts WHERE user_id = ?";
    $postsStmt = $conn->prepare($postsSql);
    $postsStmt->bind_param("i", $userId);
    $postsStmt->execute();
    $postsResult = $postsStmt->get_result();

    $posts = [];
    while ($post = $postsResult->fetch_assoc()) {
        $postId = $post['post_id'];

        // Fetch images for the current post
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

        // Fetch likes count for the current post
        $likesSql = "SELECT COUNT(*) as likes_count FROM likes WHERE post_id = ?";
        $likesStmt = $conn->prepare($likesSql);
        $likesStmt->bind_param("i", $postId);
        $likesStmt->execute();
        $likesResult = $likesStmt->get_result();
        $likesCount = $likesResult->fetch_assoc()['likes_count'];
        $likesStmt->close();

        // Fetch comments count for the current post
        $commentsSql = "SELECT COUNT(*) as comments_count FROM comments WHERE post_id = ?";
        $commentsStmt = $conn->prepare($commentsSql);
        $commentsStmt->bind_param("i", $postId);
        $commentsStmt->execute();
        $commentsResult = $commentsStmt->get_result();
        $commentsCount = $commentsResult->fetch_assoc()['comments_count'];
        $commentsStmt->close();

        // Fetch username
        $usernameSql = "SELECT username FROM users WHERE user_id = ?";
        $usernameStmt = $conn->prepare($usernameSql);
        $usernameStmt->bind_param("i", $post['user_id']);
        $usernameStmt->execute();
        $usernameResult = $usernameStmt->get_result();
        $postUsername = $usernameResult->fetch_assoc()['username'];
        $usernameStmt->close();

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

        // Combine all data for the current post
        $post['post_id'] = $postId;
        $post['images'] = $images;
        $post['likes'] = $likesCount;
        $post['comments'] = $commentsCount;
        $post['username'] = $postUsername;
        $post['user_liked'] = $userLiked; // Assume false since we are fetching user's own posts

        $posts[] = $post;
    }

    echo json_encode(["status" => "success", "posts" => $posts]);
    $conn->close();
}
?>
