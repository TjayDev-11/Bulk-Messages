'use client';

import Link from 'next/link';
import { Button } from '../components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { Send, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name || session?.user?.email || '';
  const firstLetter = userName.charAt(0).toUpperCase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  // Auto-close dropdown after 3 seconds
  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isProfileOpen) {
      timer = setTimeout(() => {
        setIsProfileOpen(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isProfileOpen]);

  return (
    <header className="bg-white shadow-lg py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900 transition-transform hover:scale-105">
          <Send className="h-6 w-6 text-blue-500" />
          Bulk SMS
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center relative">
          {status === 'authenticated' ? (
            <>
              <Link href="/send-sms">
                <Button variant="ghost" className="text-gray-900 hover:bg-blue-100/50">Send SMS</Button>
              </Link>
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100/50 text-gray-900 font-semibold transition-transform hover:scale-110"
                >
                  {firstLetter}
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-blue-100/50"
                    >
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-gray-900 hover:bg-blue-100/50 rounded-lg"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-900 hover:bg-blue-100/50 rounded-lg"
                        onClick={() => {
                          signOut();
                          setIsProfileOpen(false);
                        }}
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-blue-200/50 text-gray-900 hover:bg-blue-100/50">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-500 text-white hover:bg-blue-600">Signup</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-900" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white py-4">
          <div className="container mx-auto px-4 flex flex-col gap-4">
            {status === 'authenticated' ? (
              <>
                <Link href="/send-sms" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full text-gray-900 hover:bg-blue-100/50">Send SMS</Button>
                </Link>
                <Link href="/dashboard" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full text-gray-900 hover:bg-blue-100/50">Dashboard</Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-gray-900 hover:bg-blue-100/50"
                  onClick={() => {
                    signOut();
                    toggleMenu();
                  }}
                >
                  Logout
                </Button>
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100/50 text-gray-900 font-semibold">
                    {firstLetter}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full border-blue-200/50 text-gray-900 hover:bg-blue-100/50">Login</Button>
                </Link>
                <Link href="/signup" onClick={toggleMenu}>
                  <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">Signup</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}