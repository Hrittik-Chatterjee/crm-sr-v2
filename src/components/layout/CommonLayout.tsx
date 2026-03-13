import { Toaster } from "sonner";

interface CommonLayoutProps {
  children: React.ReactNode;
}

export default function CommonLayout({ children }: CommonLayoutProps) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors duration={Infinity} closeButton />
    </>
  );
}
