const navBar = document.getElementById('nav-bar_');
const uploadMethodRadios = document.querySelectorAll('input[name="uploadMethod"]');
const videoUploadField = document.getElementById("videoUploadField");
const videoUrlField = document.getElementById("videoUrlField");
const successModal = new bootstrap.Modal(document.getElementById('successModal'));
const thumbnailInput = document.getElementById("thumbnail_");
const imageInput = document.getElementById("image");
const thumbnailPreview = document.getElementById("thumbnailPreview");
const videoFileInput = document.getElementById("video_");
const videoUrlInput = document.getElementById("video-url_");

// ✅ Fetch analytics data dynamically
async function fetchAnalytics() {
    try {
        // const res = await fetch("/api/users/analytics");
        const result = await fetchData('/api/users/analytics');

        // Backend returns: [{ month: 1, count: 10 }, { month: 2, count: 20 }, ...]
        if (!result || !Array.isArray(result)) return [];

        return result;
    } catch (err) {
        console.error("Error fetching analytics:", err);
        return [];
    }
};
// ✅ Render chart
async function renderRevenueChart() {
    const analyticsData = await fetchAnalytics();

    // Convert months to labels
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const labels = analyticsData.map(item => monthNames[item.month - 1]);
    const actualRevenue = analyticsData.map(item => item.count); // real count
    const projectedRevenue = analyticsData.map(item => Math.round(item.count * 1.2)); // example projection
    const potentialRevenue = analyticsData.map(item => Math.round(item.count * 1.5)); // example potential

    const data = {
        labels: labels,
        datasets: [
            {
                label: "Revenue Amount ($)",
                data: actualRevenue,
                backgroundColor: "#3f37c9",
                borderColor: "#6162dc",
                borderWidth: 1,
            },
            {
                label: "Projected Revenue ($)",
                data: projectedRevenue,
                backgroundColor: "#e9c46a",
                borderColor: "#e9c46a",
                borderWidth: 1,
            },
            {
                label: "Potential Revenue ($)",
                data: potentialRevenue,
                backgroundColor: "#db3545",
                borderColor: "#db3545",
                borderWidth: 1,
            },
        ],
    };

    const config = {
        type: "bar",
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    title: {
                        display: true,
                        text: "Revenue ($)",
                        color: "#ffffff",
                    },
                },
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    title: {
                        display: true,
                        text: "Months",
                        color: "#ffffff",
                    },
                },
            },
            plugins: {
                legend: {
                    labels: { color: "#ffffff" },
                },
            },
        },
    };

    // ✅ Render only if element exists
    if (doesElementExist('#dashboard')) {
        new Chart(document.getElementById("revenueChart"), config);
    }
};

// Call the function
renderRevenueChart();

// toggle button
document.querySelector('.toggle-btn').addEventListener('click', () => {
    const sideBar = document.querySelector('.sidebar');
    sideBar.classList.toggle('d-none');
});
// Add click event to all sidebar links
document.querySelectorAll('.sidebar-link').forEach(function (link) {
    link.addEventListener('click', function () {
        // Remove active class and styles from all links
        document.querySelectorAll('.sidebar-link').forEach(function (item) {
            item.classList.remove('active');
        });

        // Add active class and styles to the clicked link
        this.classList.add('active');

        // Save the active link index in localStorage
        localStorage.setItem('activeSidebarLink', this.dataset.index);
    });
});
// On page load, set the active link from localStorage or default to Dashboard
document.addEventListener('DOMContentLoaded', function () {
    const activeIndex = localStorage.getItem('activeSidebarLink');
    const defaultIndex = "1"; // Set the default index for Dashboard
    const indexToUse = activeIndex || defaultIndex;

    // Set the active link
    const activeLink = document.querySelector(`.sidebar-link[data-index="${indexToUse}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        activeLink.style.backgroundColor = '#ff002b';
        activeLink.style.borderLeft = '4px solid white';
        activeLink.style.color = 'white';
    }
});

// load body data
document.querySelectorAll('.card-body').forEach((card) => {
    card.addEventListener('click', (event) => {
        const target = card.getAttribute('data-target');
        if (target) {
            const sidebarLink = document.querySelector(target);
            if (sidebarLink) {
                sidebarLink.click();
            };
        };
    });
});
document.addEventListener("DOMContentLoaded", () => {
    // ✅ Handle Edit Button Clicks
    document.body.addEventListener("click", async (event) => {
        if (!event.target.classList.contains("edit-class")) return;

        const editId = event.target.getAttribute("data-id");
        const sectionId = event.target.getAttribute("data-section-id");
        const formId = event.target.getAttribute("data-form-id");
        const backBtnId = event.target.getAttribute("data-back-btn-id");
        const editBtnId = event.target.getAttribute('data-edit-btn-id');

        const section = document.getElementById(sectionId);
        const form = document.getElementById(formId);

        toggleVisibility(section, form);
        document.getElementById(backBtnId).addEventListener("click", () => goBack(section, form));

        document.getElementById(editBtnId).setAttribute('data-edit-id', editId);

        // ✅ Dynamically Call the Right Function
        const loadFunctions = {
            video: loadEditVideoData,
            article: loadEditArticleData,
            users: loadEditUserData,
            categories: loadEditCategoryData,
            stories: loadEditStoryData,
            subscriptions: loadEditSubscriptionData,
            coupons: loadEditCouponData,
            banners: loadEditBannerData
        };

        if (loadFunctions[sectionId]) {
            await loadFunctions[sectionId](editId);
        }
    });

    // ✅ Handle File Previews (Image & Video)
    document.body.addEventListener("change", (event) => {
        const fileInput = event.target;
        if (!fileInput || !fileInput.files.length) return;

        const previewIdMap = {
            "thumbnail_": "thumbnailPreview",
            "image": "thumbnailPreview",
            "image_": "thumbnailPreview",
            "_image": "thumbnailPreview",
            "bannerLink_": "thumbnailPreview"
        };

        if (previewIdMap[fileInput.id]) {
            const preview = document.getElementById(previewIdMap[fileInput.id]);
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = "block";
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    });

    // ✅ Handle Video Preview
    document.body.addEventListener("change", (event) => {
        if (event.target.id !== "video_") return;
        const file = event.target.files[0];
        if (!file) return;

        const allowedFormats = ["video/mp4", "video/webm", "video/ogg"];
        if (!allowedFormats.includes(file.type)) {
            alert("Unsupported video format! Use MP4, WebM, or Ogg.");
            return;
        }

        const blobUrl = URL.createObjectURL(file);
        const videoPreview = document.getElementById("videoPreview");
        updateVideoPreview(blobUrl);

        videoPreview.onloadeddata = () => setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    });

    // ✅ Handle Video URL Input
    document.body.addEventListener("input", (event) => {
        if (event.target.id === "video-url_") {
            let url = event.target.value.trim();
            if (url && isYouTubeUrl(url)) updateVideoPreview(url);
        }
    });
});
document.getElementById('admin-profile-link').addEventListener('click', () => {
    const target = document.getElementById('admin-profile-link').getAttribute('data-target');
    if (target) {
        const sidebarLink = document.querySelector(target);
        if (sidebarLink) {
            sidebarLink.click();
        };
    }
});

// ✅ Function to Convert ISO Date to YYYY-MM-DD Format (Day, Month, Year)
function formatDate(isoDate) {
    const date = new Date(isoDate);

    const day = date.getUTCDate().toString().padStart(2, "0"); // Day (01-31)
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Month (01-12)
    const year = date.getUTCFullYear(); // Year (YYYY)

    return { day, month, year };
};
// ✅ Function to Fetch & Populate Form Data
async function fetchAndPopulate(url, mapping) {
    try {
        const res = await fetch(url, { credentials: "include", });
        if (!res.ok) throw new Error("Failed to fetch data");

        const data = await res.json();

        if (!data || !data[mapping.key]) throw new Error("Data not found");
        const entity = data[mapping.key];

        Object.keys(mapping.fields).forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (field) {
                const value = entity[mapping.fields[fieldId]];

                // ✅ Check if the field is a Date field and format it
                if (field.type === "date" && value) {
                    const { year, month, day } = formatDate(value);
                    field.value = `${year}-${month}-${day}`; // Set formatted YYYY-MM-DD
                } else {
                    field.value = value || "";
                }
            }
        });

        if (mapping.imageField && entity[mapping.imageField]) {
            const preview = document.getElementById("thumbnailPreview");
            preview.src = entity[mapping.imageField];
            preview.style.display = "block";
        }

        if (mapping.selectField && entity[mapping.selectField]) {
            const select = document.getElementById(mapping.selectField);
            select.value = entity[mapping.selectField] || "Active";
        }

        if (mapping.selectedType && entity[mapping.selectedType.replace(/_/g, "")]) {
            const select = document.getElementById(mapping.selectedType);
            select.value = entity[mapping.selectedType.replace(/_/g, "")] || "percentage";
        }
    } catch (error) {
        console.error(`Error loading ${mapping.key} data:`, error.message);
    }
};

const loadEditArticleData = (articleId) =>
    fetchAndPopulate(`/api/admin-articles/${articleId}?r=admin`, {
        key: "data",
        fields: {
            "title": "title",
            "content": "description"
        },
        imageField: "imageUrl"
    });
const loadEditUserData = (userId) =>
    fetchAndPopulate(`/api/admin-users/${userId}?r=admin`, {
        key: "data",
        fields: {
            "name": "name",
            "email": "email",
            "mobileNumber": "mobileNumber",
            "status": "status"
        }
    });
const loadEditCategoryData = (categoryId) =>
    fetchAndPopulate(`/api/categories/${categoryId}?r=admin`, {
        key: "data",
        fields: {
            "name_": "name",
            "status_": "status"
        },
        imageField: "imageUrl"
    });
const loadEditSubscriptionData = (subscriptionId) =>
    fetchAndPopulate(`/api/subscription-plans/${subscriptionId}?r=admin`, {
        key: "data",
        fields: {
            "planName_": "name",
            "planType_": "duration",
            "planPrice_": "price",
            "planFeatures_": "features"
        },
        selectField: "status"
    });
const loadEditCouponData = (couponId) =>
    fetchAndPopulate(`/api/coupons/${couponId}?r=admin`, {
        key: "data",
        fields: {
            "couponCode_": "code",
            "expirationDate_": "expiryDate",
            "discount_": "discount"
        },
        selectField: "status",
        selectedType: "type_",
    });
// ✅ Function to Load Video Data
const loadEditVideoData = async (videoId) => {
    try {
        const res = await fetchData(`/api/videos/admin/${videoId}?r=admin`);
        if (!res) return;

        const video = res.data;

        // ✅ Populate Title & Description
        document.getElementById("title_").value = video.title || "";
        document.getElementById("_description").value = video.description || "";

        // ✅ Populate Category (Ensuring it exists in select options)
        const categorySelect = document.getElementById("category_");
        if ([...categorySelect.options].some(opt => opt.value === video.category._id)) {
            categorySelect.value = video.category._id;
        } else {
            // ✅ If category does not exist, add it dynamically
            categorySelect.innerHTML += `<option value="${video.category._id}" selected>${video.category.name}</option>`;
        }

        // ✅ Show Existing Thumbnail (If Available)
        const thumbnailPreview = document.getElementById("thumbnailPreview");
        if (video.thumbnailUrl) {
            thumbnailPreview.src = video.thumbnailUrl;
            thumbnailPreview.style.display = "block";
        } else {
            thumbnailPreview.style.display = "none";
        }

        // ✅ Handle Video Preview (File or URL)
        const videoPreview = document.getElementById("videoPreview");
        if (video.videoUrl) {
            videoPreview.src = video.videoUrl;
            videoPreview.style.display = "block";
        } else {
            videoPreview.src = "";
            videoPreview.style.display = "none";
        }
    } catch (error) {
        console.error("Error loading video data:", error.message);
    }
};
// ✅ Function to Load Story Data
const loadEditStoryData = async (storyId) => {
    try {
        const res = await fetchData(`/api/admin-stories/${storyId}?r=admin`);
        if (!res) return;

        const story = res.data;

        // ✅ Populate Title & Caption
        document.getElementById("_story-title").value = story.title || "";
        document.getElementById("_caption").value = story.caption || "";

        // ✅ Show Existing Story Image
        const thumbnailPreview = document.getElementById("thumbnailPreview");
        if (story.imageUrl) {
            thumbnailPreview.src = story.imageUrl;
            thumbnailPreview.style.display = "block";
        } else {
            thumbnailPreview.style.display = "none";
        }
    } catch (error) {
        console.error("Error loading story data:", error.message);
    }
};
// ✅ Function to Load Banner Data
const loadEditBannerData = async (bannerId) => {
    try {
        const res = await fetchData(`/api/banners/${bannerId}?r=admin`);
        if (!res) return;

        const banner = res.data;

        document.getElementById('name_').value = banner.name;

        // ✅ Show Existing Banner Image
        const bannerPreview = document.getElementById("thumbnailPreview");
        if (banner.imageUrl) {
            bannerPreview.src = banner.imageUrl;
            bannerPreview.style.display = "block";
        } else {
            bannerPreview.style.display = "none";
        }

        // ✅ Set Status
        const statusSelect = document.getElementById("bannerStatus_");
        statusSelect.value = banner.status || "Active";
    } catch (error) {
        console.error("Error loading banner data:", error.message);
    }
};

// ✅ Function to Update Video Preview
function updateVideoPreview(videoUrl) {
    if (videoUrl) {
        const videoPreview = document.getElementById("videoPreview");
        videoPreview.src = videoUrl;
    }
};
// ✅ Function to Check if URL is a YouTube Link
function isYouTubeUrl(url) {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    return youtubeRegex.test(url);
};
// generate unique id
function generateUniqueId(prefix = 'btn') {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${randomNum}`;
};
// function to handle admin logout
async function adminLogout() {
    try {
        const response = await fetch(`/api/admin/logout?r=admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
        });

        if (response.ok) {
            window.location.href = `/admin`;
        } else {
            console.error('Failed to log out:', response.statusText);
        };
    } catch (error) {
        console.error('Error logging out:', error);
    };
};

// Function to load user data and display it in the table
async function loadUserData(page = 1, limit = 10) {
    const data = await fetchData(`/api/admin-users?r=admin`);
    if (!data) return;

    const tbody = document.getElementById('t-body');
    tbody.innerHTML = '';

    data.data.forEach(user => {
        const tr = document.createElement('tr');
        tr.setAttribute('class', 'user_row');

        const capitalizeFirstLetter = (string) => {
            if (typeof string !== 'string' || string.length === 0) return '';
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        };
        const capitalizedStatus = capitalizeFirstLetter(user.status || 'active');
        const userStatus = [
            'Active', 'Inactive'
        ].includes(capitalizedStatus) ? capitalizedStatus : 'Active';

        const userArr = [
            user.name,
            user.email,
            user.mobileNumber,
            userStatus,
        ];

        userArr.forEach(info => {
            const td = document.createElement('td');
            td.innerText = info;
            tr.appendChild(td);
        });

        const tdActions = document.createElement('td');
        const div = document.createElement('div');
        div.setAttribute('class', 'btn-group');

        ['Edit', 'Delete'].forEach(action => {
            const button = document.createElement('button');
            button.innerText = action;
            button.setAttribute('data-id', user._id);

            if (action === 'Edit') {
                button.setAttribute('data-section-id', 'users');
                button.setAttribute('data-form-id', 'edit_user');
                button.setAttribute('data-back-btn-id', 'back-btn-user_');
                button.setAttribute('data-edit-btn-id', 'edit-user__');
            } else {
                button.addEventListener("click", () => showDeletePopup(user._id, 'user'));
            }

            // ✅ Fix: Use classList.add() instead of setAttribute()
            button.classList.add('btn', 'btn-sm', action === 'Edit' ? 'btn-success' : 'btn-danger', 'edit-class');

            div.appendChild(button);
        });


        tdActions.appendChild(div);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
};
// funtion to load video data and display it on video section
async function loadVideoData(page = 1, limit = 12) {
    const data = await fetchData(`/api/videos/admin?r=admin`);
    if (!data) return;

    const videoRow = document.getElementById('video-row');
    const fragment = document.createDocumentFragment();
    videoRow.innerHTML = '';

    data.data.forEach(video => {
        // Create elements
        const colDiv = document.createElement('div');
        const cardDiv = document.createElement('div');
        const img = document.createElement('img');
        const cardBody = document.createElement('div');
        const h5 = document.createElement('h5');
        const btnDiv = document.createElement('div');
        const editBtn = document.createElement('button');
        const deleteBtn = document.createElement('button');

        // Set classes and attributes
        colDiv.classList.add('col-12', 'col-sm-4', 'col-md-4', 'col-lg-3', 'mb-4');
        cardDiv.classList.add('card');
        img.classList.add('img-fluid', 'rounded-top');
        img.setAttribute('alt', 'Video Thumbnail');
        img.src = video.thumbnailUrl;
        cardBody.classList.add('card-body');
        h5.classList.add('card-title', 'mb-3');
        h5.innerText = video.title;
        btnDiv.classList.add('btn-group');
        editBtn.classList.add('btn', 'btn-sm', 'btn-success', 'edit-class');
        deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger');

        editBtn.setAttribute('data-id', video._id);
        editBtn.setAttribute('data-section-id', 'video');
        editBtn.setAttribute('data-form-id', 'edit_video');
        editBtn.setAttribute('data-back-btn-id', 'back-btn_');
        editBtn.setAttribute('data-edit-btn-id', 'video-form_');

        deleteBtn.setAttribute('data-id', video._id);
        deleteBtn.addEventListener("click", () => showDeletePopup(video._id, 'video'));
        editBtn.innerText = 'Edit';
        deleteBtn.innerText = 'Delete';

        // Append children
        btnDiv.append(editBtn, deleteBtn);
        cardBody.append(h5, btnDiv);
        cardDiv.append(img, cardBody);
        colDiv.append(cardDiv);
        fragment.append(colDiv);
    });

    // Append all at once
    videoRow.appendChild(fragment);
};
// function to load article data and display it on article section
async function loadArticleData(page = 1, limit = 12) {
    const data = await fetchData(`/api/admin-articles?r=admin`);
    if (!data) return;

    const articleRow = document.getElementById('article-row');
    const fragment = document.createDocumentFragment();
    articleRow.innerHTML = '';

    data.data.forEach(article => {
        // Create elements
        const colDiv = document.createElement('div');
        const articleCard = document.createElement('div');
        const articleImg = document.createElement('img');
        const cardHeader = document.createElement('div');
        const h5 = document.createElement('h5');
        const cardBodyDiv = document.createElement('div');
        const btnDiv = document.createElement('div');
        const editBtn = document.createElement('button');
        const deleteBtn = document.createElement('button');

        // Set classes and attributes
        colDiv.classList.add('col-12', 'col-sm-4', 'col-md-4', 'col-lg-3', 'mb-4');
        articleCard.classList.add('card', 'article-card');
        articleImg.classList.add('img-fluid', 'rounded-top');
        articleImg.src = article.imageUrl;
        articleImg.setAttribute('alt', 'Article Image');
        cardHeader.classList.add('card-header');
        h5.classList.add('card-title');
        h5.innerText = article.title;
        cardBodyDiv.classList.add('card-body');
        btnDiv.classList.add('d-flex');
        editBtn.classList.add('btn', 'btn-sm', 'btn-success', 'me-2', 'article-edit-btn', "edit-class");
        deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger');

        editBtn.setAttribute('data-id', article._id);
        editBtn.setAttribute('data-section-id', 'article');
        editBtn.setAttribute('data-form-id', 'update-article');
        editBtn.setAttribute('data-back-btn-id', 'back-article_btn_');
        editBtn.setAttribute('data-edit-btn-id', 'article-form_');

        deleteBtn.setAttribute('data-id', article._id);
        deleteBtn.addEventListener("click", () => showDeletePopup(article._id, 'article'));
        editBtn.setAttribute('id', generateUniqueId());
        deleteBtn.setAttribute('id', generateUniqueId());
        editBtn.innerText = 'Edit';
        deleteBtn.innerText = 'Delete';

        // Append children
        btnDiv.append(editBtn, deleteBtn);
        cardBodyDiv.append(btnDiv);
        cardHeader.append(h5);
        articleCard.append(articleImg, cardHeader, cardBodyDiv);
        colDiv.append(articleCard);
        fragment.append(colDiv);
    });

    // Append all at once
    articleRow.appendChild(fragment);
};
// function to load story data and display it on story section
async function loadStoryData(page = 1, limit = 12) {
    const data = await fetchData(`/api/admin-stories?r=admin`);
    if (!data) return;

    const storyRow = document.getElementById('story-row');
    const fragment = document.createDocumentFragment();
    storyRow.innerHTML = '';

    if (data.data.length !== 0) {
        data.data.forEach(story => {
            // Create elements
            const colDiv = document.createElement('div');
            const storyCard = document.createElement('div');
            const storyImg = document.createElement('img');
            const storyCardBody = document.createElement('div');
            const h5 = document.createElement('h5');
            const storyBtnDiv = document.createElement('div');
            const storyEditBtn = document.createElement('button');
            const storyDeleteBtn = document.createElement('button');

            // Set classes and attributes
            colDiv.classList.add('col-12', 'col-sm-4', 'col-md-4', 'col-lg-3', 'mb-4');
            storyCard.classList.add('card', 'story_card');
            storyImg.classList.add('img-fluid', 'rounded-top');
            storyImg.setAttribute('alt', 'story-image');
            storyImg.src = story.imageUrl;
            storyCardBody.classList.add('card-body');
            h5.classList.add('card-title', 'mb-3');
            h5.innerText = story.title;
            storyBtnDiv.classList.add('d-flex', 'gap-2');
            storyEditBtn.classList.add('btn', 'btn-success', 'btn-sm', 'edit-class');
            storyDeleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
            storyEditBtn.setAttribute('data-id', story._id);

            storyEditBtn.setAttribute('data-section-id', 'stories');
            storyEditBtn.setAttribute('data-form-id', 'edit_story');
            storyEditBtn.setAttribute('data-back-btn-id', 'back-story-btn_');
            storyEditBtn.setAttribute('data-edit-btn-id', '_edit_story');

            storyDeleteBtn.setAttribute('data-id', story._id);
            storyDeleteBtn.addEventListener("click", () => showDeletePopup(story._id, 'story'));
            storyEditBtn.innerText = 'Edit';
            storyDeleteBtn.innerText = 'Delete';

            // Append children
            storyBtnDiv.append(storyEditBtn, storyDeleteBtn);
            storyCardBody.append(h5, storyBtnDiv);
            storyCard.append(storyImg, storyCardBody);
            colDiv.append(storyCard);
            fragment.append(colDiv);
        });

        // Append all at once
        storyRow.appendChild(fragment);
    };
};
// function to load category data and display it on category section
async function loadCategoryData(page = 1, limit = 12) {
    const data = await fetchData(`/api/categories?r=admin`);
    if (!data) return;

    const categoryRow = document.getElementById('category-row');
    const fragment = document.createDocumentFragment();
    categoryRow.innerHTML = '';

    data.data.forEach(category => {
        // Create elements
        const categoryColDiv = document.createElement('div');
        const categoryCard = document.createElement('div');
        const categoryImg = document.createElement('img');
        const categoryCardBody = document.createElement('div');
        const h5 = document.createElement('h5');
        const categoryBtnDiv = document.createElement('div');
        const categoryEditBtn = document.createElement('button');
        const categoryDeleteBtn = document.createElement('button');

        // Set classes and attributes
        categoryColDiv.classList.add('col-12', 'col-sm-4', 'col-md-4', 'col-lg-3', 'mb-4');
        categoryCard.classList.add('card', 'category-card');
        categoryImg.classList.add('img-fluid', 'rounded-top');
        categoryImg.setAttribute('alt', 'category_img');
        categoryImg.src = category.imageUrl;
        categoryCardBody.classList.add('card-body');
        h5.classList.add('card-title', 'mb-3');
        h5.innerText = category.name;
        categoryBtnDiv.classList.add('d-flex', 'gap-2');
        categoryEditBtn.classList.add('btn', 'btn-success', 'btn-sm', 'edit-class');
        categoryDeleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');

        categoryEditBtn.setAttribute('data-id', category._id);
        categoryEditBtn.setAttribute('data-section-id', 'categories');
        categoryEditBtn.setAttribute('data-form-id', 'edit_category');
        categoryEditBtn.setAttribute('data-back-btn-id', 'category-back-btn_');
        categoryEditBtn.setAttribute('data-edit-btn-id', 'categoryForm_');

        categoryDeleteBtn.setAttribute('data-id', category._id);
        categoryDeleteBtn.addEventListener("click", () => showDeletePopup(category._id, 'category'));
        categoryEditBtn.innerText = 'Edit';
        categoryDeleteBtn.innerText = 'Delete';

        // Append children
        categoryBtnDiv.append(categoryEditBtn, categoryDeleteBtn);
        categoryCardBody.append(h5, categoryBtnDiv);
        categoryCard.append(categoryImg, categoryCardBody);
        categoryColDiv.append(categoryCard);
        fragment.append(categoryColDiv);

    });

    // Append all at once
    categoryRow.appendChild(fragment);
};
// function to laod subscription data and display it on subscription section
async function loadSubscriptionData() {
    const data = await fetchData(`/api/subscription-plans?r=admin`);
    if (!data) return;

    const tableBody = document.getElementById('planTableBody');
    // Clear existing content
    tableBody.innerHTML = '';

    // Iterate over the plans array and create table rows
    data.data.forEach((plan) => {
        const row = document.createElement('tr');

        // Create cells for each field in the plan
        const planNameCell = document.createElement('td');
        planNameCell.textContent = plan.name;

        const planTypeCell = document.createElement('td');
        planTypeCell.textContent = plan.duration;

        const priceCell = document.createElement('td');
        priceCell.textContent = plan.price;

        const featuresCell = document.createElement('td');
        const featuresList = document.createElement('ul');
        featuresList.className = "list-unstyled";
        plan.features.forEach(feature => {
            const featureItem = document.createElement('li');
            featureItem.textContent = `✔ ${feature}`;
            featuresList.appendChild(featureItem);
        });
        featuresCell.appendChild(featuresList);

        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        const statusText = plan.status.charAt(0).toUpperCase() + plan.status.slice(1);
        statusBadge.className = statusText === 'Active' ? 'badge bg-success' : 'badge bg-danger';
        statusBadge.textContent = statusText;
        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement('td');
        const actionDiv = document.createElement('div');
        actionDiv.className = "d-flex justify-content-start";
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-secondary btn-sm me-2 edit-class';
        editButton.textContent = 'Edit';
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = 'Delete';
        editButton.setAttribute('data-id', plan._id);

        editButton.setAttribute('data-section-id', 'subscriptions');
        editButton.setAttribute('data-form-id', 'edit_subscription');
        editButton.setAttribute('data-back-btn-id', 'back-subscription-btn_');
        editButton.setAttribute('data-edit-btn-id', 'edit_subscription_');

        deleteButton.setAttribute('data-id', plan._id);
        deleteButton.addEventListener("click", () => showDeletePopup(plan._id, 'subscription'));
        actionDiv.appendChild(editButton);
        actionDiv.appendChild(deleteButton);
        actionCell.appendChild(actionDiv);

        // Append all cells to the row
        row.appendChild(planNameCell);
        row.appendChild(planTypeCell);
        row.appendChild(priceCell);
        row.appendChild(featuresCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        // Append the row to the table body
        tableBody.appendChild(row);
    });
};
// function to load coupon data and display it on coupon section
async function loadCouponData() {
    const data = await fetchData(`/api/coupons?r=admin`);
    if (!data) return;

    const tableBody = document.getElementById('couponTableBody');
    tableBody.innerHTML = '';

    data.data.forEach(coupon => {
        const date = new Date(coupon.expiryDate);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const row = document.createElement('tr');

        // Code
        const codeCell = document.createElement('td');
        codeCell.textContent = coupon.code;

        // Expiry Date
        const dateCell = document.createElement('td');
        dateCell.textContent = `${day}/${month}/${year}`;

        // Status
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `badge bg-${coupon.status === 'active' ? 'success' : 'danger'}`;
        statusBadge.textContent = coupon.status;
        statusCell.appendChild(statusBadge);

        // Actions
        const actionCell = document.createElement('td');
        const actionDiv = document.createElement('div');
        actionDiv.className = "d-flex justify-content-start";

        const editButton = document.createElement('button');
        editButton.className = "btn btn-secondary btn-sm me-2 edit-class";
        editButton.textContent = "Edit";
        editButton.setAttribute('data-id', coupon._id);
        editButton.setAttribute('data-section-id', 'coupons');
        editButton.setAttribute('data-form-id', 'edit-coupon');
        editButton.setAttribute('data-back-btn-id', 'back-coupon-btn_');
        editButton.setAttribute('data-edit-btn-id', 'couponForm_');

        const deleteButton = document.createElement('button');
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute('data-id', coupon._id);
        deleteButton.addEventListener("click", () => showDeletePopup(coupon._id, 'coupon'));

        actionDiv.appendChild(editButton);
        actionDiv.appendChild(deleteButton);
        actionCell.appendChild(actionDiv);

        // Append all cells
        row.appendChild(codeCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
};
// function to load the banner data and display it on banner section
async function loadBannerData(page = 1, limit = 12) {
    const data = await fetchData(`/api/banners?r=admin`);
    if (!data) return;

    const container = document.getElementById('banners-container');
    container.innerHTML = '';

    let rowDiv = document.createElement('div');
    rowDiv.className = "row";

    data.data.forEach((banner, index) => {
        const colDiv = document.createElement('div');
        colDiv.className = "col-md-4 mb-3";

        const cardDiv = document.createElement('div');
        cardDiv.className = "card";

        const img = document.createElement('img');
        img.src = banner.imageUrl;
        img.alt = "banner img";
        img.className = "img-fluid rounded";

        const cardBody = document.createElement('div');
        cardBody.className = "card-body";

        const editButton = document.createElement('button');
        editButton.className = "btn btn-success btn-sm me-1 edit-class";
        editButton.textContent = "Edit";
        editButton.setAttribute('data-id', banner._id);
        editButton.setAttribute('data-section-id', 'banners');
        editButton.setAttribute('data-form-id', 'edit_banner');
        editButton.setAttribute('data-back-btn-id', 'back-bnner-btn_');
        editButton.setAttribute('data-edit-btn-id', 'bannerForm_');

        const deleteButton = document.createElement('button');
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute('data-id', banner._id);
        deleteButton.addEventListener("click", () => showDeletePopup(banner._id, 'banner'));

        cardBody.appendChild(editButton);
        cardBody.appendChild(deleteButton);

        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBody);
        colDiv.appendChild(cardDiv);
        rowDiv.appendChild(colDiv);

        // Every 3 banners, start a new row
        if ((index + 1) % 3 === 0) {
            container.appendChild(rowDiv);
            rowDiv = document.createElement('div');
            rowDiv.className = "row";
        }
    });

    // Append any remaining
    if (rowDiv.children.length > 0) {
        container.appendChild(rowDiv);
    }
};
// function to load the category option and display it on video cateogory option
async function loadCategoryOption() {
    const data = await fetchData(`/api/categories?r=admin`);
    if (!data) return;

    const selectElement = document.querySelector('.category_option');

    data.data.forEach(category => {
        const option = document.createElement('option');
        option.value = category._id;
        option.innerHTML = `${category.name}`;
        option.setAttribute('class', 'category-option');
        selectElement.appendChild(option);
    });
};
// function to load the setting data and display it on setting sections
function populateFormFields(settings) {
    settings.forEach(setting => {
        const { key, value } = setting;

        const input = document.getElementById(key);
        if (input) {
            input.value = value;
        } else {
            console.warn(`No input found with id "${key}"`);
        }
    });
};
// Function to update DOM elements with fetched data
async function updateDashboardElement(url, Data) {
    const data = await fetchData(url);
    if (!data) return;

    for ([key, value] of Object.entries(Data)) {
        const element = document.getElementById(key);
        element.innerText = data.data[value];
    };
};
// function to laod the admin profile data and display it on admin profile section
async function laodAdminProfileData() {
    const data = await fetchData(`/api/admin/profile?r=admin`);
    if (!data) return;
    document.getElementById('name').value = data.data.name;
    document.getElementById('admin_email').value = data.data.email;
    document.getElementById('profileImage').src = data.data.imageUrl;
    document.getElementById('admin-profile-icon').src = data.data.imageUrl;
};
// function to load the terms and condition data
async function loadTermsData() {
    const data = await fetchData(`/api/terms?r=admin`);
    if (!data) return;
    document.getElementById('termsText').value = data.data.content;
};

// **** API calling ****

// Function to make a fetch request
async function fetchData(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 401) {
            window.location.href = `/admin`;
        }

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        };

        return await response.json();
    } catch (error) {
        console.error('Fetch error: ', error);
    };
};
// setting submission 
async function submitSettingForm(form, url, sendAsJsonArray = false) {
    const formData = new FormData(form);
    const options = {
        method: 'POST',
        credentials: 'include',
        body: sendAsJsonArray
            ? JSON.stringify(
                Array.from(formData.entries()).map(([key, value]) => ({ key, value }))
            )
            : formData,
        headers: sendAsJsonArray
            ? { 'Content-Type': 'application/json' }
            : undefined,
    };

    try {
        const response = await fetch(url, options);
        if (response.status === 401) {
            return (window.location.href = '/admin');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();
        saveSettings();
    } catch (error) {
        console.error('Error submitting form:', error);
        showModalWithMessage(error.message);
    }
};
// function to fetch the setting data frome db
async function fetchSettingData() {
    try {
        const response = await fetch(`/api/settings?r=admin`, {
            credentials: 'include',
        });

        if (response.status === 401) {
            window.location.href = '/admin';
            return;
        }

        const { data } = await response.json();
        populateFormFields(data);
    } catch (error) {
        console.error('Error loading settings:', error);
    }
};
// ✅ Dynamic API Call Function
async function apiCall({ url, method = "GET", data = null, headers = {} }) {
    try {
        const options = {
            method,
            headers: { "Content-Type": "application/json", ...headers },
            credentials: "include",
        };

        if (data) options.body = JSON.stringify(data);

        const response = await fetch(url, options);
        const result = await response.json();

        if (response.status === 401) {
            window.location.href = `/admin`;
        }

        return result;
    } catch (error) {
        return error.message;
    }
};
// 📌 Function to Handle API Errors
function handleApiError(data) {
    console.error("Error:", data); // Log full error details
    let errorMessage = "Something went wrong!";
    if (data.errors && data.errors.length > 0) {
        errorMessage = `⚠️ ${data.errors[0].msg}`; // Show only first error message
    } else if (data.message) {
        errorMessage = data.message;
    }
    showModalWithMessage(errorMessage, "error");
};
// ✅ Handle Form Submission (text + files)
async function handleFormSubmission(
    form, url, processBtnId, submitBtnId, dataLoadCallback,
    method, uploadImage, uploadVideo
) {
    try {
        toggleProcessBtn(submitBtnId, processBtnId, true);

        // ✅ Collect text fields only
        const formDataObj = {};
        new FormData(form).forEach((value, key) => {
            const inputEl = form.querySelector(`[name="${key}"]`);
            if (inputEl && inputEl.type !== "file") {
                if (key === "features") {
                    // agar already hai to push karo, warna new array banao
                    if (!formDataObj.features) {
                        formDataObj.features = [];
                    }
                    formDataObj.features.push(value);
                } else {
                    formDataObj[key] = value;
                }
            }
        });

        // ✅ Get dynamic data_collection from any input in form
        const collectionInput = form.querySelector("[data-collection]");
        if (collectionInput) {
            formDataObj["data_collection"] = collectionInput.dataset.collection;
        }

        // ✅ Submit text fields first
        const response = await fetch(url, {
            method,
            body: JSON.stringify(formDataObj),
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const data = await response.json();
        if (response.status === 401) window.location.href = `/admin`;

        if (response.ok) {
            const collectionName = formDataObj["data_collection"];
            const documentId = data.data._id;

            if (method === "PUT" && (uploadImage || uploadVideo)) {
                const hasNewImage = form.querySelector("input[type='file'][name='imageUrl']")?.files.length > 0;
                const hasNewVideo = form.querySelector("input[type='file'][name='videoUrl']")?.files.length > 0;
                const hasNewThumbnail = form.querySelector("input[type='file'][name='thumbnailUrl']")?.files.length > 0;

                // ✅ Extract old publicIds safely
                const oldPublicIds = {
                    image: data?.data?.publicId || null,
                    thumbnail: data?.data?.thumbnailPublicId || null,
                    video: data?.data?.videoPublicId || null,
                };

                // ✅ Delete only if new file uploaded AND old exists
                if (hasNewImage && oldPublicIds.image) {
                    await deleteMedia(oldPublicIds.image, "image");
                    console.log("Old image deleted");
                }

                if (hasNewVideo && oldPublicIds.video) {
                    await deleteMedia(oldPublicIds.video, "video");
                    console.log("Old video deleted");
                }

                if (hasNewThumbnail && oldPublicIds.thumbnail) {
                    // If thumbnails are always tied to video, keep "image" if backend expects it
                    await deleteMedia(oldPublicIds.thumbnail, "image");
                    console.log("Old thumbnail deleted");
                }
            };

            // ✅ Upload image if required
            if (uploadImage) {
                const imageInput = form.querySelector(`input[type="file"][name="imageUrl"]`);
                if (imageInput?.files?.length) {
                    await handleFileUpload(
                        imageInput.files[0],
                        "image",
                        documentId,
                        collectionName
                    );
                }
            };

            // ✅ Upload video + thumbnail if required
            if (uploadVideo) {
                const videoInput = form.querySelector(`input[type="file"][name="videoUrl"]`);
                const thumbInput = form.querySelector(`input[type="file"][name="thumbnailUrl"]`);

                if (videoInput?.files?.length) {
                    const videoFile = videoInput.files[0];
                    const thumbFile = thumbInput?.files?.length ? thumbInput.files[0] : null;

                    await handleFileUpload(
                        videoFile,
                        "video",
                        documentId,
                        collectionName,
                        null,
                        thumbFile // pass thumbnail file also
                    );
                }
            };

            showModalWithMessage(data.message);
            form.reset();
            if (typeof dataLoadCallback === "function") dataLoadCallback();
        } else {
            handleApiError(data);
        }
    } catch (error) {
        console.error("❌ Form Error:", error);
        showModalWithMessage(error.message || "An unexpected error occurred.");
    } finally {
        toggleProcessBtn(submitBtnId, processBtnId, false);
    }
};
// ✅ Handle File Upload (Image or Video)
async function handleFileUpload(file, type = "image", documentId, collectionName, imageField = null, thumbFile = null) {
    try {
        // Upload main file (image or video)
        const uploadUrl = type === "image"
            ? "/api/upload/image?r=admin"
            : "/api/upload/video?r=admin";

        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        if (!uploadResponse.ok) throw new Error("File upload failed");
        const uploadedData = await uploadResponse.json();

        console.log(`✅ ${type} Uploaded:`, uploadedData);

        // ✅ Build metadata
        const metadata = {
            document_id: documentId,
            collection_name: collectionName,
            type
        };

        if (type === "image") {
            metadata.secure_url = uploadedData.data.url;
            metadata.public_id = uploadedData.data.public_id;
        }

        if (type === "video") {
            metadata.secure_url = uploadedData.data.url;
            metadata.public_id = uploadedData.data.public_id;

            // If thumbnail is provided, upload it also
            if (thumbFile) {
                const thumbForm = new FormData();
                thumbForm.append("file", thumbFile);

                const thumbResponse = await fetch("/api/upload/image?r=admin", {
                    method: "POST",
                    body: thumbForm,
                    credentials: "include",
                });

                if (!thumbResponse.ok) throw new Error("Thumbnail upload failed");
                const thumbData = await thumbResponse.json();

                metadata.thumbnail_url = thumbData.data.url;
                metadata.thumbnail_public_id = thumbData.data.public_id;
            }
        }

        return await submitUploadData(metadata);
    } catch (error) {
        console.error(`❌ ${type} Upload Error:`, error.message);
        showModalWithMessage(error.message || `Failed to upload ${type}`);
        return null;
    }
};
// ✅ Save Upload Metadata to Backend
async function submitUploadData(data) {
    try {
        const response = await fetch("/api/upload/save?r=admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to save upload data");

        const result = await response.json();
        console.log("✅ Upload Data Saved:", result);
        return result;
    } catch (error) {
        console.error("❌ Metadata Save Error:", error.message);
        return null;
    }
};
// ✅ delete image or video
async function deleteMedia(public_id, type) {
    if (!public_id) return; // skip if no public_id

    try {
        const response = await apiCall({
            url: "/api/upload/media?r=admin",
            method: "DELETE",
            data: { public_id, type }
        });

        console.log(`✅ ${type} deleted:`);
        return response;
    } catch (error) {
        console.error("❌ Error deleting media:", error);
        throw error;
    }
};

// Initialize data loading
const functionMappings = {
    '#t-body': loadUserData,
    '#video-row': loadVideoData,
    '#article-row': loadArticleData,
    '#story-row': loadStoryData,
    '#category-row': loadCategoryData,
    '#planTableBody': loadSubscriptionData,
    '#couponTableBody': loadCouponData,
    '#banners-container': loadBannerData,
    '#settings': fetchSettingData,
    '#video-form': loadCategoryOption,
    '#admin_profile': laodAdminProfileData,
    '#termsText': loadTermsData,
};
// Function to execute only for existing elements
const executeIfElementExists = () => {
    Object.keys(functionMappings).forEach(id => {
        if (document.querySelector(id)) {
            functionMappings[id](); // Call the function
        }
    });
};
// get data
const url = `/api/dashboard/summary?r=admin`;
const Data = {
    "total_user": "totalUsers",
    "total_video": "totalVideos",
    "total_category": "totalCategories",
    "total_like": "totalLikes",
    "total_comment": "totalComments",
    "total_articles": "totalArticles",
    "total_subscribers": "totalSubscribers",
    "total_amount": "totalAmount",
};
// update dashboard element
if (document.getElementById('dashboard')) {
    updateDashboardElement(url, Data);
};
// call function and load the data
executeIfElementExists();

// Reusable function to toggle visibility
function toggleVisibility(hideElement, showElement) {
    hideElement.classList.add('d-none');
    hideElement.classList.remove('d-block');

    showElement.classList.remove('d-none');
    showElement.classList.add('d-block');
};
// Reusable function to go back to the previous section
function goBack(showElement, hideElement) {
    hideElement.classList.remove('d-block');
    hideElement.classList.add('d-none');

    showElement.classList.remove('d-none');
    showElement.classList.add('d-block');
};
// back and toggle event listeners
function doesElementExist(selector) {
    const element = document.querySelector(selector);
    return element !== null;
};

// Video Section
if (doesElementExist('#video')) {
    const videoSection = document.getElementById('video');
    const addNewVideoPage = document.getElementById('new_video');
    document.getElementById('add-new-video').addEventListener('click', () => toggleVisibility(videoSection, addNewVideoPage));
    document.getElementById('back-btn').addEventListener('click', () => goBack(videoSection, addNewVideoPage));
};
// Article Section
if (doesElementExist('#article')) {
    const article = document.getElementById('article');
    const addNewArticle = document.getElementById('new_article');
    if (doesElementExist('#add-new-article') || doesElementExist('#back-article_btn')) {
        document.getElementById('add-new-article').addEventListener('click', () => toggleVisibility(article, addNewArticle));
        document.getElementById('back-article_btn').addEventListener('click', () => goBack(article, addNewArticle));
    }
};
// User Section
if (doesElementExist('#users')) {
    const users = document.getElementById('users');
    const newUser = document.getElementById('new_user');
    document.getElementById('add-new-user').addEventListener('click', () => toggleVisibility(users, newUser));
    document.getElementById('back-btn-user').addEventListener('click', () => goBack(users, newUser));
};
// Story Section
if (doesElementExist('#stories')) {
    const story = document.getElementById('stories');
    const newStory = document.getElementById('new_story');
    document.getElementById('story-btn').addEventListener('click', () => toggleVisibility(story, newStory));
    document.getElementById('back-story-btn').addEventListener('click', () => goBack(story, newStory));
};
// Category Section
if (doesElementExist('#categories')) {
    const category = document.getElementById('categories');
    const newCategory = document.getElementById('new_category');
    document.getElementById('category-btn').addEventListener('click', () => toggleVisibility(category, newCategory));
    document.getElementById('category-back-btn').addEventListener('click', () => goBack(category, newCategory));
};
// subscription plan section 
if (doesElementExist('#subscriptions')) {
    const subscription = document.getElementById('subscriptions');
    const newSubscription = document.getElementById('new_subscription');
    document.getElementById('subscription-btn').addEventListener('click', () => toggleVisibility(subscription, newSubscription));
    document.getElementById('back-subscription-btn').addEventListener('click', () => goBack(subscription, newSubscription));
};
// coupon plan section 
if (doesElementExist('#coupons')) {
    const coupon = document.getElementById('coupons');
    const newCoupon = document.getElementById('new-coupon');
    document.getElementById('coupon-btn').addEventListener('click', () => toggleVisibility(coupon, newCoupon));
    document.getElementById('back-coupon-btn').addEventListener('click', () => goBack(coupon, newCoupon));
};
// banner section 
if (doesElementExist('#banners')) {
    const banner = document.getElementById('banners');
    const newBanner = document.getElementById('add-new_banner');
    document.getElementById('banner-btn').addEventListener('click', () => toggleVisibility(banner, newBanner));
    document.getElementById('back-bnner-btn').addEventListener('click', () => goBack(banner, newBanner));
};
// profile section
if (doesElementExist('#admin_profile')) {
    const adminProfile = document.getElementById('admin_profile');
    const dashboard = document.getElementById('dashboard');
    document.getElementById('back-profile-btn').addEventListener('click', () => toggleVisibility(adminProfile, dashboard));
    document.getElementById('back-profile-btn').addEventListener('click', () => {
        document.getElementById('nav-bar_').innerText = 'Dashboard';
    });
};

function showModalWithMessage(message) {
    document.getElementById('modalMessage').textContent = message;
    successModal.show();
};
// Function to toggle between loading and submit button
function toggleProcessBtn(submitBtnId, processBtnId, isLoading) {
    const submitBtn = document.getElementById(submitBtnId);
    const processBtn = document.getElementById(processBtnId);

    if (isLoading) {
        submitBtn.classList.add('d-none');
        processBtn.classList.remove('d-none');
    } else {
        submitBtn.classList.remove('d-none');
        processBtn.classList.add('d-none');
    };
};

// Event listeners for form submissions
if (doesElementExist('#video-form')) {
    document.querySelector("#video-form").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/videos/admin?r=admin",
            'video-process-btn',
            'add-video-btn',
            loadVideoData,
            'POST',
            true,
            true,
        );
    });
};
if (doesElementExist('#article-form')) {
    document.querySelector("#article-form").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/admin-articles?r=admin",
            'process-btn',
            'article__btn',
            loadArticleData,
            'POST',
            true,
            false,
        );
    });
};
if (doesElementExist('#adduser__')) {
    document.querySelector("#adduser__").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/admin-users?r=admin",
            'user-process-btn',
            'add_user_btn',
            loadUserData,
            'POST',
            false,
            false,
        );
    });
};
if (doesElementExist('#categoryForm')) {
    document.querySelector("#categoryForm").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/categories?r=admin",
            'category-process-btn',
            'add-category-btn',
            loadCategoryData,
            'POST',
            true,
            false,
        );
    });
};
if (doesElementExist('#addNew_story')) {
    document.querySelector("#addNew_story").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/admin-stories?r=admin",
            'story-process-btn',
            'addNew_story-btn',
            loadStoryData,
            'POST',
            true,
            false,
        );
    });
};
if (doesElementExist('#add-new_subscription')) {
    document.querySelector("#add-new_subscription").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/subscription-plans?r=admin",
            'subscription-process-btn',
            'addNew_subscription-btn',
            loadSubscriptionData,
            'POST',
            false,
            false,
        );
    });
};
if (doesElementExist('#couponForm')) {
    document.querySelector("#couponForm").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/coupons?r=admin",
            'coupon-process-btn',
            'add-new-coupon-btn',
            loadCouponData,
            'POST',
            false,
            false,
        );
    });
};
if (doesElementExist('#bannerForm')) {
    document.querySelector("#bannerForm").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/banners?r=admin",
            'banner-process-btn',
            'add_new-banner-btn',
            loadBannerData,
            'POST',
            true,
            false,
        );
    });
};
if (doesElementExist('#admin_profile_form')) {
    document.querySelector("#admin_profile_form").addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmission(
            e.target,
            "/api/admin/profile?r=admin",
            'profile-process-btn',
            'save-profile',
            laodAdminProfileData,
            'PUT',
            true,
            false,
        );
    });
};

// banner priview and  generate coupon
if (doesElementExist('#bannerLink')) {
    document.getElementById('bannerLink').addEventListener('change', function () {
        const file = this.files[0];
        const bannerPreview = document.getElementById('bannerPreview');

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                bannerPreview.style.backgroundImage = `url(${e.target.result})`;
                bannerPreview.style.backgroundSize = 'cover';
                bannerPreview.style.backgroundPosition = 'center';
                bannerPreview.textContent = '';
            }
            reader.readAsDataURL(file);
        } else {
            bannerPreview.style.backgroundImage = 'none';
            bannerPreview.textContent = 'Banner Preview';
        };
    });
};
if (doesElementExist('#generateCouponBtn')) {
    document.getElementById('generateCouponBtn').addEventListener('click', function () {
        const randomCouponCode = Math.random().toString(36).substr(2, 8).toUpperCase();
        document.getElementById('couponCode').value = randomCouponCode;
    });
};
if (doesElementExist('#generateCouponBtn_')) {
    document.getElementById('generateCouponBtn_').addEventListener('click', function () {
        const randomCouponCode = Math.random().toString(36).substr(2, 8).toUpperCase();
        document.getElementById('couponCode_').value = randomCouponCode;
    });
};

// costom file input url of image select option viva js
if (doesElementExist('.custom-file-input')) {
    document.querySelector(".custom-file-input").addEventListener("change", function () {
        const fileName = this.value.split("\\").pop();
        this.nextElementSibling.classList.add("selected");
        this.nextElementSibling.innerHTML = fileName;
    });
};
uploadMethodRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
        if (document.getElementById("uploadVideo").checked) {
            videoUploadField.style.display = "block";
            videoUrlField.style.display = "none";
        } else {
            videoUploadField.style.display = "none";
            videoUrlField.style.display = "block";
        };
    });
});
// profile image upload of admin
if (doesElementExist('#imageUpload')) {
    document.getElementById("imageUpload").addEventListener("change", function () {
        const file = this.files[0];
        const profileImage = document.getElementById("profileImage");

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        };
    });
};
// admin logout-1
if (doesElementExist('#logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', function (e) {
        e.preventDefault();
        adminLogout();
    });
};
// admin logout-2
if (doesElementExist('#logout-btn-2')) {
    document.getElementById('logout-btn-2').addEventListener('click', function (e) {
        e.preventDefault();
        adminLogout();
    });
};

// event listener for setting form submission
if (doesElementExist('#razorpayForm')) {
    document.getElementById('razorpayForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitSettingForm(
            e.target,
            `/api/settings?r=admin`,
            true,
        );
    });
};
if (doesElementExist('#smtp-form')) {
    document.getElementById('smtp-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitSettingForm(
            e.target,
            `/api/settings?r=admin`,
            true,
        );
    });
};
if (doesElementExist('#socialSettingform')) {
    document.getElementById('socialSettingform').addEventListener('submit', (e) => {
        e.preventDefault();
        submitSettingForm(
            e.target,
            `/api/settings?r=admin`,
            true,
        );
    });
};
if (doesElementExist('#cloudinaryForm')) {
    document.getElementById('cloudinaryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitSettingForm(
            e.target,
            `/api/settings?r=admin`,
            true,
        );
    });
};
if (doesElementExist('#submitTerms')) {
    document.getElementById('submitTerms').addEventListener('click', async () => {
        const termsText = document.getElementById('termsText').value;
        try {
            const response = await fetch('/api/terms?r=admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: termsText }),
            });
            const result = await response.json();

            if (response.ok) {
                showModalWithMessage(result.message);
            } else {
                handleApiError(result.data);
            }
        } catch (err) {
            showModalWithMessage(err.message || 'Api Error');
        }
    });
};

// event listener for update form submission
if (doesElementExist('#video-form_')) {
    document.querySelector("#video-form_").addEventListener("submit", function (e) {
        e.preventDefault();
        const editId = e.target.getAttribute('data-edit-id');
        handleFormSubmission(
            e.target,
            `/api/videos/admin/${editId}?r=admin`,
            'video-process-btn_',
            'edit-video-btn',
            loadVideoData,
            "PUT",
            true,
            true,
        );
    });
};
if (doesElementExist('#article-form_')) {
    document.querySelector("#article-form_").addEventListener("submit", function (e) {
        e.preventDefault();
        const editId = e.target.getAttribute('data-edit-id');
        handleFormSubmission(
            e.target,
            `/api/admin-articles/${editId}?r=admin`,
            'process-btn_',
            'edit-article__btn',
            loadArticleData,
            "PUT",
            true,
            false,
        );
    });
};
if (doesElementExist('#edit-user__')) {
    document.querySelector("#edit-user__").addEventListener("submit", function (e) {
        e.preventDefault();
        const editId = e.target.getAttribute('data-edit-id');
        handleFormSubmission(
            e.target,
            `/api/admin-users/${editId}?r=admin`,
            'user-process-btn_',
            'edit_user_btn',
            loadUserData,
            "PUT",
            false,
            false,
        );
    });
};
if (doesElementExist('#categoryForm_')) {
    document.querySelector("#categoryForm_").addEventListener("submit", function (e) {
        e.preventDefault();
        const editId = e.target.getAttribute('data-edit-id');
        handleFormSubmission(
            e.target,
            `/api/categories/${editId}?r=admin`,
            'category-process-btn_',
            'edit-category-btn',
            loadCategoryData,
            "PUT",
            true,
        );
    });
};
if (doesElementExist('#_edit_story')) {
    document.querySelector("#_edit_story").addEventListener("submit", function (e) {
        e.preventDefault();
        const editId = e.target.getAttribute('data-edit-id');
        handleFormSubmission(
            e.target,
            `/api/admin-stories/${editId}?r=admin`,
            'story-process-btn_',
            'edit_story-btn',
            loadStoryData,
            "PUT",
            true,
            false,
        );
    });
};
if (doesElementExist('#edit_subscription_')) {
    document.querySelector("#edit_subscription_").addEventListener("submit", function (e) {
        e.preventDefault();
        const editId = e.target.getAttribute('data-edit-id');
        handleFormSubmission(
            e.target,
            `/api/subscription-plans/${editId}?r=admin`,
            'subscription-process-btn_',
            'edit_subscription-btn',
            loadSubscriptionData,
            "PUT",
            false,
            false,
        );
    });
};
if (doesElementExist('#couponForm_')) {
    document.querySelector("#couponForm_").addEventListener("submit", function (e) {
        e.preventDefault();
        const editId = e.target.getAttribute('data-edit-id');
        handleFormSubmission(
            e.target,
            `/api/coupons/${editId}?r=admin`,
            'coupon-process-btn_',
            'edit-coupon-btn',
            loadCouponData,
            "PUT",
            false,
            false,
        );
    });
};
if (doesElementExist('#bannerForm_')) {
    document.querySelector("#bannerForm_").addEventListener("submit", function (e) {
        e.preventDefault();
        const editId = e.target.getAttribute('data-edit-id');
        handleFormSubmission(
            e.target,
            `/api/banners/${editId}?r=admin`,
            'banner-process-btn_',
            'edit-banner-btn',
            loadBannerData,
            "PUT",
            true,
            false,
        );
    });
};

// setting notification 
function triggerNotification() {
    const notification = document.getElementById("notification");
    notification.style.display = "block";
    setTimeout(closeNotification, 3000);
};
function closeNotification() {
    const notification = document.getElementById("notification");
    notification.style.display = "none";
};

// Simulating settings save functionality
function saveSettings() {
    triggerNotification();
};
if (doesElementExist('#close-notify-btn')) {
    document.getElementById('close-notify-btn').addEventListener('click', () => {
        closeNotification();
    });
};
function previewThumbnail(event) {
    const input = event.target;
    const previewId =
        input.id === "siteLogo" ? "logo-preview" : "favicon-preview";
    const previewImage = document.getElementById(previewId);

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
        };

        reader.readAsDataURL(input.files[0]);
    } else {
        previewImage.src = "#";
        previewImage.style.display = "none";
    }
};
async function showDeletePopup(itemId, sectionId) {
    const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
    modal.show();

    const deleteText = document.getElementById('delete-text');
    const spinner = document.getElementById('spinner_');
    const confirmBtn = document.getElementById("confirmDeleteBtn");

    confirmBtn.onclick = async () => {
        deleteText.classList.add('d-none');
        spinner.classList.remove('d-none');

        const apiEndpoints = {
            video: `/api/videos/admin/${itemId}?r=admin`,
            article: `/api/admin-articles/${itemId}?r=admin`,
            user: `/api/admin-users/${itemId}?r=admin`,
            category: `/api/categories/${itemId}?r=admin`,
            story: `/api/admin-stories/${itemId}?r=admin`,
            subscription: `/api/subscription-plans/${itemId}?r=admin`,
            coupon: `/api/coupons/${itemId}?r=admin`,
            banner: `/api/banners/${itemId}?r=admin`,
        };

        if (!apiEndpoints[sectionId]) return;

        const data = await apiCall({ url: apiEndpoints[sectionId], method: 'DELETE' });

        if (data?.success) {
            modal.hide();
            const refreshFunctions = {
                video: loadVideoData,
                article: loadArticleData,
                user: loadUserData,
                category: loadCategoryData,
                story: loadStoryData,
                subscription: loadSubscriptionData,
                coupon: loadCouponData,
                banner: loadBannerData
            };
            refreshFunctions[sectionId]?.();
        } else {
            handleApiError(data);
            modal.hide();
        }

        deleteText.classList.remove('d-none');
        spinner.classList.add('d-none');
    };
};
if (doesElementExist('#toggle-pass')) {
    document.querySelector('#toggle-pass').addEventListener('click', () => {
        const passwordField = document.getElementById("password_") ||
            document.getElementById("password") ||
            document.getElementById('SMTP_PASSWORD');

        const icon = document.querySelector(".toggle-password");

        if (passwordField.type === "password") {
            passwordField.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            passwordField.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    });
};

// Load and display the latest users
document.addEventListener("DOMContentLoaded", async () => {
    const listEl = document.getElementById("latestUsers");
    if (!listEl) return;

    const result = await fetchData('/api/dashboard/latest?r=admin');

    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
        listEl.innerHTML = `
            <li class="list-group-item bg-dark text-white text-center">
                No users found.
            </li>`;
        return;
    }

    result.data.forEach((user, index) => {
        const item = document.createElement("li");
        item.className =
            "list-group-item bg-dark text-white d-flex justify-content-between align-items-center";
        item.innerHTML = `
            <div>
                <strong>${user.name}</strong><br />
                <small>${user.email}</small>
            </div>
            <span class="badge bg-primary rounded-pill">#${index + 1}</span>
        `;
        listEl.appendChild(item);
    });
});
