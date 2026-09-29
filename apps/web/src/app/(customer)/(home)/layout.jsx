import "leaflet/dist/leaflet.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomerFloatingButtons from "@/components/common/CustomerFloatingButtons";

export default function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CustomerFloatingButtons />
    </div>
  );
}
