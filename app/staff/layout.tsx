import StaffGuard from '@/components/auth/StaffGuard';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffGuard>
      <div className="min-h-screen bg-[#f5f6fa] flex">
        {children}
      </div>
    </StaffGuard>
  );
}
