// ===================== Helper Functions =====================
function showMessage(text, type = "info") {
  const messageArea = document.getElementById("messageArea");
  const div = document.createElement("div");
  div.className = `alert alert-${type}`;
  div.textContent = text;
  messageArea.innerText = "";
  messageArea.appendChild(div);
  setTimeout(() => {
    if (messageArea.contains(div)) messageArea.removeChild(div);
  }, 3000);
}

// Escape HTML to avoid XSS attacks
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}

// ===================== FETCH USERS =====================
async function fetchUsers() {
  try {
    const res = await fetch("read.php");
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to load users");

    renderTable(json.data);
  } catch (err) {
    console.error("fetchUsers error:", err);
    showMessage("Error loading users", "danger");
  }
}

// ===================== RENDER TABLE =====================
function renderTable(users) {
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";

  if (!users.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center">No records</td></tr>';
    return;
  }

  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(user.id)}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.phone || "")}</td>
      <td style="text-align: center;">
        <button 
         class="btn btn-sm btn-outline-primary btn-view" 
           data-path="${user.resume_path}" 
         title="View Resume">
         <i class="bi bi-eye"></i> View
        </button>
      </td>

      <td class="text-center">
        <button data-id="${
          user.id
        }" class="btn btn-sm btn-primary btn-edit" title="Edit">
          <i class="bi bi-pencil-square"></i> Edit
        </button>
        <button data-id="${
          user.id
        }" class="btn btn-sm btn-danger btn-delete" title="Delete">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ===================== ADD USER =====================
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  const resume = document.getElementById("resume").files[0];
  console.log(resume);

  // const resumeFile = resumeInput.files && resumeInput.files[0]; // undefined if no file chosen

  if (!name || !email) return showMessage("Name and Email required", "warning");

  const fd = new FormData();
  fd.append("name", name);
  fd.append("email", email);
  fd.append("phone", phone);
  fd.append("resume", resume);

  try {
    const res = await fetch("create.php", { method: "POST", body: fd });
    console.log(res);

    // const text = await res.text();
    // console.log("rew response from pho is " + text);

    const json = await res.json();
    console.log(json);

    if (!json.success) throw new Error(json.error || "Failed to add user");

    showMessage("User added successfully!", "success");
    e.target.reset();
    fetchUsers();
  } catch (err) {
    console.error("create error:", err);
    showMessage("Add failed: " + err.message, "danger");
  }
});

// ===================== VIEW  RESUME BUTTON (FROM FORM) =====================
// ===================== RESUME PREVIEW HANDLING =====================

// Select elements
const resumeInput = document.getElementById("resume");
const previewBtn = document.querySelector(".btn-view-disabled");

// When file input changes
resumeInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  console.log(file);

  if (file) {
    // Enable preview button
    previewBtn.disabled = false;
    previewBtn.classList.remove("btn-view-disabled");

    // Optional: Change tooltip title dynamically
    previewBtn.setAttribute("title", `Preview:(${file.name})`);
    previewBtn.setAttribute("data-bs-original-title", `Preview: ${file.name}`);

    // Store selected file temporarily (for next page use)
    sessionStorage.setItem("previewFileName", file.name);

    // Create a blob URL for previewing
    const fileURL = URL.createObjectURL(file);
    sessionStorage.setItem("previewFileURL", fileURL);

    // Optional: change button text
    previewBtn.innerHTML = `<i class="bi bi-eye"></i> Preview (${file.name})`;
  } else {
    // Reset if no file chosen
    previewBtn.disabled = true;
    previewBtn.classList.add("btn-view-disabled");
    previewBtn.innerHTML = `<i class="bi bi-eye"></i> Preview`;
    sessionStorage.removeItem("previewFileURL");
  }
});

// Handle click on Preview button
previewBtn.addEventListener("click", () => {
  const fileURL = sessionStorage.getItem("previewFileURL");

  if (!fileURL) {
    alert("Please upload a file first.");
    return;
  }

  // Option 1: Open directly in a new tab
  window.open(fileURL, "_blank");

  // Option 2: Redirect to a custom preview page
  //  Note-temporirly ignoring it to redirect to preview.html as it needs to pass file via Blob data URL and i have no idea of that and not in mood to go deeper into it.
  // window.location.href = "preview.html";
});

// ===================== VIEW  RESUME BUTTON (FROM TABLE COLUMN) =====================
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-view");
  if (!btn) return;

  const filePath = btn.dataset.path;
  window.open(filePath, "_blank"); // opens in new tab
});

// ===================== INLINE EDIT / SAVE / CANCEL / DELETE =====================
document
  .querySelector("#usersTable tbody")
  .addEventListener("click", async function (e) {
    const tr = e.target.closest("tr");
    if (!tr) return;

    const editBtn = e.target.closest(".btn-edit");
    const saveBtn = e.target.closest(".btn-save");
    const deleteBtn = e.target.closest(".btn-delete");
    const cancelBtn = e.target.closest(".btn-cancel");

    // --- EDIT MODE ---
    if (editBtn) {
      const id = editBtn.dataset.id;
      const deleteBtn = tr.querySelector(".btn-delete"); // ✅ Get the delete button in that row
      const name = tr.cells[1].innerText;
      const email = tr.cells[2].innerText;
      const phone = tr.cells[3].innerText;

      // replace text with inputs
      tr.cells[1].innerHTML = `<input type="text" value="${name}" class="form-control form-control-sm edit-name">`;
      tr.cells[2].innerHTML = `<input type="email" value="${email}" class="form-control form-control-sm edit-email">`;
      tr.cells[3].innerHTML = `<input type="text" value="${phone}" class="form-control form-control-sm edit-phone">`;

      // toggle buttons
      editBtn.innerHTML = `<i class="bi bi-check-circle"></i> Save`;
      editBtn.classList.replace("btn-primary", "btn-success");
      editBtn.classList.replace("btn-edit", "btn-save");
      editBtn.title = "Save";

      deleteBtn.innerHTML = `<i class="bi bi-x-circle"></i> Cancel`;
      deleteBtn.classList.replace("btn-danger", "btn-warning");
      deleteBtn.classList.replace("btn-delete", "btn-cancel");
      deleteBtn.title = "Cancel";
    }

    // --- SAVE MODE ---
    if (saveBtn) {
      const id = saveBtn.dataset.id;
      const name = tr.querySelector(".edit-name").value.trim();
      const email = tr.querySelector(".edit-email").value.trim();
      const phone = tr.querySelector(".edit-phone").value.trim();

      if (!name || !email) return showMessage("Invalid input", "warning");

      const fd = new URLSearchParams({ id, name, email, phone });

      try {
        const res = await fetch("update.php", { method: "POST", body: fd });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Update failed");

        showMessage("User updated successfully!", "success");

        // revert UI
        tr.cells[1].innerText = name;
        tr.cells[2].innerText = email;
        tr.cells[3].innerText = phone;

        saveBtn.innerHTML = `<i class="bi bi-pencil-square"></i> Save`;
        saveBtn.classList.replace("btn-success", "btn-primary");
        saveBtn.classList.replace("btn-save", "btn-edit");
        saveBtn.title = "Edit";

        const cancelButton = tr.querySelector(".btn-cancel");
        cancelButton.innerHTML = `<i class="bi bi-trash"></i> Cancel`;
        cancelButton.classList.replace("btn-warning", "btn-danger");
        cancelButton.classList.replace("btn-cancel", "btn-delete");
        cancelButton.title = "Delete";
      } catch (err) {
        console.error("update error:", err);
        showMessage("Update failed: " + err.message, "danger");
      }
    }

    // --- CANCEL MODE ---
    if (cancelBtn) {
      fetchUsers(); // reloads table to revert changes
      showMessage("Edit cancelled", "info");
    }

    // --- DELETE MODE ---
    if (deleteBtn) {
      if (!confirm("Delete this user?")) return;
      const id = deleteBtn.dataset.id;

      const fd = new URLSearchParams({ id });

      try {
        const res = await fetch("delete.php", { method: "POST", body: fd });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Delete failed");

        showMessage("User deleted", "danger");
        fetchUsers();
      } catch (err) {
        console.error("delete error:", err);
        showMessage("Delete failed: " + err.message, "danger");
      }
    }
  });

// ===================== INITIAL LOAD =====================
fetchUsers();

/*
alternate method to insert view button on resume column

 <td>${
        user.resume_path
          ? `<a href="${user.resume_path}" target="_blank">
            <button class="btn btn-warning"><i class="bi bi-eye"> View</i></button>
          </a>`
          : ""
      }</td>
*/
