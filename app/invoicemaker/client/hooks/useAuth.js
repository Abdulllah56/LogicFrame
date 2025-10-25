import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate authentication check
    const mockUser = {
      id: 1,
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      subscriptionStatus: "free"
    };
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
