<?php
include '../db.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Extract form data
    $userName = $_POST["username"];
    $petName = $_POST["petName"];
    $species = $_POST["species"] === "Other" ? $_POST["customSpecies"] : $_POST["species"];
    $location = $_POST["location"];
    $description = $_POST["description"];
    $contactInfo = $_POST["contactInfo"];
    $status = $_POST["status"];
    $reward = isset($_POST["reward"]) ? $_POST["reward"] : null;
    $lastSeenDate = isset($_POST["lastSeenDate"]) ? $_POST["lastSeenDate"] : date('Y-m-d'); // Use provided date or current date if not provided

    // Validate required fields
    if (empty($userName) || empty($petName) || empty($species) || empty($location) || empty($description) || empty($contactInfo)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Please fill in all required fields."]);
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

    // Insert post data into `posts` table
    $insertSql = "INSERT INTO posts (user_id, pet_name, species, description, last_seen_location, last_seen_date, reward, contact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $insertStmt = $conn->prepare($insertSql);

    // Adjusting bind_param types
    $insertStmt->bind_param("issssssss", $userId, $petName, $species, $description, $location, $lastSeenDate, $reward, $contactInfo, $status);

    
    if ($insertStmt->execute()) {
        $postId = $conn->insert_id;

        // Handle image uploads
        if (isset($_FILES['image1']) || isset($_FILES['image2']) || isset($_FILES['image3'])) {
            $uploadDir = '../images/'; 
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            $uploadedImages = [];
            
            for ($i = 1; $i <= 3; $i++) {
                if (isset($_FILES["image$i"])) {
                    $image = $_FILES["image$i"];
                    
                    if (in_array($image['type'], $allowedTypes)) {
                        // Generate a unique name for the image
                        $fileExtension = pathinfo($image['name'], PATHINFO_EXTENSION);
                        $uniqueName = uniqid() . '.' . $fileExtension;
                        $imagePath = $uploadDir . $uniqueName;

                        if (move_uploaded_file($image['tmp_name'], $imagePath)) {
                            $uploadedImages[] = $imagePath;
                            // Insert image data into `images` table
                            $imageInsertSql = "INSERT INTO images (post_id, image_location) VALUES (?, ?)";
                            $imageInsertStmt = $conn->prepare($imageInsertSql);
                            $imageInsertStmt->bind_param("is", $postId, $imagePath);
                            $imageInsertStmt->execute();
                            $imageInsertStmt->close();
                        }
                    }
                }
            }

            if (count($uploadedImages) == 0) {
                echo json_encode(["status" => "error", "message" => "Failed to upload images."]);
                exit;
            }
        }

        echo json_encode(["status" => "success", "message" => "Post created successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to create post. Please try again later."]);
    }

    $insertStmt->close();
    $conn->close();
}
?>
