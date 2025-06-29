let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// Mock server data store (for demo purposes only)
let mockServerData = [
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Believe you can and you're halfway there.", category: "Inspiration" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.createElement("div");
notification.id = "notification";
notification.style.color = "green";
notification.style.padding = "10px";
document.body.insertBefore(notification, quoteDisplay);

// ----------------- UI Functions -----------------
function displayRandomQuote() {
  let filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
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
  postQuoteToServer(newQuote); // sync to server

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

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

// ----------------- Mock API Functions -----------------
function fetchQuotesFromServer() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockServerData]); // return clone
    }, 1000);
  });
}

function postQuoteToServer(quote) {
  return new Promise(resolve => {
    setTimeout(() => {
      const exists = mockServerData.some(q => q.text === quote.text && q.category === quote.category);
      if (!exists) {
        mockServerData.push(quote);
        notifyUser("Quote synced to server.");
      } else {
        notifyUser("Quote already exists on server (no sync).", true);
      }
      resolve();
    }, 1000);
  });
}

// ----------------- Sync Logic -----------------
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localKeys = new Set(quotes.map(q => q.text + q.category));
  let newQuotes = serverQuotes.filter(q => !localKeys.has(q.text + q.category));

  if (newQuotes.length > 0) {
    quotes = [...quotes, ...newQuotes];
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    notifyUser(`${newQuotes.length} new quote(s) synced from server.`);
  } else {
    notifyUser("No new quotes from server.");
  }
}

function notifyUser(msg, isError = false) {
  notification.textContent = msg;
  notification.style.color = isError ? "red" : "green";
  setTimeout(() => (notification.textContent = ""), 5000);
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

// ----------------- Event Listeners -----------------
document.getElementById("showQuoteBtn").addEventListener("click", displayRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
categoryFilter.addEventListener("change", () => {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayRandomQuote();
});

// ----------------- Initialize -----------------
populateCategories();
displayRandomQuote();
syncQuotes(); // initial sync
setInterval(syncQuotes, 15000); // every 15 seconds
