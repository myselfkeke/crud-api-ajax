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
      <td class="text-center">
        <button data-id="${
          user.id
        }" class="btn btn-sm btn-primary btn-edit" title="Edit">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button data-id="${
          user.id
        }" class="btn btn-sm btn-danger btn-delete" title="Delete">
          <i class="bi bi-trash"></i>
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

  if (!name || !email) return showMessage("Name and Email required", "warning");

  const fd = new URLSearchParams({ name, email, phone });

  try {
    const res = await fetch("create.php", { method: "POST", body: fd });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to add user");

    showMessage("User added successfully!", "success");
    e.target.reset();
    fetchUsers();
  } catch (err) {
    console.error("create error:", err);
    showMessage("Add failed: " + err.message, "danger");
  }
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
      editBtn.innerHTML = `<i class="bi bi-check-circle"></i>`;
      editBtn.classList.replace("btn-primary", "btn-success");
      editBtn.classList.replace("btn-edit", "btn-save");
      editBtn.title = "Save";

      deleteBtn.innerHTML = `<i class="bi bi-x-circle"></i>`;
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

        saveBtn.innerHTML = `<i class="bi bi-pencil-square"></i>`;
        saveBtn.classList.replace("btn-success", "btn-primary");
        saveBtn.classList.replace("btn-save", "btn-edit");
        saveBtn.title = "Edit";

        const cancelButton = tr.querySelector(".btn-cancel");
        cancelButton.innerHTML = `<i class="bi bi-trash"></i>`;
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
