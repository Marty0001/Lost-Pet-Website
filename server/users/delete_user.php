<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data["username"];
    $password = $data["password"];

    // Verify the user's password
    $sql = "SELECT password FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(["status" => "error", "message" => "Invalid password"]);
        exit;
    }

    // Fetch the user ID based on the username
    $get_user_id_sql = "SELECT user_id FROM users WHERE username = ?";
    $userStmt = $conn->prepare($get_user_id_sql);
    $userStmt->bind_param("s", $username);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    $user = $userResult->fetch_assoc();
    $user_id = $user["user_id"];
    $userStmt->close();

    // Fetch all post IDs by this user
    $get_posts_sql = "SELECT post_id FROM posts WHERE user_id = ?";
    $postsStmt = $conn->prepare($get_posts_sql);
    $postsStmt->bind_param("i", $user_id);
    $postsStmt->execute();
    $postsResult = $postsStmt->get_result();

    // Iterate through each post by the user and delete related comments and likes and images
    while ($post = $postsResult->fetch_assoc()) {
        $post_id = $post["post_id"];

        $deleteCommentsSql = "DELETE FROM comments WHERE post_id = ?";
        $deleteCommentsStmt = $conn->prepare($deleteCommentsSql);
        $deleteCommentsStmt->bind_param("i", $post_id);
        if (!$deleteCommentsStmt->execute()) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to delete comments."]);
            exit;
        }
        $deleteCommentsStmt->close();

        $deleteLikesSql = "DELETE FROM likes WHERE post_id = ?";
        $deleteLikesStmt = $conn->prepare($deleteLikesSql);
        $deleteLikesStmt->bind_param("i", $post_id);
        if (!$deleteLikesStmt->execute()) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to delete likes."]);
            exit;
        }
        $deleteLikesStmt->close();


        // Fetch image paths to delete them from the server
        $imageSelectSql = "SELECT image_location FROM images WHERE post_id = ?";
        $imageSelectStmt = $conn->prepare($imageSelectSql);
        $imageSelectStmt->bind_param("i", $post_id);
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
        $imageDeleteStmt->bind_param("i", $post_id);
        $imageDeleteStmt->execute();
        if (!$imageDeleteStmt->execute()) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to delete images."]);
            exit;
        }
        $imageDeleteStmt->close();
    }

    $postsStmt->close();

     // Delete posts, comments, and likes from user
     $deleteCommentsSql = "DELETE FROM comments WHERE user_id = ?";
     $deleteCommentsStmt = $conn->prepare($deleteCommentsSql);
     $deleteCommentsStmt->bind_param("i", $user_id);
     $deleteCommentsStmt->execute();
 
     $deleteLikesSql = "DELETE FROM likes WHERE user_id = ?";
     $deleteLikesStmt = $conn->prepare($deleteLikesSql);
     $deleteLikesStmt->bind_param("i", $user_id);
     $deleteLikesStmt->execute();
 
     $deletePostsSql = "DELETE FROM posts WHERE user_id = ?";
     $deletePostsStmt = $conn->prepare($deletePostsSql);
     $deletePostsStmt->bind_param("i", $user_id);
     $deletePostsStmt->execute();
 

    // Delete the user
    $deleteUserSql = "DELETE FROM users WHERE user_id = ?";
    $deleteUserStmt = $conn->prepare($deleteUserSql);
    $deleteUserStmt->bind_param("i", $user_id);
    if ($deleteUserStmt->execute()) {
        echo json_encode(["status" => "success", "message" => "User deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete user."]);
    }
    $deleteUserStmt->close();

    $conn->close();
}
?>
