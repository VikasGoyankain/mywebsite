"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { useProfileStore } from "@/lib/profile-store";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const profileData = useProfileStore((state) => state.profileData);

  // Don't render on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Determine if we're on homepage or nested page
  const isHomePage = pathname === "/";
  const isTopLevelSection = pathname?.split("/").filter(Boolean).length === 1;
  const showBackButton = !isHomePage;

  const handleNavigation = () => {
    if (isHomePage) return;
    
    if (isTopLevelSection) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
    >
      <div className="max-w-[720px] mx-auto px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center">
          {/* Left: Navigation Button + Profile */}
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {showBackButton && (
                <motion.button
                  key="nav-button"
                  initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={handleNavigation}
                  className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  aria-label={isTopLevelSection ? "Go home" : "Go back"}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: isTopLevelSection ? 0 : -1 }}
                  >
                    {isTopLevelSection ? (
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Profile */}
            <motion.div 
              className="flex items-center gap-2 sm:gap-3"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                {profileData?.profileImage ? (
                  <Image
                    src={profileData.profileImage}
                    alt={profileData.name || "Profile"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {profileData?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm sm:text-base text-foreground">
                  {profileData?.name || "Loading..."}
                </span>
                {profileData?.name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 15 }}
                    className="relative flex items-center justify-center"
                  >
                    {/* Verified badge - Twitter/X style */}
                    <svg
                      className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                      viewBox="0 0 22 22"
                      aria-label="Verified"
                    >
                      <defs>
                        <linearGradient id="verifiedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#1D4ED8" />
                        </linearGradient>
                      </defs>
                      <path
                        fill="url(#verifiedGradient)"
                        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                {profileData?.title || ""}
              </span>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
