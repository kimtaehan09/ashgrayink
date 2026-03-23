// This layout is intentionally left blank.
// The login page does not have a sidebar, and the rest of the
// admin section is in the (admin) route group which has its own layout.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
