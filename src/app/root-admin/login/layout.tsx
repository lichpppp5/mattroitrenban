// Login page should not have admin layout or root navigation
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
