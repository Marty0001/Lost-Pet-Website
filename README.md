Intalls:
- Download and set up git: https://www.youtube.com/watch?v=cz6ubItv2SM (you dont need github desktop)
- Download node.js : https://www.youtube.com/watch?v=J8ZPZq_34aY
- Download XAMPP: https://www.youtube.com/watch?v=dnBa2pTKYY0. change the port to 8080 like in the video and start the Apache and MySQL servers
  
<br>

Server setup and test:
- Click on the green code button of this repository and download the .zip
- Extract the zip into the htdocs folder in xampp. This is how the database and php files can communicate. <b>The file structure should be like: C:\xampp\htdocs\Lost-Pet-Website</b>
- Type 'http://localhost:8080/phpmyadmin' into your browser
- Create a new database called 'lost_pet_website'
- In phpMyAdmin in the new database, go to import, click browse, select the .sql file in the Lost-Pet-Website folder and click import at the bottom
- Type 'http://localhost:8080/Lost-Pet-Website/server/db.php' in your browser and it should say 'Successfully connected' and some test info from the database

<br>

Client setup and test: 
- Right click the Lost-Pet-Website folder and open with VS-Code
- Open a VS-code terminal
- Type 'cd client' so that the prompt is in the client folder so it says: PS C:\xampp\htdocs\Lost-Pet-Website\client>
- Type 'npm install' and it will install all the dependencies for react
- Type 'npm start' and it should open a window in your browser with the website running. You can 'ctrl + c' in the terminal to close it

So basically the XAMPP control panel is for running the database, and 'node.js' / 'npm start' is for running the website. If someone makes changes to the DB, they need to export the .sql file, replace the old one in this foler, and push it to this repository for everyone else to import it into their DB.

<br>

Using git:
- Open a VS code terminal
- Make sure your at the top level folder so that it says: PS C:\xampp\htdocs\Lost-Pet-Website>
- You only need to do these once:
  - 'git init'
  - 'git remote add origin https://github.com/Marty0001/Lost-Pet-Website.git'
- You need to do this everytime you want to add seomthing new:
  - 'git add .' (This will add all the files you changed)
  - 'git commit -m "message"' (This will commit the changes locally on your device. The message should say what you added and has to be in quotes. It wont let you commit without a message)
  - 'git push -u origin main' (This will commit the changes to the online repository so we can all have the most recent version with the new changes)
- To make sure your working on the most recent version, you can do:
  - 'git pull' (This only works if you dont have un-commited changes. So if make sure you add and commit locally before doing this)
  - Or redownload the zip and replace the old folder, but you have to do the git init and add origin again
