"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Explorar",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    ),
  },
  {
    href: "/publicar",
    label: "Publicar",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 5v14m7-7H5"
      />
    ),
  },
  {
    href: "/login",
    label: "Cuenta",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0"
      />
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-[28px] border border-white/80 bg-white/88 p-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-[20px] px-3 py-2.5 text-[11px] font-medium transition ${
                isActive
                  ? "bg-[#fff2ed] text-coral shadow-[0_10px_20px_rgba(255,56,92,0.14)]"
                  : "text-stone"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className={`h-5 w-5 transition ${isActive ? "scale-105" : ""}`}
              >
                {item.icon}
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
