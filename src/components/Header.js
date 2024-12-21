'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';

const Header = ({ hideLogoOnHome }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/CurrentlyAvailable', label: 'Currently Available' },
    { path: '/CheckAvailability', label: 'Check Availability' },
    { path: '/Graph', label: 'Graph' },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Toggle body scroll
    document.body.style.overflow = menuOpen ? 'auto' : 'hidden';
  };

  return (
    <>
      {/* Dark overlay for entire page */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-lg transition-all duration-300 ${
          menuOpen ? 'opacity-100 visible z-[40]' : 'opacity-0 invisible -z-10'
        }`}
        onClick={toggleMenu}
      />

      <header className="w-full h-16 bg-background text-foreground fixed top-0 left-0 z-50 backdrop-blur-md bg-opacity-60">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            {!hideLogoOnHome && (
              <Link href="/" legacyBehavior>
                <a className="flex items-center gap-2 relative z-[60]">
                  <Image src="/logo.png" alt="Logo" width={112} height={112} />
                  <span className="sr-only">Home</span>
                </a>
              </Link>
            )}
          </div>
          
          {/* Hamburger Button */}
          <button
            className="md:hidden z-[70] w-10 h-10 flex flex-col justify-center items-center gap-1.5"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span 
              className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                menuOpen ? 'transform rotate-45 translate-y-2' : ''
              }`}
            />
            <span 
              className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span 
              className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                menuOpen ? 'transform -rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path} legacyBehavior>
                <a>
                  <Button isActive={router.pathname === link.path}>
                    {link.label}
                  </Button>
                </a>
              </Link>
            ))}
          </nav>
          <style jsx>{`
            .nav-link {
              border-color: #482f1f;
              color: white;
            }
            .nav-link:hover {
              border-color: #006D5B;
            }
            .nav-link.active {
              border-color: #006D5B;
              color: #006D5B;
            }
          `}</style>
        </div>

        {/* Mobile Navigation Menu */}
        <nav
          className={`fixed top-0 right-0 bottom-0 w-64 bg-background shadow-xl transform transition-transform duration-300 ease-in-out md:hidden z-[60] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col pt-20 px-4">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path} legacyBehavior>
                <a
                  className={`py-3 px-4 mb-2 rounded-lg transition-all duration-200 ease-in-out ${
                    router.pathname === link.path
                      ? 'bg-foreground/10'
                      : 'hover:bg-foreground/5'
                  }`}
                  onClick={() => {
                    setMenuOpen(false);
                    document.body.style.overflow = 'auto';
                  }}
                >
                  <span className="text-lg font-semibold">{link.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;