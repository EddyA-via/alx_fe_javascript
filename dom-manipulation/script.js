let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.createElement("div");
notification.id = "notification";
notification.style.color = "green";
notification.style.padding = "10px";
document.body.insertBefore(notification, quoteDisplay);

// ----------------- UI Functions -----------------

function displayRandomQuote() {
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found in this category.";
  } else {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  }
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Both fields required.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayRandomQuote();
  postQuoteToServer(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ----------------- Filter & Category -----------------

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

categoryFilter.addEventListener("change", () => {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayRandomQuote();
});

// ----------------- Storage Helpers -----------------

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function notifyUser(msg, isError = false) {
  notification.textContent = msg;
  notification.style.color = isError ? "red" : "green";
  setTimeout(() => (notification.textContent = ""), 5000);
}

// ----------------- Mock API Interaction -----------------

// ✅ Fetch quotes from mock API using a dedicated function
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();

  // Simulate server-side quotes
  return data.slice(0, 3).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

// ✅ Post quote to mock API using fetch
function postQuoteToServer(quote) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote),
  })
    .then(res => res.json())
    .then(data => {
      console.log("Synced to server:", data);
      notifyUser("Quote synced to mock API.");
    })
    .catch(() => notifyUser("Error syncing to mock API.", true));
}

// ✅ Sync function that uses fetchQuotesFromServer
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    let addedCount = 0;
    const localKeys = new Set(quotes.map(q => q.text + q.category));

    for (const q of serverQuotes) {
      const key = q.text + q.category;
      if (!localKeys.has(key)) {
        quotes.push(q);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      saveQuotes();
      populateCategories();
      notifyUser(`${addedCount} new quote(s) synced from server.`);
      displayRandomQuote();
    } else {
      notifyUser("No new quotes found on server.");
    }
  } catch (error) {
    console.error("Sync error:", error);
    notifyUser("Failed to sync from server.", true);
  }
}

// ----------------- Import / Export -----------------

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

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
        notifyUser("Quotes imported successfully.");
      }
    } catch {
      notifyUser("Invalid JSON file format.", true);
    }
  };
  reader.readAsText(file);
});

// ----------------- Initialize -----------------

document.getElementById("showQuoteBtn").addEventListener("click", displayRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

populateCategories();
displayRandomQuote();
syncQuotes();
setInterval(syncQuotes, 15000); // ✅ Periodically check every 15s
