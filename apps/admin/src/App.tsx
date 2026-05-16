import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { KycQueue } from "./pages/KycQueue";
import { Transactions } from "./pages/Transactions";
import { Analytics } from "./pages/Analytics";
import { Aml } from "./pages/Aml";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/kyc" element={<KycQueue />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/aml" element={<Aml />} />
      </Route>
    </Routes>
  );
}
