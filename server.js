var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var PORT = 3000;

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.get('/profile-picture', function (req, res) {
    var img = fs.readFileSync('profile-1.jpg');
    res.writeHead(200, {'Content-Type': 'image/jpg' });
    res.end(img, 'binary');
})

app.listen(3000, function () {
    console.log(`app listening on port ${PORT}, http://localhost:3000/`);
})
