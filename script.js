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

//  helper: escape HTML to avoid XSS when rendering data
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}

async function fetchUsers() {
  try {
    const res = await fetch("read.php");
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Failed to load");
    }

    renderTable(json.data);
  } catch (err) {
    console.error("fetchUsers error:", err);
  }
}

function renderTable(users) {
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";

  if (!users.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center"> No records </td></tr>';
    return;
  }

  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${escapeHtml(user.id)}</td>
    <td>${escapeHtml(user.name)}</td>
    <td>${escapeHtml(user.email)}</td>
    <td>${escapeHtml(user.phone || "")}</td>
    <td style="text-align: center">
      <button data-id="${
        user.id
      }" class="btn btn-sm btn-primary btn-edit" title="Edit"><i class="bi bi-pencil-square"></i></button>

      <button data-id="${
        user.id
      }" class="btn btn-sm btn-danger btn-delete" title="Delete"><i class="bi bi-trash"></i></button>
    </td>
    `;
    tbody.appendChild(tr);
  });

  // attach handeler
  let x = document.querySelectorAll(".btn-edit");
  x.forEach((b) => {
    b.addEventListener("click", onEditClick);
  });
  let y = document.querySelectorAll(".btn-delete");
  y.forEach((b) => b.addEventListener("click", onDeleteClick));
}

// Add form submit handler
document
  .getElementById("addForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !email) {
      showMessage("Name and email are required", "warning");
    }

    const fd = new URLSearchParams();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("phone", phone);

    try {
      const res = await fetch("create.php", { method: "POST", body: fd });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Adding user failed");

      showMessage("User added", "success");
      //clear form and refresh table
      document.getElementById("addForm").reset();
      fetchUsers();
    } catch (err) {
      console.error("create error:", err);
      showMessage("Add failed: " + err.message, "danger");
    }
  });

function onEditClick() {
  console.log("Edit button is clicked");
}
async function onDeleteClick(e) {
  if (!confirm("Delete this user?")) return;
  const id = e.currentTarget.dataset.id;
  const fd = new URLSearchParams();
  fd.append("id", id);

  try {
    const res = await fetch("delete.php", { method: "POST", body: fd });
    const json = await res.json();

    if (!json.success) throw new Error(json.error || "Delete failed");
    showMessage("user deleted", "danger");
    fetchUsers();
  } catch (err) {
    console.error("delete error:", err);
  }
}

// initial load
fetchUsers();
