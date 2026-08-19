/* ==========================================================
   INVENTORY MANAGEMENT SYSTEM - script.js
   ==========================================================
   This app stores all products in the browser's localStorage.
   Think of localStorage as a simple "database" that lives
   inside the user's browser. Every time we Add / Update /
   Delete a product, we save the updated list back into
   localStorage so the data is not lost when the page reloads.
   ========================================================== */

// The key (name) we use to store our data inside localStorage
const STORAGE_KEY = "inventoryProducts";

// Grab all the HTML elements we will need to work with
const productForm = document.getElementById("productForm");
const productIdInput = document.getElementById("productId");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");

const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const tableBody = document.getElementById("productTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const searchBox = document.getElementById("searchBox");
const totalValueDisplay = document.getElementById("totalValue");

/* ==========================================================
   1. GET products from localStorage
   ========================================================== */
function getProducts() {
  const data = localStorage.getItem(STORAGE_KEY);
  // If there is no data yet, return an empty list
  if (!data) {
    return [];
  }
  return JSON.parse(data);
}

/* ==========================================================
   2. SAVE products back to localStorage
   ========================================================== */
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/* ==========================================================
   3. RENDER (draw) the product table on the page
   ========================================================== */
function renderProducts() {
  const products = getProducts();
  const searchTerm = searchBox.value.trim().toLowerCase();

  // Filter products based on the search box text
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm)
  );

  // Clear the table first
  tableBody.innerHTML = "";

  // If there are no products to show, display the empty message
  if (filtered.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  // Loop through each product and create a table row for it
  filtered.forEach((product) => {
    const totalValue = (product.quantity * product.price).toFixed(2);
    const isLowStock = product.quantity < 5; // simple "low stock" warning

    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Name">${product.name}</td>
      <td data-label="Category">${product.category}</td>
      <td data-label="Quantity" class="${isLowStock ? "low-stock" : ""}">
        ${product.quantity}${isLowStock ? " ⚠ Low" : ""}
      </td>
      <td data-label="Price">৳${product.price}</td>
      <td data-label="Total Value">৳${totalValue}</td>
      <td data-label="Actions">
        <button class="edit-btn" onclick="editProduct('${product.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteProduct('${product.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // ---- Update the "Total Inventory Value" summary ----
  // We calculate this from ALL products, not just the filtered/search
  // results, so it always reflects the true total stock value.
  const grandTotal = products.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  );
  totalValueDisplay.textContent = `৳${grandTotal.toFixed(2)}`;
}

/* ==========================================================
   4. ADD or UPDATE a product (form submit)
   ========================================================== */
productForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from reloading

  const products = getProducts();

  // Build a product object from the form values
  const productData = {
    name: nameInput.value.trim(),
    category: categoryInput.value.trim(),
    quantity: Number(quantityInput.value),
    price: Number(priceInput.value),
  };
// ---- Validation: quantity and price cannot be negative ----
  // Even though the number inputs have min="0", a user could still
  // bypass that using browser dev tools, so we double-check here too.
  if (productData.quantity < 0 || productData.price < 0) {
    alert("Quantity and price cannot be negative. Please enter valid values.");
    return;
  }
  // ---- Validation: quantity and price cannot be negative ----
  // Even though the number inputs have min="0", a user could still
  // bypass that using browser dev tools, so we double-check here too.
  if (productData.quantity < 0 || productData.price < 0) {
    alert("Quantity and price cannot be negative. Please enter valid values.");
    return;
  }

  const editingId = productIdInput.value;

  if (editingId) {
    // ---- UPDATE existing product ----
    const index = products.findIndex((p) => p.id === editingId);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
    }
  } else {
    // ---- ADD new product ----
    productData.id = Date.now().toString(); // simple unique id
    products.push(productData);
  }

  saveProducts(products);
  renderProducts();
  resetForm();
});

/* ==========================================================
   5. EDIT a product - fill the form with existing data
   ========================================================== */
function editProduct(id) {
  const products = getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return;

  productIdInput.value = product.id;
  nameInput.value = product.name;
  categoryInput.value = product.category;
  quantityInput.value = product.quantity;
  priceInput.value = product.price;

  formTitle.textContent = "Edit Product";
  saveBtn.textContent = "Update Product";
  cancelBtn.classList.remove("hidden");

  // Scroll up to the form so the user can see it
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================================
   6. DELETE a product
   ========================================================== */
function deleteProduct(id) {
  const confirmDelete = confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  let products = getProducts();
  products = products.filter((p) => p.id !== id);

  saveProducts(products);
  renderProducts();
}

/* ==========================================================
   7. RESET the form back to "Add" mode
   ========================================================== */
function resetForm() {
  productForm.reset();
  productIdInput.value = "";
  formTitle.textContent = "Add New Product";
  saveBtn.textContent = "Add Product";
  cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", resetForm);

/* ==========================================================
   8. SEARCH - re-render table whenever user types
   ========================================================== */
searchBox.addEventListener("input", renderProducts);

/* ==========================================================
   9. Run this once when the page first loads
   ========================================================== */
renderProducts();
