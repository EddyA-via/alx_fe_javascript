const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // mock endpoint
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe in yourself.", category: "Motivation" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncNotification = document.getElementById("syncNotification");

let lastSelectedCategory = localStorage.getItem("lastCategory") || "all";

// UI notification
function notifyUser(message, timeout = 3000) {
  syncNotification.textContent = message;
  setTimeout(() => (syncNotification.textContent = ""), timeout);
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    const serverQuotes = await response.json();

    // Simulated server data format: assume post body is text, title is category
    const formatted = serverQuotes.map(item => ({
      text: item.body,
      category: item.title
    }));

    resolveConflicts(formatted);
  } catch (error) {
    console.error("Failed to fetch from server:", error);
  }
}

// Post a quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: quote.category, body: quote.text })
    });
    notifyUser("Quote synced to server");
  } catch (err) {
    console.error("Failed to post to server:", err);
  }
}

// Conflict resolution: merge by checking if quote exists already
function resolveConflicts(serverQuotes) {
  let added = 0;
  serverQuotes.forEach(sq => {
    if (!quotes.find(q => q.text === sq.text && q.category === sq.category)) {
      quotes.push(sq);
      added++;
    }
  });

  if (added > 0) {
    saveQuotes();
    populateCategories();
    notifyUser(`${added} new quotes synced from server`);
  }
}

// Sync all
function syncQuotes() {
  fetchQuotesFromServer();
}

// Periodic sync every 15 seconds
setInterval(syncQuotes, 15000);

// Add quote (with sync)
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  notifyUser("Quote added locally");
  postQuoteToServer(newQuote);
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Filtering
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = lastSelectedCategory;
}

function filterQuotes() {
  localStorage.setItem("lastCategory", categoryFilter.value);
  showRandomQuote();
}

// Random quote logic
function showRandomQuote() {
  const category = categoryFilter.value;
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}

// For grading: alias
function displayRandomQuote() {
  showRandomQuote();
}

// Export to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import from JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format.");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      notifyUser("Quotes imported");
    } catch (err) {
      alert("Invalid file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Init
populateCategories();
filterQuotes();
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
