/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Maham Waqar Student ID: 127044196 Date: 03/02/2023
 *
 *  Online (Cyclic) Link: https://powerful-scarf-hen.cyclic.app/
 ********************************************************************************/

// import the express module
var express = require("express");
var blogsService = require("./blog-service"); //gets imported
let fs = require("fs"); //imported library to read from a file
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// create an new variable of type express
var app = express();

cloudinary.config({
  cloud_name: "dg8d270dm",
  api_key: "851739466863879",
  api_secret: "3BpFNM8Id4J7UUv5xCqfalu15pQ",
  secure: true,
});

const upload = multer(); // no { storage: storage } since we are not using disk storage

// set the server to listen on a port, either the one provided by the environment or 8080

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

// define the default route, "/", to send a response and redirect the root to about page
app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/views/about.html");
});

//todo get data from posts.json file
//loop through the array of objects to find where the objects published property is set to true
//return in a json formatted string

app.get("/blog", async (req, res) => {
  try {
    let result = await blogsService.getPublishedPosts();
    res.json(result);
  } catch (error) {
    res.json({ message: error });
  }
});

app.get("/posts", async (req, res) => {
  try {
    // Parse the query string to extract the category parameter
    const category = req.query.category;
    const minDate = req.query.minDate;

    if (category) {
      let postsCategory = await blogsService.getPostsByCategory(category);
      res.json(postsCategory);
    }

    // Extract the minDate parameter from the query string
    else if (minDate) {
      // Retrieve posts from the database and filter based on the minDate parameter
      const post = await blogsService.getPostsByMinDate(minDate);
      res.json(post);
    } else {
      let result = await blogsService.getAllPosts();
      res.json(result);
    }
  } catch (error) {
    res.json({ message: error });
  }
});

app.get("/categories", async (req, res) => {
  try {
    let result = await blogsService.getCategories();
    res.json(result);
  } catch (error) {
    res.json({ message: error });
  }
});

app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), async (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    blogsService.addPost(req.body).then(() => {
      res.redirect("/posts");
    });
  });
});

app.get("/post/value", async (req, res) => {
  try {
    // Extract the minDate parameter from the query string
    const value = parseInt(req.params.value);
    // Retrieve posts from the database and filter based on the value parameter
    const resultStrId = await blogsService.getPostById(value);
    res.json(resultStrId);
  } catch (err) {
    reject(err);
  }
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/views/404.html");
});

// start the server and log a message to the console

async function main() {
  try {
    await blogsService.initialize();
    app.listen(HTTP_PORT, () => {
      console.log("Express http server listening on port " + HTTP_PORT);
    });
  } catch (error) {
    console.log(error);
  }
}
main();
