import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { RideLanding } from "./pages/RideLanding";
import { Dashboard } from "./pages/Dashboard";
import { KycQueue } from "./pages/KycQueue";
import { Transactions } from "./pages/Transactions";
import { Analytics } from "./pages/Analytics";
import { Aml } from "./pages/Aml";
import { Drivers } from "./pages/Drivers";
import { Rides } from "./pages/Rides";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RideLanding />} />
      <Route path="/send" element={<Landing />} />
      <Route path="/ride" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/kyc" element={<KycQueue />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/aml" element={<Aml />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/drivers" element={<Drivers />} />
      </Route>
    </Routes>
  );
}
