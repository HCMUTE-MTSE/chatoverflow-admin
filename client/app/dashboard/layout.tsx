'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '@/app/ui/dashboard/sidenav';
import { isAuthenticated } from '@/app/lib/storage';
import { Toaster } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
   const router = useRouter();

   useEffect(() => {
      if (!isAuthenticated()) {
         router.push('/login');
      }
   }, [router]);

   return (
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
         <div className="w-full flex-none md:w-64">
            <SideNav />
         </div>
         <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
            {children}
         </div>
         <Toaster />
      </div>
   );
}
