import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "../components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO 
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to PayChaser dashboard to manage your invoices."
        noIndex={true}
      />
      
      <div className="flex min-h-screen items-center justify-center bg-background">
        <main id="main-content" className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link 
            to="/" 
            className="text-primary underline hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            Return to Home
          </Link>
        </main>
      </div>
    </>
  );
};

export default NotFound;
