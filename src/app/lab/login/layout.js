export const metadata = {
  title: "Lab Login",
};

export default function LabLoginLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      {children}
    </div>
  );
}