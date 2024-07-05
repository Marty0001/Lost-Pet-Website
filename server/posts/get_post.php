<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Fetch all posts
    $postsSql = "SELECT * FROM posts";
    $postsResult = $conn->query($postsSql);

    $posts = [];

    while ($post = $postsResult->fetch_assoc()) {
        $postId = $post['post_id'];
        $userId = $post['user_id']; // Assuming the user_id is a column in the posts table

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

        // Fetch comments for the current post
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
        $usernameStmt->bind_param("i", $userId);
        $usernameStmt->execute();
        $usernameResult = $usernameStmt->get_result();
        $username = $usernameResult->fetch_assoc()['username'];
        $usernameStmt->close();

        // Combine all data for the current post
        $post['images'] = $images;
        $post['likes'] = $likesCount;
        $post['comments'] = $commentsCount;
        $post['username'] = $username; // Add the username to the post data

        $posts[] = $post;
    }

    // Return the combined data as JSON
    echo json_encode(["status" => "success", "posts" => $posts]);
    $conn->close();
}
?>
