import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 animate-fade-in">
          <div className="container py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="animate-fade-in">{children}</main>
      <footer className="border-t border-border bg-brand-950 text-brand-100">
        <div className="container py-10 text-sm">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-base font-semibold text-background">Mittel Spinners</p>
              <p className="mt-2 text-brand-300">Precision yarn manufacturing.</p>
            </div>
            <div>
              <p className="font-medium text-background">Contact</p>
              <p className="mt-2 text-brand-300">hello@mittelspinners.com</p>
            </div>
            <div>
              <p className="font-medium text-background">Address</p>
              <p className="mt-2 text-brand-300">Industrial Estate, India</p>
            </div>
          </div>
          <p className="mt-8 text-xs text-brand-300">
            © {new Date().getFullYear()} Mittel Spinners. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
