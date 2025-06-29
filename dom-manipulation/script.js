let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" }
];

// Fetch quotes from mock server
async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();
  return data.map((item, index) => ({
    text: item.title,
    category: index % 2 === 0 ? "Inspiration" : "Philosophy"
  }));
}

// Post quotes to mock server
async function postQuoteToServer(quote) {
  await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: { 'Content-type': 'application/json; charset=UTF-8' }
  });
}

// Show a random quote
function showRandomQuote() {
  const filteredQuotes = filterQuotesByCategory();
  if (filteredQuotes.length === 0) return;

  const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  const display = document.getElementById('quoteDisplay');
  display.textContent = `"${quote.text}" — ${quote.category}`;
}

// Add new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    updateCategoryOptions();
    showRandomQuote();
    saveQuotesToLocalStorage();
    postQuoteToServer(newQuote);
  }
}

// Filter quotes by selected category
function filterQuotesByCategory() {
  const selected = document.getElementById('categoryFilter').value;
  if (selected === 'all') return quotes;
  return quotes.filter(q => q.category === selected);
}

// Update category dropdown
function updateCategoryOptions() {
  const select = document.getElementById('categoryFilter');
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  
  select.innerHTML = `<option value="all">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore last selected category
  const saved = localStorage.getItem('selectedCategory');
  if (saved) select.value = saved;
}

// Save quotes to local storage
function saveQuotesToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes from local storage
function loadQuotesFromLocalStorage() {
  const data = localStorage.getItem('quotes');
  if (data) {
    quotes = JSON.parse(data);
  }
}

// Sync with server and resolve conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = quotes.map(q => q.text);

  serverQuotes.forEach(sq => {
    if (!localQuotes.includes(sq.text)) {
      quotes.push(sq);
    }
  });

  saveQuotesToLocalStorage();
  updateCategoryOptions();

  const status = document.getElementById('status');
  status.textContent = 'Quotes synced with server!';
  setTimeout(() => status.textContent = '', 3000);
}

// Create quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.id = 'addQuoteForm';

  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.id = 'addQuoteBtn';
  addButton.textContent = 'Add Quote';

  addButton.addEventListener('click', addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.insertBefore(formContainer, document.getElementById('quoteDisplay'));
}

// Initial Load
createAddQuoteForm();
loadQuotesFromLocalStorage();
updateCategoryOptions();
showRandomQuote();
syncQuotes();
setInterval(syncQuotes, 10000);

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('categoryFilter').addEventListener('change', () => {
  localStorage.setItem('selectedCategory', document.getElementById('categoryFilter').value);
  showRandomQuote();
});
