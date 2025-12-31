/**
 * Parses an amount string into a number
 * Examples: 
 * - "4.50" -> 4.5
 * - "$4.50" -> 4.5
 * - "4,50" -> 4.5
 */
export function parseAmount(amountStr: string): number {
  // Remove any currency symbols, commas, etc.
  const cleanedStr = amountStr.replace(/[$,]/g, "");
  
  // Try to parse the string to a number
  const amount = parseFloat(cleanedStr);
  
  // Return the amount or 0 if NaN
  return isNaN(amount) ? 0 : amount;
}

/**
 * Parse a full expense text like "Coffee $4.50" into components
 */
export function parseExpenseText(text: string): {
  description?: string;
  amount?: number;
  category?: string;
} {
  if (!text) return {};
  
  const result: {
    description?: string;
    amount?: number;
    category?: string;
  } = {};
  
  // Try to find an amount with a dollar sign or just a number
  const amountMatch = text.match(/\$?(\d+(\.\d+)?)/);
  if (amountMatch) {
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

/**
 * Guess a category based on keywords in the description
 */
function guessCategoryFromDescription(description: string): string | undefined {
  const lowerDesc = description.toLowerCase();
  
  // Define category keywords
  const categoryKeywords: Record<string, string[]> = {
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
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }
  
  // Default if no match
  return "Other";
}
