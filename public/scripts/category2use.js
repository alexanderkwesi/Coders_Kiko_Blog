let currentPage = 1;
let totalPages = 1;
const postsContainer = document.getElementById("postsContainer");
const postCard = document.querySelector(".post-card");
// Category elements
const Programming_Language = document.querySelector(".Programming-Language");
const Web_Development = document.querySelector(".Web-Development");
const Databases = document.querySelector(".Databases");
const DevOps_and_Tools = document.querySelector(".DevOps-&-Tools");
const Mobile_Development = document.querySelector(".Mobile-Development");
const Security = document.querySelector(".Security");
const Computer_Science_Foundation = document.querySelector(
  ".Computer-Science-Foundation"
);
const Testing = document.querySelector(".Testing");
const AI_Machine_Learning = document.querySelector(".AI-&-Machine-Learning");
const API_and_Integration = document.querySelector(".API-&-Integration");
const General = document.querySelector(".General");

// Category filters event listeners
Programming_Language.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("programming", "Programmin-Language", currentPage);
});

Web_Development.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("web", "Web-Development", currentPage);
});

Databases.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("database", "Databases", currentPage);
});

DevOps_and_Tools.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("devops", "DevOps-&-Tools", currentPage);
});

Mobile_Development.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("mobile", "Mobile-Development", currentPage);
});

Security.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("security", "Security", currentPage);
});

Computer_Science_Foundation.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick(
    "cs-foundation",
    "Computer-Science-Foundation",
    currentPage
  );
});

Testing.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("testing", "Testing", currentPage);
});

AI_Machine_Learning.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("ai-ml", "AI-&-Machine Learning", currentPage);
});

API_and_Integration.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("api", "API-&-Integration", currentPage);
});

General.addEventListener("click", (e) => {
  e.preventDefault();
  handleCategoryClick("general", "General", currentPage);
});

// Replace the handleCategoryClick function with:
async function handleCategoryClick(endpoint, category, page) {
  try {
    postsContainer.innerHTML = `<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i><p class="mt-2 text-gray-600">Loading posts...</p></div>`;

    const response = await fetch(`http://127.0.0.1:5700/get/${endpoint}/${category}/${page}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    totalPages = data.pages.totalPages || 1;
    if (data.success && data.result.paginatedPosts) {
        if (postsContainer.innerHTML !== "") {
          postspinner.classList.add("hide");
        } else {
          postspinner.classList.remove("show");
        }
        displayPosts(data.result.paginatedPosts);
        updatePaginationUI(page);
        
    } else {
        if (postsContainer.innerHTML !== "") {
          postspinner.classList.add("hide");
        } else {
          postspinner.classList.remove("show");
        }
      throw new Error("No posts found");
    }
  } catch (error) {
    console.log(`Error fetching ${category} posts:`, error);
    if (postsContainer.innerHTML !== "") {
      postspinner.classList.add("hide");
    } else {
      postspinner.classList.remove("show");
    }
    postsContainer.innerHTML = `<p class="text-red-500 text-center py-8">Failed to load ${category} posts</p>`;
  }
}

// --- POSTS DISPLAY ---
function displayPosts(posts) {
  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = `<p class="text-gray-500 text-center py-8">No posts found</p>`;
    return;
  }

  postsContainer.innerHTML = posts
    .map(
      (post) => `
        <div class="post-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div class="h-48 overflow-hidden cursor-pointer relative">
            <img src="${post.imageUrl || "default.jpg"}" alt="${
        post.title
      }" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
            ${
              post.featured
                ? `<span class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Featured</span>`
                : ""
            }
          </div>
          <div class="p-6">
            <div class="flex items-center mb-2">
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${
                post.category !== "" ? post.category : "General"
              }</span>
              <div class="flex items-center ml-auto space-x-2">
                ${
                  post.tags
                    ? post.tags
                        .map(
                          (tag) =>
                            `<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">${tag}</span>`
                        )
                        .join("")
                    : ""
                }
                <span class="text-gray-500 text-sm"><i class="fas fa-eye mr-1"></i> ${
                  post.views || 0
                }</span>
                <span class="text-gray-500 text-sm"><i class="far fa-clock mr-1"></i>${new Date(
                  post.createdAt
                ).toLocaleDateString()}</span>
              </div>
            </div>
            <h3 class="text-xl font-bold mb-2 cursor-pointer hover:text-blue-600">${
              post.title
            }</h3>
            <p class="text-gray-600 mb-4 post-excerpt">${
              post.excerpt || post.content.substring(0, 150) + "..."
            }</p>
            <div class="post-content">
              <div class="border-t border-gray-200 pt-4 mb-4"></div>
              <p class="text-gray-600 mb-4">${post.content}</p>
              ${
                post.gallery
                  ? `<div class="grid grid-cols-3 gap-2 mb-4">${post.gallery
                      .map(
                        (img) =>
                          `<img src="${img}" class="w-full h-24 object-cover rounded">`
                      )
                      .join("")}</div>`
                  : ""
              }
              ${
                post.videoUrl
                  ? `<div class="aspect-w-16 aspect-h-9 mb-4">
                <iframe src="${post.videoUrl}" class="w-full h-64" frameborder="0" allowfullscreen></iframe>
              </div>`
                  : ""
              }
            </div>
            <div class="flex items-center justify-between mt-4">
              <div class="flex items-center">
                <img src="${
                  post.authorAvatar || "https://via.placeholder.com/40"
                }" alt="${
        post.author
      }" class="w-8 h-8 rounded-full mr-2 object-cover">
                <div>
                  <span class="text-sm font-medium block">${post.author}</span>
                  <span class="text-xs text-gray-500">${
                    post.authorTitle || "Writer"
                  }</span>
                </div>
              </div>
              <button class="readmore-btn text-green-600 hover:text-green-800 text-sm font-medium" data-id="${
                post.id
              }">
                Read more <i class="fas fa-chevron-down ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  // Initialize interactive elements
  initPostInteractions();
}

function initPostInteractions() {
  // Read more functionality
  document.querySelectorAll(".readmore-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const postCard = this.closest(".post-card");
      const content = postCard.querySelector(".post-content");
      const excerpt = postCard.querySelector(".post-excerpt");

      content.classList.toggle("hidden");
      excerpt.classList.toggle("hidden");

      this.innerHTML = !content.classList.contains("hidden")
        ? 'Read less <i class="fas fa-chevron-up ml-1"></i>'
        : 'Read more <i class="fas fa-chevron-down ml-1"></i>';

      postCard.style.margin = "30px";
      postsContainer.after(postCard, postsContainer);
    });
  });

  // Image click to expand
  document.querySelectorAll(".post-card img").forEach((img) => {
    if (!img.closest(".gallery")) {
      img.addEventListener("click", function () {
        const modal = document.createElement("div");
        modal.className =
          "fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4";
        modal.innerHTML = `
              <div class="relative max-w-4xl w-full">
                <img src="${this.src}" class="max-h-screen w-full object-contain">
                <button class="absolute top-4 right-4 text-white text-2xl">&times;</button>
              </div>
            `;
        document.body.appendChild(modal);

        modal.querySelector("button").addEventListener("click", () => {
          modal.remove();
        });

        // Close modal when clicking outside image
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        });
      });
    }
  });
}
