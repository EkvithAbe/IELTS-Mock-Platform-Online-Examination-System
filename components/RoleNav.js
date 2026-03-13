import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ROLE_CONFIGS = {
  guest: {
    name: "Guest",
    gradient: "from-sky-400/70 via-blue-500/70 to-indigo-700/70",
    buttonGradient: "from-sky-500/90 to-indigo-600/90",
    border: "border-sky-200/60",
    accent: "text-sky-50/80",
    links: [
      { label: "Home", href: "/" },
      { label: "Login", href: "/login" },
      { label: "Signup", href: "/register" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  admin: {
    name: "Admin",
    gradient: "from-indigo-800/70 via-blue-900/70 to-slate-900/70",
    buttonGradient: "from-indigo-700/90 to-blue-800/90",
    border: "border-indigo-200/60",
    accent: "text-indigo-50/80",
    links: [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Users", href: "/admin/users" },
      { label: "Upload Modules", href: "/admin/content" },
    ],
  },
  student: {
    name: "Student",
    gradient: "from-cyan-500/70 via-blue-600/70 to-blue-800/70",
    buttonGradient: "from-cyan-500/90 to-blue-700/90",
    border: "border-cyan-200/60",
    accent: "text-cyan-50/80",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Quizzes", href: "/quiz-list" },
      { label: "Purchased Quizzes", href: "/my-purchased-tests" },
      { label: "My Progress", href: "/my-tests" },
    ],
  },
};

const allowedRoles = ["guest", "admin", "student"];

const readRole = () => {
  if (typeof window === "undefined") return "guest";
  try {
    const storedUser = window.localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const normalized = String(parsed.role || "").toLowerCase();
      if (allowedRoles.includes(normalized)) return normalized;
    }
  } catch (error) {
    // ignore malformed storage and fall back to guest
  }
  return "guest";
};

export default function RoleNav() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState("guest");

  useEffect(() => {
    setRole(readRole());
  }, [router.pathname]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key === "user" || event.key === "token") {
        setRole(readRole());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    router.events.on("routeChangeStart", closeMenu);
    return () => router.events.off("routeChangeStart", closeMenu);
  }, [router.events]);

  const currentRole = ROLE_CONFIGS[role] || ROLE_CONFIGS.guest;

  return (
    <nav className="fixed top-20 left-4 sm:left-8 z-50">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={`${currentRole.name} menu`}
          className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl text-white font-semibold tracking-wide transition transform ${
            menuOpen
              ? `scale-95 bg-gradient-to-r ${currentRole.buttonGradient} backdrop-blur-xl border border-white/20`
              : `bg-gradient-to-r ${currentRole.buttonGradient} hover:translate-y-0.5 backdrop-blur-xl border border-white/10`
          }`}
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-6 rounded-full bg-white" />
            <span className="block h-0.5 w-6 rounded-full bg-white" />
          </span>
          <span className="text-lg drop-shadow-sm">{currentRole.name}</span>
        </button>

        {menuOpen && (
          <div
            className={`relative w-72 text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden border ${currentRole.border} transition-all duration-300 ease-out transform origin-top-left bg-gradient-to-b ${currentRole.gradient} backdrop-blur-2xl`}
          >
            <div className="absolute left-7 top-5 bottom-5 flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-white shadow-md" />
              <span className="flex-1 w-1 bg-white/70 rounded-full" />
              <span className="w-3 h-3 rounded-full bg-white shadow-md" />
            </div>
            <ul className="pl-14 pr-6 py-5 space-y-3">
              {currentRole.links.map((item, index) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/90 shadow" />
                  <a
                    href={item.href}
                    className="flex-1 text-lg font-semibold tracking-wide hover:translate-x-1 transition transform duration-200 ease-out"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
