import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Heart, User, Menu, Sun, Moon, Globe, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../i18n';
import { useGetCart } from '../../hooks/queries/useCartWishlist';
import { useGetSiteSettings } from '../../hooks/queries/useSiteSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, FormEvent } from 'react';

export default function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const { data: cart } = useGetCart();
  const { data: siteSettings, isLoading: siteSettingsLoading } = useGetSiteSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const cartItemCount = cart?.items.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;

  // Enforce BISAULI branding
  const shopName = 'BISAULI';
  const logoUrl = siteSettings?.logo || '';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/catalog', search: { q: searchQuery.trim() } });
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/catalog', label: t('nav.catalog') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        {/* Main header row */}
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {!siteSettingsLoading && logoUrl ? (
              <img 
                src={logoUrl} 
                alt={shopName} 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  const textFallback = e.currentTarget.nextElementSibling;
                  if (textFallback) {
                    (textFallback as HTMLElement).style.display = 'inline';
                  }
                }}
              />
            ) : null}
            <span 
              className="text-xl font-bold" 
              style={{ display: logoUrl && !siteSettingsLoading ? 'none' : 'inline' }}
            >
              {shopName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
                activeProps={{
                  className: 'text-primary',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search - visible on larger screens */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex shrink-0">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  {t('theme.light')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  {t('theme.dark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  {t('theme.system')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')}>
                  हिन्दी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">{t('nav.profile')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">{t('nav.orders')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleAuth} disabled={isLoggingIn}>
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={handleAuth} disabled={isLoggingIn}>
                    {isLoggingIn ? t('auth.loggingIn') : t('auth.login')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Cart & Menu */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            {/* Mobile Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 py-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={t('search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile User Actions */}
                  <div className="space-y-2 border-t pt-4">
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          {t('nav.profile')}
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          {t('nav.orders')}
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          {t('nav.wishlist')}
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            handleAuth();
                            setMobileMenuOpen(false);
                          }}
                          disabled={isLoggingIn}
                        >
                          {t('auth.logout')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => {
                          handleAuth();
                          setMobileMenuOpen(false);
                        }}
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? t('auth.loggingIn') : t('auth.login')}
                      </Button>
                    )}
                  </div>

                  {/* Mobile Theme & Language */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm font-medium">{t('theme.title')}</span>
                      <div className="flex gap-1">
                        <Button
                          variant={theme === 'light' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={theme === 'dark' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm font-medium">Language</span>
                      <div className="flex gap-1">
                        <Button
                          variant={language === 'en' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setLanguage('en')}
                        >
                          EN
                        </Button>
                        <Button
                          variant={language === 'hi' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setLanguage('hi')}
                        >
                          हिं
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
