/**
 * Parses an amount string into a number
 * Examples: 
 * - "4.50" -> 4.5
 * - "$4.50" -> 4.5
 * - "4,50" -> 4.5
 * * @param {string} amountStr The string to parse.
 * @returns {number} The parsed amount or 0 if invalid.
 */
export function parseAmount(amountStr) {
  // Remove any currency symbols, commas, etc.
  // RegEx /[$,]/g matches all global occurrences of '$' or ','
  const cleanedStr = amountStr.replace(/[$,]/g, "");
  
  // Try to parse the string to a number
  const amount = parseFloat(cleanedStr);
  
  // Return the amount or 0 if NaN
  return isNaN(amount) ? 0 : amount;
}

// ---

/**
 * Guess a category based on keywords in the description
 * * @param {string} description The expense description.
 * @returns {string} The guessed category name.
 */
function guessCategoryFromDescription(description) {
  const lowerDesc = description.toLowerCase();
  
  // Define category keywords
  // Using an object for structure, similar to the original Record<string, string[]>
  const categoryKeywords = {
    "Food & Dining": ["food", "meal", "restaurant", "coffee", "lunch", "breakfast", "dinner", "cafe", "grocery", "takeout"],
    "Transportation": ["uber", "lyft", "taxi", "bus", "train", "subway", "gas", "fuel", "parking", "car"],
    "Entertainment": ["movie", "concert", "ticket", "netflix", "spotify", "subscription", "game", "book"],
    "Shopping": ["clothes", "clothing", "shirt", "shoes", "amazon", "purchase", "store", "mall"],
    "Utilities": ["electric", "water", "utility", "bill", "phone", "internet", "cable", "gas"],
    "Healthcare": ["doctor", "hospital", "pharmacy", "medication", "health", "dental", "medical"],
    "Housing": ["rent", "mortgage", "home", "apartment", "house", "insurance", "repair"],
    "Income": ["salary", "income", "payment", "paycheck", "deposit"],
  };
  
  // Check for keyword matches
  // Object.entries is a standard way to iterate over key-value pairs
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }
  
  // Default if no match
  return "Other";
}

// ---

/**
 * Parse a full expense text like "Coffee $4.50" into components
 * * @param {string} text The full expense text input.
 * @returns {{ description?: string, amount?: number, category?: string }} An object with parsed components.
 */
export function parseExpenseText(text) {
  if (!text) return {};
  
  // Define the result object structure
  const result = {};
  
  // Try to find an amount with an optional dollar sign, followed by one or more digits, 
  // optionally followed by a decimal and more digits.
  const amountMatch = text.match(/\$?(\d+(\.\d+)?)/);
  if (amountMatch) {
    // amountMatch[0] is the full matched string (e.g., "$4.50")
    result.amount = parseAmount(amountMatch[0]);
    
    // Remove the amount from the text for further processing
    const remainingText = text.replace(amountMatch[0], "").trim();
    
    // The rest is likely the description
    if (remainingText) {
      result.description = remainingText;
    }
  } else {
    // No amount found, use the entire text as the description
    result.description = text;
  }
  
  // Try to guess category from the description
  if (result.description) {
    result.category = guessCategoryFromDescription(result.description);
  }
  
  return result;
}