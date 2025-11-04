export const metadata = {
  title: "Chemist Login",
};

export default function ChemistLoginLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      {children}
    </div>
  );
}