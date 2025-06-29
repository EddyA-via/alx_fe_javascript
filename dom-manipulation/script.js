let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" },
  { text: "The only limit is your mind.", category: "Inspiration" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Display Random Quote Based on Filter
function displayRandomQuote() {
  let filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
}

// Add New Quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Both fields are required.");

  const newQuote = { text, category };
  quotes.push(newQuote);

  saveQuotes();
  populateCategories();
  displayRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate category dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// Event listeners
document.getElementById("showQuoteBtn").addEventListener("click", displayRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

categoryFilter.addEventListener("change", () => {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayRandomQuote();
});

// Export Quotes
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import Quotes
document.getElementById("importInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const importedQuotes = JSON.parse(reader.result);
      if (Array.isArray(importedQuotes)) {
        quotes = importedQuotes;
        saveQuotes();
        populateCategories();
        displayRandomQuote();
        alert("Quotes imported successfully!");
      }
    } catch {
      alert("Invalid JSON format.");
    }
  };
  reader.readAsText(file);
});

// Simulate Server Sync
function fetchQuotesFromServer() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { text: "Success is not final; failure is not fatal.", category: "Motivation" },
        { text: "Believe you can and you're halfway there.", category: "Inspiration" }
      ]);
    }, 1500);
  });
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const existing = new Set(quotes.map(q => q.text + q.category));

  const newOnes = serverQuotes.filter(q => !existing.has(q.text + q.category));

  if (newOnes.length > 0) {
    quotes = quotes.concat(newOnes);
    saveQuotes();
    populateCategories();
    alert("New quotes synced from server!");
  }
}

// Initial setup
populateCategories();
displayRandomQuote();
syncQuotes();
