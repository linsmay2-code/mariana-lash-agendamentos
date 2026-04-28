import React from 'react';
import { User } from '../types';
import { LogIn, LogOut, Menu, X, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onAdminClick: () => void;
  onHomeClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, onLoginClick, onLogoutClick, onAdminClick, onHomeClick 
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-dark bg-stone-50">
      <header className="sticky top-0 z-50 glass-panel shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={onHomeClick}>
              <Sparkles className="h-8 w-8 text-brand-600 mr-2" />
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900 leading-none">
                  Mariana<span className="text-brand-600">LashBeauty</span>
                </h1>
                <p className="text-xs text-gray-500 tracking-widest uppercase">Extensão de Cílios</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={onHomeClick} className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                Início
              </button>
              
              {user?.role === 'admin' && (
                <button 
                  onClick={onAdminClick}
                  className="text-gray-600 hover:text-brand-600 font-medium transition-colors"
                >
                  Gestão
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Olá, {user.name.split(' ')[0]}</span>
                  <button 
                    onClick={onLogoutClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="flex items-center gap-2 bg-brand-900 text-white px-6 py-2 rounded-full hover:bg-brand-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <button 
                onClick={() => { onHomeClick(); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-rose-50 rounded-md"
              >
                Início
              </button>
              
              {user?.role === 'admin' && (
                <button 
                  onClick={() => { onAdminClick(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-rose-50 rounded-md"
                >
                  Gestão
                </button>
              )}

              {user ? (
                <button 
                  onClick={() => { onLogoutClick(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sair ({user.name})
                </button>
              ) : (
                <button 
                  onClick={() => { onLoginClick(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-brand-600 hover:bg-rose-50 rounded-md"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-brand-dark text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl mb-4">Mariana Lash Beauty</h3>
            <p className="text-gray-400 text-sm">Realçando sua beleza natural com técnicas exclusivas e atendimento personalizado.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-wider text-gray-500">Contato</h4>
            <p className="text-gray-300 mb-2">WhatsApp: (85) 98472-0033</p>
            <p className="text-gray-300">Email: marianabaia2013@gmail.com</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-wider text-gray-500">Horário</h4>
            <p className="text-gray-300">Seg - Sex: 10:00 - 20:00</p>
            <p className="text-gray-300">Sáb: 10:00 - 15:00</p>
          </div>
        </div>
      </footer>
    </div>
  );
};