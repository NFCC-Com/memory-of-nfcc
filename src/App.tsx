import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Admin from "./pages/Admin.tsx";
import EventPage from "./pages/EventPage.tsx";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import PhotoPage from "./pages/PhotoPage.tsx";
import { Button } from "./components/ui/button.tsx";

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-28 text-center">
      <p className="font-mono text-xs text-[#787774]">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111]">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-[#787774]">Tautan salah atau halaman sudah tidak tersedia.</p>
      <div className="mt-6 flex justify-center">
        <Button asChild>
          <Link to="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-[#2F3437] selection:bg-[#EAEAEA]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/p/:slug" element={<EventPage />} />
          <Route path="/p/:slug/photo/:id" element={<PhotoPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
