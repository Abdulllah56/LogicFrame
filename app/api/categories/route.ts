import { NextRequest, NextResponse } from 'next/server';

const categoriesData = [
  { id: 1, name: "Food & Dining", color: "#FF6B6B", icon: "ri-restaurant-line" },
  { id: 2, name: "Transportation", color: "#4ECDC4", icon: "ri-car-line" },
  { id: 3, name: "Shopping", color: "#45B7D1", icon: "ri-shopping-bag-line" },
  { id: 4, name: "Entertainment", color: "#FFA07A", icon: "ri-movie-line" },
  { id: 5, name: "Bills & Utilities", color: "#98D8C8", icon: "ri-file-list-line" },
  { id: 6, name: "Healthcare", color: "#F7DC6F", icon: "ri-heart-pulse-line" },
  { id: 7, name: "Education", color: "#BB8FCE", icon: "ri-book-line" },
  { id: 8, name: "Other", color: "#95A5A6", icon: "ri-more-line" },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}