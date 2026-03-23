
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  FileText,
  Users,
  MapPin,
  HelpCircle,
  MessageSquare,
  Mail,
  ArrowLeft,
  Palette,
  LogOut,
  BrainCircuit,
  GalleryHorizontal,
  Calendar,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { SheetTitle } from '../ui/sheet';

const menuItems = [
  { href: '/admin/appointments', label: 'Appointment Requests', icon: Mail },
  { href: '/admin/hero', label: 'Hero Section', icon: Home },
  { href: '/admin/about', label: 'About Section', icon: FileText },
  { href: '/admin/artists', label: 'Artists Section', icon: Users },
  { href: '/admin/gallery', label: 'Gallery Section', icon: GalleryHorizontal },
  { href: '/admin/appointment-content', label: 'Appointment Section', icon: Calendar },
  { href: '/admin/location', label: 'Location Section', icon: MapPin },
  { href: '/admin/faq', label: 'FAQ Section', icon: HelpCircle },
  { href: '/admin/chatbot-knowledge', label: 'Chatbot Knowledge', icon: BrainCircuit },
  { href: '/admin/footer', label: 'Footer Section', icon: MessageSquare },
  { href: '/admin/theme', label: 'Theme', icon: Palette },
  { href: '/admin/privacy-policy', label: 'Privacy Policy', icon: Shield },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mt-4">
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                 <Home className="h-6 w-6" />
                 <span className="text-xl font-semibold">Admin Panel</span>
            </div>
            <SidebarTrigger className="md:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href} className="border-b last:border-b-0">
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                  className={cn(
                      'transition-transform duration-200 ease-in-out hover:scale-105',
                      item.href === '/admin/appointments' && 'text-orange-500 hover:text-orange-400 data-[active=true]:text-orange-400',
                  )}
                >
                  <span>
                    <item.icon />
                    <span>{item.label}</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2">
            <LogOut />
            <span>Logout</span>
         </Button>
         <Link href="/">
            <Button variant="outline" className="w-full justify-start gap-2">
                <ArrowLeft />
                <span>Back to Site</span>
            </Button>
         </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

    