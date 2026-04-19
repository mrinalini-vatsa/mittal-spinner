import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-hero" aria-hidden />
          <span className="font-semibold tracking-tight text-foreground">
            Mittel <span className="text-muted-foreground">Spinners</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              Staff Login
            </Button>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {publicLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Button size="sm" onClick={() => { setOpen(false); navigate("/dashboard"); }}>
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setOpen(false); handleLogout(); }}>
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => { setOpen(false); navigate("/login"); }}>
                Staff Login
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
