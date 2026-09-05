"use client";
import { AnimatePresence, motion } from "motion/react";
import { HeartHandshake, MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const authPath = pathname.startsWith("/auth") ? "/auth/login" : "/login";

  const navItems: { label: string; href: string }[] = [
    { label: "Browse", href: "/donations/browse" },
    { label: "Saved", href: "/donations/saved" },
    { label: "Impact", href: "/impact" },
    { label: "Donate", href: "/donations/create" },
    { label: "Donor Hub", href: "/donor-dashboard" },
    { label: "Recipient Hub", href: "/recipient-dashboard" },
    { label: "My Claims", href: "/claims/my-claims" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 mx-2 md:mx-4 lg:mx-6 w-full md:max-w-3xl lg:max-w-5xl xl:max-w-6xl border border-emerald-900/10 bg-background/85 shadow-lg shadow-emerald-950/5 backdrop-blur-md py-2 px-4 rounded-2xl">
      <div className="flex flex-row justify-between items-center py-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link href="/" className="flex items-center gap-2 rounded-full text-emerald-950 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <span className="font-aleo text-xl font-bold tracking-tight">FoodBridge</span>
          </Link>
        </motion.div>

        <div className="hidden md:flex flex-row items-center gap-4 4xl:gap-8">
          {navItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.1 + index * 0.1,
              }}
            >
              <Link
                href={item.href}
                className="flex flex-row items-center gap-1 rounded-full px-3 py-2 text-muted-foreground transition hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <p className="text-sm font-medium 4xl:text-2xl">{item.label}</p>
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 0.1 + navItems.length * 0.1,
            }}
          >
            <Button variant="ghost" className="4xl:text-2xl" size={"sm"}>
              <Link href={authPath}>Log In</Link>
            </Button>
          </motion.div>
          <ThemeToggle />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 0.2 + navItems.length * 0.1,
            }}
          >
            <Button
              variant="default"
              className="4xl:text-2xl 4xl:h-16 4xl:px-8"
            >
              <Link href="/donations/create">Create donation</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="md:hidden"
        >
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <XIcon className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <MenuIcon className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex flex-col gap-4 py-4"
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="flex flex-row items-center gap-1 py-2"
                  
                    onClick={() => setIsOpen(false)}
                  >
                    <p className="text-sm font-medium">{item.label}</p>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: navItems.length * 0.1 }}
                className="flex flex-col gap-2 pt-2"
              >
                <ThemeToggle />
                <Button variant="ghost" className="w-full">
                  <Link href={authPath}>Log In</Link>
                </Button>
                <Button variant="default" className="w-full">
                  <Link href="/donations/create">Create donation</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}