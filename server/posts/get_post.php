<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Fetch the logged in username. This is to check their liked posts
    $username = $_GET['username'];

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

    // Fetch all posts
    $postsSql = "SELECT * FROM posts";
    $postsResult = $conn->query($postsSql);

    $posts = [];

    while ($post = $postsResult->fetch_assoc()) {
        $postId = $post['post_id'];
        $postUserId = $post['user_id'];

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
        $usernameStmt->bind_param("i", $postUserId);
        $usernameStmt->execute();
        $usernameResult = $usernameStmt->get_result();
        $postUsername = $usernameResult->fetch_assoc()['username'];
        $usernameStmt->close();

        // Check if the current logged in user liked this post
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
        $post['user_liked'] = $userLiked; // Add user_liked status

        $posts[] = $post;
    }

    // Return the combined data as JSON
    echo json_encode(["status" => "success", "posts" => $posts]);
    $conn->close();
}
?>
