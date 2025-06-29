let quotes = [];
let selectedCategory = localStorage.getItem('selectedCategory') || 'All';

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('showQuoteBtn');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');

function displayRandomQuote() {
  const filteredQuotes = selectedCategory === 'All' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);
  
  const random = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = random 
    ? `"${random.text}" - ${random.category}` 
    : 'No quote available for this category.';
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert('Please enter both quote and category.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotesToLocalStorage();
  updateCategoryOptions();
  displayRandomQuote();
  postQuoteToServer(newQuote);

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

function saveQuotesToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
  const saved = localStorage.getItem('quotes');
  if (saved) {
    quotes = JSON.parse(saved);
  }
}

function updateCategoryOptions() {
  const categories = ['All', ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = selectedCategory;
}

function filterQuote() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);
  displayRandomQuote();
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json();
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: 'Server'
    }));

    const combinedQuotes = [...quotes];
    serverQuotes.forEach(sq => {
      if (!combinedQuotes.find(q => q.text === sq.text)) {
        combinedQuotes.push(sq);
      }
    });

    quotes = combinedQuotes;
    saveQuotesToLocalStorage();
    updateCategoryOptions();
    displayRandomQuote();
    notify('Quotes synced with server!');
  } catch (err) {
    console.error('Fetch failed', err);
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(quote),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Post failed', err);
  }
}

function syncQuotes() {
  fetchQuotesFromServer();
}

function notify(message) {
  const div = document.createElement('div');
  div.className = 'notification';
  div.textContent = message;
  document.body.insertBefore(div, quoteDisplay);
  setTimeout(() => div.remove(), 3000);
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importQuotes(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const imported = JSON.parse(reader.result);
    imported.forEach(q => {
      if (!quotes.find(existing => existing.text === q.text)) {
        quotes.push(q);
      }
    });
    saveQuotesToLocalStorage();
    updateCategoryOptions();
    displayRandomQuote();
    notify('Quotes imported!');
  };
  reader.readAsText(file);
}

// Initial Load
loadQuotesFromLocalStorage();
updateCategoryOptions();
displayRandomQuote();
syncQuotes();
setInterval(syncQuotes, 10000); // sync every 10s

// Event Listeners
newQuoteBtn.addEventListener('click', displayRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', filterQuote);
exportBtn.addEventListener('click', exportQuotes);
importInput.addEventListener('change', importQuotes);
