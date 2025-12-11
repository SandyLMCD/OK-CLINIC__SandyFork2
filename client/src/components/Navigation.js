import { Home, Calendar, LogOut, FileText, MessageSquare } from "lucide-react";

// --- Inline Button Component ---
function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) {
  let base =
    "inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  let variants = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm",
    outline:
      "border border-border bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm",
    ghost: "hover:bg-accent hover:text-accent-foreground px-2 py-1 text-sm",
  };
  let sizes = {
    default: "",
    sm: "h-8 px-2 text-xs",
  };
  return (
    <button
      className={`${base} ${variants[variant] || ""} ${
        sizes[size] || ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// -- Navigation Component --
export function Navigation({ currentPage, onNavigate, onLogout }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar">
      <div className="max-w-5xl mx-auto px-6 navbar-shell">
        {/* Single flex row: brand on left, buttons on right */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-primary m-0">OK Clinic</h1>
          </div>

          <div className="nav-buttons items-center space-x-2">
            <Button
              variant={currentPage === "profile" ? "default" : "ghost"}
              size="sm"
              className={
                currentPage === "profile"
                  ? "nav-pill-active"
                  : "nav-pill-inactive"
              }
              onClick={() => onNavigate("profile")}
            >
              <Home className="w-4 h-4 mr-2" />
              Profile
            </Button>

            <Button
              variant={currentPage === "booking" ? "default" : "ghost"}
              size="sm"
              className={
                currentPage === "booking"
                  ? "nav-pill-active"
                  : "nav-pill-inactive"
              }
              onClick={() => onNavigate("booking")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>

            <Button
              variant={currentPage === "invoices" ? "default" : "ghost"}
              size="sm"
              className={
                currentPage === "invoices"
                  ? "nav-pill-active"
                  : "nav-pill-inactive"
              }
              onClick={() => onNavigate("invoices")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Invoices
            </Button>

            <Button
              variant={currentPage === "feedback" ? "default" : "ghost"}
              size="sm"
              className={
                currentPage === "feedback"
                  ? "nav-pill-active"
                  : "nav-pill-inactive"
              }
              onClick={() => onNavigate("feedback")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="nav-pill-inactive"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}