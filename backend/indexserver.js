// pagingbackend.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const csv = require("csv-parser");
const Papa = require("papaparse");
const { LocalStorage } = require("node-localstorage");
const { pathToFileURL } = require("url");


// Initialize app
const app = express();
const PORT = process.env.PORT || 5700;
const localStorage = new LocalStorage("./scratch");

// Configuration

const POSTS_CSV = "posts.csv"; // file path

const UPLOADS_DIR = "/Users/alexanderkwesi/Coders Kiko Blog/public/uploads/";
let posts_ = {};



// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}





// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "public")));

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR); // Folder where files will be saved
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name with original extension
  }
});


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});



// Helper functions
const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};



function get_head(filepath, posts) {
  const arr = [];
  const key = Object.keys(posts);
  const id = Object.values(posts);
  id.forEach(elm => {
    arr.push(elm);
    console.log(elm);
  });
  if (fs.existsSync(filepath)) {
    if(filepath.length === 1){
      const head =
        "id,title,content,excerpt,category,views,likes,comments,author,authorAvatar,imageUrl,createdAt,featured";
      fs.writeFileSync(filepath, `${head}\n`, "utf8",{
        head : true,
        skip_empty_lines : true,
      }); // overwrite with header
      console.log("Head written to file.");
    }
    else if (filepath.length >= 2) {
      const writ = fs.appendFileSync(
        filepath,
        `${String(arr)}\n`,
        "utf8", {
          head : true,
          skip_empty_lines : true,
        }
      );
      if (!writ)
        return Error(("An error Occurred")); // overwrite with header
      console.log("Body written to file.");
    }
  }

}


async function get_file_content(filePath) {
  if (!fs.existsSync(filePath)) return [];

  try {
    const csvData = fs.readFileSync(filePath, "utf8");

    const { data, errors } = Papa.parse(csvData, {
      header: true, // convert rows to objects using headers
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      console.error("CSV parsing errors:", errors);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Error reading CSV with PapaParse:", err);
    return [];
  }
}



function writeCSV(filePath, data){
  const safeArray = Array.isArray(data) ? data : [data];

  if (!Array.isArray(safeArray)) {
    throw new Error("Input must be an array of objects");
  }
  const csvData = Papa.unparse(safeArray, {
  header: true, // Ensures headers are included
  });

  if (!csvData && csvData.length === 0)
  {
    get_head(filePath, csvData);
  }

  // Ensure every item is a plain object
  for (const item of csvData) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      fs.writeFile(filePath, item, "utf8", (err) => {
        console.log("Written to File");
      });
      return new Error("writeCSV error: Each item must be a plain object");
    }
  }
};

function getPostsCount(){

    if (fs.existsSync(POSTS_CSV)){
      const data = fs.readFileSync(POSTS_CSV, "utf-8");
      const results = Papa.parse(data, {
        columns: true,
        skip_empty_lines: true
      });
      console.log(results.length);
      return results.length;
    }
};


function getPosts_Count(){

  if (fs.existsSync(POSTS_CSV)){
    const data = fs.readFileSync(POSTS_CSV, "utf-8");
    const results = Papa.parse(data, {
      columns: true,
      skip_empty_lines: true,
    });
    console.log(results.length);
    return results.length;
  } 
};



function categorizePost(title){
  const categories = {
    "Programming-Language": [

      "javaScript / typeScript",

      "python",
      
      "java",
      
      "c / c++",
      
      "c#",
      
      "go",
      
      "ruby",
      
      "swift / objective-c",
      
      "php",
      
      "rust",
      
      "kotlin"
    ],
    "Web-Development": 
    [
      "frontend",

      "html / css",

"javascript (vanilla)",

"react.js",

"vue.js",

"angular",

"svelte",

"tailwind CSS / bootstrap",

"webpack / vite",

"backend",

"node.js / express.js",

"django / flask (python)",

"spring boot (java)",

"laravel (php)",

".net core",

"fastapi",

"static",

"website",

"dynamic",

"backend"

],
    "Databases": [
      "sql (mysql, postgresql, sqlite)",

"nosql (mongodb, firebase, cassandra)",

"redis / memcached",

"graphql / hasura"
    ],
    "DevOps-&-Tools": [

      "docker",
       "kubernetes",
      "git",
      "github",
      "gitLab",
      "ci/cd",
      "actions",
      "jenkins",
      "bash",
      "shell scripting",
      "linux",
      "server management"
    ],
    "Mobile-Development":
    [
      "react native",

      "flutter",
      
      "swift (iOS)",
      
      "kotlin (android)",
      
      "xamarin",
      "ios",
      "android",

    ],
    "Security":[
"jwt",
"oauth",
"authentication",
"https",
"ssl",
"input validation",
"sanitization",
"owasp top 10",
"aes",
"rsa",
"encryption (aes, rsa)"
    ], 
    "Computer-Science-Foundations":[
      "algorithms",
      "algorithms & data structures",
      "operating systems",
      "data structures",
      "networking / protocols",
      "networking",
      "protocols",
      "compilers / interpreters",
      "compilers",
      "interpreters",
      "software architecture & design patterns"
    ],
    "Testing":[
      "unit testing",
      "jest",
      "mocha",
      "pytest",
      "unit testing (jest, mocha, pytest)",
      "integration",
"integration testing",
"end-to-end",
"end-to-end testing (cypress, playwright, selenium)",
"cypress",
"playwright",
"selenium",
"test-driven development (TDD)"
    ],
    "AI-&-Machine Learning":
    [
      "machine learning",
      "tensorflow",
      "pytorch",
      "scikit-learn",
      "nlp",
      "llms",
      "openai",
      "api",
      "hugging face",
      "panda",
      "numpy",
      "data science",
      "numpy",
      "tensorFlow / pytorch",

      "scikit-learn",
      
      "nlp / llms",
      
      "openai api / hugging face",
      
      "data science / pandas / numpy"
    ],
    "APIs-&-Integration":[
      "api",
      "apis",
      "rest",
"rest apis",
"graph",
"webhooks",
"graphapi apis",
"payment",
"webhooks",
"stripe",
"paypal",
"email",
"send",
"grid",
"mail",
"gun",
"payment apis (stripe, paypal)",

"email apis (sendgrid, mailgun)"
    ],
    "AI":["ai", "chatgpt, openai", "otherai" ],
  };

  const lowerTitle = title.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
      return category;
    }
  }
  
};



// Enhanced handleCategoryRequest with Papa Parse
app.get("/get/:endpoint/:category/:page", async (req, res) => {
  try {
    const endpoint = req.params.endpoint;
    const category = req.params.category;
    const page = Math.max(parseInt(req.params.page) || 1, 1);
    const limit = page === 1 ? 6 : 9;

    if (!fs.existsSync(POSTS_CSV)) {
      return res.status(404).json({
        success: false,
        error: "No posts found. Please create some posts first.",
      });
    }

    // Read and parse CSV file
    const csvFile = fs.readFileSync(POSTS_CSV, "utf8");

    const parseResults = await new Promise((resolve, reject) => {
      Papa.parse(csvFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results),
        error: (error) => reject(error),
      });
    });

    // Filter posts by category and transform data
    const allPosts = parseResults.data
      .filter((post) => post.category === category)
      .map((post) => ({
        id: post.id || Math.random().toString(36).substr(2, 9),
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || post.content.substring(0, 100) + "...",
        category: post.category || category,
        tags: post.tags ? post.tags.split(",") : [],
        imageUrl: post.imageUrl || null,
        featured: post.featured === "true",
        views: parseInt(post.views) || 0,
        createdAt: post.createdAt || new Date().toISOString(),
        author: post.author || "Anonymous",
        authorAvatar: post.authorAvatar || null,
        authorTitle: post.authorTitle || null,
      }));

    // Calculate pagination values
    const totalPosts = allPosts.length;
    const postsAfterFirstPage = Math.max(totalPosts - 6, 0);
    const totalPages = 1 + Math.ceil(postsAfterFirstPage / 9);

    if (page > totalPages) {
      return res.status(200).json({
        success: true,
        data: {
          posts: [],
          totalPages,
          totalPosts,
          message: "Page number exceeds total pages",
        },
      });
    }

    // Determine pagination range
    let startIndex, endIndex;
    if (page === 1) {
      startIndex = 0;
      endIndex = Math.min(limit, totalPosts);
    } else {
      startIndex = 6 + (page - 2) * 9;
      endIndex = Math.min(startIndex + 9, totalPosts);
    }

    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        result: paginatedPosts,
        count: paginatedPosts.length,
        totalPosts,
        pages:totalPages,
        currentPage: page,
        meta: parseResults.meta,
      },
    });
  } catch (error) {
    console.error(`Error processing ${req.params.category} CSV:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to process ${req.params.category} data`,
      error: error.message,
    });
  }
});

// API Endpoints

app.get("/get_all_rows/:page", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.params.page) || 1, 1);
    const limit = page === 1 ? 6 : 9;

    if (!fs.existsSync(POSTS_CSV)) {
      return res
        .status(404)
        .json({ error: "No posts found. Please create some posts first." });
    }

    const posts = await get_file_content(POSTS_CSV);
    const totalPosts = posts.length >= 1 ? posts.length : null;

    const postsAfterFirstPage = Math.max(totalPosts - 6, 0);
    const totalPages = 1 + Math.ceil(postsAfterFirstPage / 9);

    if (page > totalPages) {
      return res.status(200).json({
        data: {
          posts: posts,
          totalPages,
          totalPosts,
        },
      });
    }

    let startIndex, endIndex;
    if (page === 1) {
      startIndex = 0;
      endIndex = Math.min(limit, totalPosts);
      
    } else {
      startIndex = 6 + (page - 2) * 9;
      endIndex = Math.min(startIndex + 9, totalPosts);
      
    }

    
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
      
    res.json({
      data: {
        posts: paginatedPosts,
        totalPages,
        totalPosts,
      },
    });
  
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});


// Get all posts with pagination
app.get("/allposts/:page", async (req, res) => {
  try {
    const page = req.params.page || 1;
    const firstPageLimit = 6;
    const otherPagesLimit = 9;

    if (!fs.existsSync(POSTS_CSV)) {
      return res.status(404).json({
        error: "No posts found. Please create some posts first.",
      });
    } else {
      //get_file_content(POSTS_CSV);
    }

    const posts = get_file_content(POSTS_CSV);
    const totalPosts = posts.length;

    
    // Calculate total pages
    const remainingPosts = Math.max(0, totalPosts - firstPageLimit);
    const additionalPages = Math.ceil(remainingPosts / otherPagesLimit);
    const totalPages = parseInt( 1 + additionalPages);

    // Get posts for current page
    let startIndex, endIndex;
    if (page === 1) {
      startIndex = 0;
      endIndex = firstPageLimit;
    } else {
      startIndex = firstPageLimit + (page - 2) * otherPagesLimit;
      endIndex = startIndex + otherPagesLimit;
    }

    const paginatedPosts = posts.slice(startIndex, endIndex);
    const normalizedPosts = paginatedPosts.map((post) => ({
      ...post,
      id: parseInt(post.id, 10), // convert ID to number
      views: parseInt(post.views, 10) || 0,
      likes: parseInt(post.likes, 10) || 0,
      comments: parseInt(post.comments, 10) || 0,
      createdAt: new Date(post.createdAt),
      featured: post.featured === "true",
      category: post.category || "General",
    }));
    // Option 1: Loop through each object
    normalizedPosts.forEach((obj) => {
      console.log(JSON.stringify(obj, null, 2));
    });

    // Option 2: Convert to JSON Lines
    const jsonLines = normalizedPosts
      .map((obj) => JSON.stringify(obj))
      .join("\n");

    const _posts = jsonLines;
    const _totalPages = totalPages;
    res.json({
      data: {
        posts: _posts,
        pages: _totalPages,
        totalPosts,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get post count
app.get("/get_results", async (req, res) => {
  try {
    const count = 0 ? await getPostsCount() : 0;
    localStorage.setItem("number_of_rows", count.toString());
    res.json({ numrows_of_data: count });
  } catch (error) {
    console.error("Error getting post count:", error);
    res.status(500).json({ error: "Failed to get post count" });
  }
});

/// Create new post
app.post("/posts", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }


    const excerpt = content.length > 150 ? content.substring(0, 150) + "..." : content;
    const imageUrl = req.file ? `${UPLOADS_DIR}${req.file.filename}` : null;
    const category = "" ? "General" : categorizePost(title);

    const authors = ["Alexander Oluwaseun Kwesi"];
    const author = authors[Math.floor(Math.random() * authors.length)];


    // Load or initialize post array
    //if (fs.existsSync(POSTS_CSV)) {
      //let len = await getPostsCount(); // you need a readCSV helper that returns an array
    //}

    // Ensure header exists
    //get_head(POSTS_CSV, posts);
    getPosts_Count();
    // Assign new ID
    //const nextId = posts.length > 0 ? parseInt(posts[0].id || "0") + 1 : 1;

    const newPost = {
      id: parseInt(getPostsCount() === 0  ? 1 : parseInt(getPostsCount()) + 1),
      title,
      content,
      excerpt,
      category,
      views: 0,
      likes: 0,
      comments: 0,
      author,
      authorAvatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      imageUrl,
      createdAt: new Date().toISOString(),
      featured: Math.random() > 0.8,
    };
 
    const newItem = Object.values(newPost);
    posts_ = newItem;
    get_head(POSTS_CSV, newItem);
    const result = getPostsCount(POSTS_CSV);
    console.log(result);
    res.json({
      success: true,
      message: "Post created successfully",
      post: result,
    });

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
});












// Helper functions
function loadingSpinner() {
  return `<div class="text-center py-12">
    <i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
    <p class="mt-2 text-gray-600">Loading CSV data...</p>
  </div>`;
}

function errorMessage(error, category) {
  return `<div class="col-span-full text-center py-8">
    <p class="text-red-500">Failed to load ${category} data</p>
    <p class="text-gray-500 mt-2">${error.message}</p>
  </div>`;
}




app.get("/get_every_row", (req, res) => {
  try {
    if (!fs.existsSync(POSTS_CSV)) return 0;
    const data = fs.readFileSync(POSTS_CSV, "utf8");
    const results = Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
    });
    res.json({
      data: {
        result: results.data,
      },
    });
    return results.data.length;
  } catch (err) {
    console.error("Error counting posts:", err);
    return 0;
  }
});



// Get sorted posts
app.get("/posts/sorted-by-date/:page", async (req, res) => {
  try {
    const { order = "desc", sort = "newest" } = req.query;


    const page = Math.max(parseInt(req.params.page) || 1, 1);
    const limit = page === 1 ? 6 : 9;

    if (!fs.existsSync(POSTS_CSV)) {
      return res
        .status(404)
        .json({ error: "No posts found. Please create some posts first." });
    }

    let posts = await get_file_content(POSTS_CSV);
    const totalPosts = posts.length >= 1 ? posts.length : null;

    const postsAfterFirstPage = Math.max(totalPosts - 6, 0);
    const totalPages = 1 + Math.ceil(postsAfterFirstPage / 9);
    
    
    if (!fs.existsSync(POSTS_CSV)) {
      return res.status(404).json({
        success: false,
        message: "No posts found",
      });
    }

    // Get posts (assuming it's a synchronous function; if async, use await)
    //let posts = get_file_content(POSTS_CSV);

    // Make sure it's an array
    if (!Array.isArray(posts)) {
      return res.status(500).json({
        success: false,
        message: "Invalid posts format",
      });
    }

    // Convert string dates to Date objects and views/likes to numbers
    posts = posts.map((post) => ({
      ...post,
      createdAt: new Date(post.createdAt),
      views: parseInt(post.views, 10) || 0,
      likes: parseInt(post.likes, 10) || 0,
    }));

    // Sorting logic
    switch (sort) {
      case "newest":
      case "oldest":
        posts.sort((a, b) =>
          order === "asc"
            ? a.createdAt - b.createdAt
            : b.createdAt - a.createdAt
        );
        break;
      case "mostpopular":
        posts.sort((a, b) =>
          order === "asc" ? a.views - b.views : b.views - a.views
        );
        break;
      case "trending":
        posts.sort((a, b) => {
          const now = Date.now();
          const scoreA = (a.likes / (a.views || 1)) * (now - a.createdAt);
          const scoreB = (b.likes / (b.views || 1)) * (now - b.createdAt);
          return order === "asc" ? scoreA - scoreB : scoreB - scoreA;
        });
        break;
      default:
        // Fallback: newest first
        posts.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Convert createdAt back to string format (optional)
    const sortedPosts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
    }));


    if (page > totalPages) {
      return res.status(200).json({
        data: {
          posts: sortedPosts,
          totalPages,
          totalPosts,
        },
      });
    }

    let startIndex, endIndex;
    if (page === 1) {
      startIndex = 0;
      endIndex = Math.min(limit, totalPosts);
    } else {
      startIndex = 6 + (page - 2) * 9;
      endIndex = Math.min(startIndex + 9, totalPosts);
    }

    const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        posts: paginatedPosts,
        sort,
        order,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error sorting posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sort posts",
    });
  }
});

SUBSCRIBERS_CSV = "subscribe.csv";

// Create CSV file if it doesn't exist
function initializeCSV() {
  if (!fs.existsSync(SUBSCRIBERS_CSV)) {
    const headers = ['id', 'email', 'subscriptionDate', 'isVerified'];
    const csv = Papa.unparse([headers]);
    fs.writeFileSync(SUBSCRIBERS_CSV, csv);
  }
}

// Add subscriber to CSV
function addSubscriberToCSV(email) {
  const newSubscriber = {
    id: Math.floor(Math.random() * 35356000),
    email,
    subscriptionDate: new Date().toISOString(),
    isVerified: false
  };

  // Read existing data
  const csvData = fs.readFileSync(SUBSCRIBERS_CSV, 'utf8');
  const parsed = Papa.parse(csvData, { header: true });
  
  // Check for duplicate email
  const exists = parsed.data.some(sub => sub.email === email);
  if (exists) {
    throw new Error('Email already subscribed');
  }

  // Append new subscriber
  parsed.data.push(newSubscriber);
  const updatedCSV = Papa.unparse(parsed.data, { header: true });
  fs.writeFileSync(SUBSCRIBERS_CSV, updatedCSV);
  
  return newSubscriber;
}

// Routes
app.post('/subscribe', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const subscriber = addSubscriberToCSV(email);
    
    // In a real app, send verification email here
    console.log(`Verification email would be sent to: ${email}`);
    
    res.status(201).json({
      message: 'Subscription successful! Please check your email to verify.',
      subscriber
    });
  } catch (error) {
    if (error.message === 'Email already subscribed') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});

// Start server
initializeCSV();


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
