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
    <td>${user.id}</td>
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.phone || ""}</td>
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
    fetchUsers();
  } catch (err) {
    console.error("delete error:", err);
  }
}

// initial load
fetchUsers();
