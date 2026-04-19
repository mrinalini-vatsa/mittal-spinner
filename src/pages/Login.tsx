import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import FormInput from "@/components/FormInput";
import { Button } from "@/components/ui/button";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden bg-gradient-hero md:block">
        <div className="absolute inset-0 grid place-items-center p-10 text-brand-100">
          <div className="max-w-md">
            <Link to="/" className="text-sm text-brand-300 hover:text-background">← Back to site</Link>
            <h2 className="mt-6 text-4xl font-semibold text-background">Mittel Spinners</h2>
            <p className="mt-3 text-brand-100/80">
              Operations console for workers, attendance, inventory and orders.
            </p>
          </div>
        </div>
      </div>

      <div className="grid place-items-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8 shadow-card">
          <div>
            <h1 className="text-2xl font-semibold">Staff Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to access operations.</p>
          </div>
          <FormInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@mittelspinners.com" />
          <FormInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Authenticates against <code className="rounded bg-secondary px-1">POST /api/auth/login</code>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
