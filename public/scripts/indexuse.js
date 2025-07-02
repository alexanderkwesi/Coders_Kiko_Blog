document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const postsContainer = document.getElementById("postsContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageIndicator = document.getElementById("pageIndicator");
  const blogForm = document.getElementById("blogForm");
  const addImageBtn = document.getElementById("addImageBtn");
  const imageFile = document.getElementById("imageFile");
  const imageInput = document.getElementById("image");
  const titleInput = document.getElementById("title");
  const contentTextarea = document.getElementById("content");
  const numberOfRecords = document.getElementById("totalnumber");
  const publish = document.getElementById("publish");
  const promise_val = document.querySelector(".get_promise");
  const dateOrderDropdown = document.querySelector(".sort-by-date");
  const postspinner = document.querySelector(".spinner");

  // State variables
  let currentPage = 1;
  let totalPages = 1;
  let imagetitle = "";
  const displayedPostIds = new Set();

  // --- TEXT INPUT HANDLING ---
  function handleTitleFocus() {
    titleInput.classList.remove("hidden");
    titleInput.focus();
    contentTextarea.classList.remove("hidden");
  }

  function handleTitleKeydown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleFocus();
    }
  }

  function sanitizeText(text) {
    return text.replace(/[^\w\s.?!'"()\-]/g, "");
  }

  function handlePaste(event) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData(
      "text"
    );
    const cleanText = sanitizeText(pastedText);

    const input = event.target;
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;

    input.value =
      input.value.slice(0, startPos) + cleanText + input.value.slice(endPos);
    input.setSelectionRange(
      startPos + cleanText.length,
      startPos + cleanText.length
    );
  }

  function handleInput(event) {
    event.target.value = sanitizeText(event.target.value);
  }

  function initTextInputs() {
    titleInput.addEventListener("focus", handleTitleFocus);
    titleInput.addEventListener("keydown", handleTitleKeydown);

    [titleInput, contentTextarea].forEach((input) => {
      input.addEventListener("paste", handlePaste);
      input.addEventListener("input", handleInput);
    });
  }

  // --- IMAGE UPLOAD HANDLING ---
  function handleImageUpload() {
    if (this.files && this.files[0]) {
      const originalName = this.files[0].name;
      imagetitle = sanitizeText(originalName.replace(/,/g, ""));
      imageInput.value = imagetitle;
      publish.disabled = false;
    }
  }

  // --- FORM SUBMISSION ---
  async function handleFormSubmit(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();
    const totalnumber = promise_val.textContent || numberOfRecords.value.trim();

    // Enhanced validation
    if (!title || !content || !imagetitle) {
      alert("Please fill out all fields including uploading an image.");
      return;
    }

    const wordCount = (text) =>
      text.split(/\s+/).filter((word) => word.length > 0).length;

    if (wordCount(title) < 5 || wordCount(content) > 1000) {
      alert(
        "Ensure your title has at least 5 words and content has at least 15 words"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("numberOfRecords", totalnumber);
      if (imageFile.files[0]) {
        formData.append("image", imageFile.files[0]);
      }

      const response = await fetch("http://127.0.0.1:5700/posts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Post created successfully!");
        resetForm();
        loadPosts(currentPage);
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`An error occurred while creating the post: ${error.message}`);
    }
  }

  function resetForm() {
    blogForm.reset();
    imageInput.value = "";
    contentTextarea.classList.add("hidden");
    imagetitle = "";
    publish.disabled = true;
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
                <div class="post-content hidden">
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
                      <span class="text-sm font-medium block">${
                        post.author
                      }</span>
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

        this.innerHTML = content.classList.contains("hidden")
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


  
  // --- POST SORTING ---
  async function sort_by_date_(selectedOption, page) {
    const validOptions = ["newest", "oldest", "mostpopular", "trending"];
    if (!validOptions.includes(selectedOption)) {
      console.error("Invalid sort option selected");
      return;
    }

    try {
      dateOrderDropdown.disabled = true;
      dateOrderDropdown.classList.add("opacity-50");

      const response = await fetch(
        `http://127.0.0.1:5700/posts/sorted-by-date/${page}?order=${
          selectedOption === "oldest" ? "asc" : "desc"
        }&sort=${selectedOption}`
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      totalPages = result.data?.pages || 1;
      if (result.data?.posts) {
        if (postsContainer.innerHTML !== "") {
          postspinner.classList.add("hide");
        } else {
          postspinner.classList.remove("show");
        }
        displayPosts(result.data.posts);
        updatePaginationUI(page);
        
      } else {
        console.warn("No posts found in response");
        if (postsContainer.innerHTML !== "") {
          postspinner.classList.add("hide");
        } else {
          postspinner.classList.remove("show");
        }
        postsContainer.innerHTML = `<p class="text-gray-500 text-center py-8">No posts found</p>`;
      }
      pageIndicator.classList.remove("hide");
    
    } catch (error) {
      console.error("Failed to load sorted posts:", error);
      if (postsContainer.innerHTML !== "") {
        postspinner.classList.add("hide");
      } else {
        postspinner.classList.remove("show");
      }
      postsContainer.innerHTML = `<p class="text-red-500 text-center py-8">Failed to load posts</p>`;
    } finally {
      dateOrderDropdown.disabled = false;
      dateOrderDropdown.classList.remove("opacity-50");
      pageIndicator.classList.add("show");
    }
  }

  // --- POST FETCHING AND PAGINATION ---
  async function loadPosts(page) {
    try {
      postsContainer.innerHTML = `<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i><p class="mt-2 text-gray-600">Loading posts...</p></div>`;

      const response = await fetch(
        `http://127.0.0.1:5700/get_all_rows/${page}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const posts = result.data?.posts || [];
      totalPages = result.data?.totalPages || 1;

      if (posts.length > 0) {
        if (postsContainer.innerHTML !== "") {
          postspinner.classList.add("hide");
        } else {
          postspinner.classList.remove("show");
        }
        displayPosts(posts);
        updatePaginationUI(page);
      } else {
        if (postsContainer.innerHTML !== "") {
          postspinner.classList.add("hide");
        } else {
          postspinner.classList.remove("show");
        }
        postsContainer.innerHTML = `<p class="text-gray-500 text-center py-8">No posts found</p>`;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      if (postsContainer.innerHTML !== "") {
        postspinner.classList.add("hide");
      } else {
        postspinner.classList.remove("show");
      }
      postsContainer.innerHTML = `<p class="text-red-500 text-center py-8">Failed to load posts</p>`;
    }
  }

  function updatePaginationUI(page) {
    currentPage = page;
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    pageIndicator.classList.remove("hidden");
    prevBtn.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  async function get_promise_result() {
    try {
      const response = await fetch("http://127.0.0.1:5700/get_results");
      if (!response.ok) throw new Error("Failed to fetch results");

      const data = await response.json();
      const val = data.numrows_of_data || 0;

      promise_val.textContent = val;
      numberOfRecords.value = val;
      promise_val.classList.add("hidden");
    } catch (error) {
      console.error("Error fetching result:", error);
      promise_val.textContent = "Error";
    }
  }

  // Initialize event listeners
  function initEventListeners() {
    initTextInputs();

    imageFile.addEventListener("change", handleImageUpload);
    addImageBtn.addEventListener("click", () => imageFile.click());
    blogForm.addEventListener("submit", handleFormSubmit);

    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        loadPosts(currentPage - 1);
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        loadPosts(currentPage + 1);
      }
    });

    if (dateOrderDropdown) {
      dateOrderDropdown.addEventListener("change", () => {
        const selectedValue = dateOrderDropdown.value;
        if (selectedValue) sort_by_date_(selectedValue,currentPage);
      });
    }
  }




  document
    .getElementById("subscriptionForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      //const messageEl = document.getElementById("message");

      try {
        const response = await fetch("http://127.0.0.1:5700/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Subscription failed");

        alert(`${data.message}\n\nsuccess\n`);
        //messageEl.textContent = data.message;
        //messageEl.className = "success";
        //messageEl.style.display = "block";
        document.getElementById("email").value = "";
      } catch (error) {
        messageEl.textContent = error.message;
        messageEl.className = "error";
        messageEl.style.display = "block";
      }
    });

  // Initialize everything
  initEventListeners();
  loadPosts(currentPage);
  get_promise_result();
});
