import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ConnectWalletButton } from '../domain/ConnectWalletButton';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const location = useLocation();
  const { isAuthenticated, isOrganizer, isAdmin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [
        { to: '/events', label: 'Events' },
        { to: '/marketplace', label: 'Marketplace' },
        { to: '/my-tickets', label: 'My Tickets' },
        ...(isOrganizer ? [{ to: '/my-events', label: 'My Events' }] : []),
        ...(isAdmin ? [{ to: '/admin/users', label: 'Users' }] : []),
      ]
    : [];

  const close = () => setDrawerOpen(false);

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2" onClick={close}>
              <img src="/logo.svg" alt="TicketChain" className="h-8 w-8" />
              <span className="hidden sm:block text-xl font-bold text-black tracking-tight">
                TicketChain
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm transition-colors ${
                    location.pathname.startsWith(link.to)
                      ? 'text-black font-medium'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ConnectWalletButton />
            </div>
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TicketChain" className="h-8 w-8" />
            <span className="text-lg font-bold text-black tracking-tight">
              TicketChain
            </span>
          </div>
          <button
            onClick={close}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-4 gap-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={close}
              className={`block py-3 px-3 rounded-md text-sm transition-colors ${
                location.pathname.startsWith(link.to)
                  ? 'text-black font-medium bg-gray-50'
                  : 'text-gray-500 hover:text-black hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-gray-100">
          <ConnectWalletButton />
        </div>
      </aside>
    </>
  );
}
