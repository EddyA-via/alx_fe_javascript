// Initialize quote array
const quotes = [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" }
];

// Function to show a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
}

// Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });

    // Clear input fields
    textInput.value = "";
    categoryInput.value = "";

    // Update the displayed quote
    showRandomQuote();
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteButton").addEventListener("click", addQuote);

// Display one quote on load
showRandomQuote();
