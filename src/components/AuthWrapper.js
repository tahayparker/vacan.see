import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import Header from './Header';
import Footer from './Footer';

const styles = {
  glowButton: {
    position: "relative",
    overflow: "hidden"
  }
};

const AuthWrapper = ({ children }) => {
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const [lastAuthTime, setLastAuthTime] = useState(null);

  // Separate effect for initial authorization and logging
  useEffect(() => {
    const checkAuthorization = async () => {
      if (session?.user?.email) {
        const response = await fetch('/api/check-authorization', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: session.user.email }),
        });

        // Determine provider from image URL
        const provider = session.user.image?.toLowerCase().includes('google') 
          ? 'GOOGLE' 
          : session.user.image?.toLowerCase().includes('github')
            ? 'GITHUB'
            : 'UNDETERMINED';

        if (response.ok) {
          setIsAuthorized(true);
          setLastAuthTime(new Date());
          
          // Log sign in
          await fetch('/api/log-signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              success: true,
              provider
            }),
          });
        } else {
          setIsAuthorized(false);
          // Log unauthorized attempt
          await fetch('/api/log-signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              success: false,
              provider
            }),
          });
          router.push('/unauthorized');
        }
      }
    };

    if (session) {
      checkAuthorization();
    }
  }, [session, router]); // Removed lastAuthTime from dependencies

  // Separate effect for checking expiration
  useEffect(() => {
    const checkExpiration = () => {
      const now = new Date();
      if (lastAuthTime && (now.getTime() - lastAuthTime.getTime()) > 20 * 60 * 1000) {
        setIsAuthorized(false);
        router.push('/unauthorized');
      }
    };

    const interval = setInterval(checkExpiration, 60 * 1000);
    return () => clearInterval(interval);
  }, [lastAuthTime, router]);

  // Store auth time in localStorage to persist across refreshes
  useEffect(() => {
    if (lastAuthTime) {
      localStorage.setItem('lastAuthTime', lastAuthTime.toISOString());
    }
  }, [lastAuthTime]);

  // Load auth time from localStorage on mount
  useEffect(() => {
    const storedAuthTime = localStorage.getItem('lastAuthTime');
    if (storedAuthTime) {
      setLastAuthTime(new Date(storedAuthTime));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const buttons = document.querySelectorAll('.glow-button');

    const handleMouseMove = (e, button) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    };

    const handleMouseLeave = (button) => {
      button.style.setProperty('--x', '50%');
      button.style.setProperty('--y', '50%');
    };

    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => handleMouseMove(e, button));
      button.addEventListener('mouseleave', () => handleMouseLeave(button));
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mousemove', (e) => handleMouseMove(e, button));
        button.removeEventListener('mouseleave', () => handleMouseLeave(button));
      });
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006D5B]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-8 -mt-24">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">Protected Content</h1>
              <p className="text-gray-400 max-w-2xl">
                This page contains sensitive information and requires authentication. 
                Please sign in with your authorized account to access this page.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-md">
              <button
                onClick={() => signIn('google')}
                className="glow-button w-full px-6 py-3 border-2 border-[#482f1f] text-white rounded-full hover:text-white transition-all duration-200 flex items-center justify-center whitespace-nowrap"
                style={styles.glowButton}
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="flex-shrink-0">Sign in with Google</span>
              </button>

              <button
                onClick={() => signIn('github')}
                className="glow-button w-full px-6 py-3 border-2 border-[#482f1f] text-white rounded-full hover:text-white transition-all duration-200 flex items-center justify-center whitespace-nowrap"
                style={styles.glowButton}
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  />
                </svg>
                <span className="flex-shrink-0">Sign in with GitHub</span>
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      
      <style jsx>{`
        .glow-button::before {
          content: '';
          position: absolute;
          top: var(--y, 50%);
          left: var(--x, 50%);
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(0, 109, 91, 0.3) 0%, transparent 60%);
          transition: opacity 0.2s;
          transform: translate(-50%, -50%);
          pointer-events: none;
          opacity: 0;
          z-index: 0;
        }

        .glow-button:hover::before {
          opacity: 1;
        }

        .glow-button > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
      </>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return children;
};

export default AuthWrapper; 