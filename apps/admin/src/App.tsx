import { NavLink, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { KycQueue } from "./pages/KycQueue";
import { Transactions } from "./pages/Transactions";
import { Analytics } from "./pages/Analytics";
import { Aml } from "./pages/Aml";

const link = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? "#00c896" : "#8b9bb4",
  textDecoration: "none",
  fontWeight: 600,
});

export default function App() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "#152238",
          padding: 24,
          borderRight: "1px solid #2a3f5f",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 32 }}>DukorPay</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <NavLink to="/" end style={link}>
            Overview
          </NavLink>
          <NavLink to="/transactions" style={link}>
            Transactions
          </NavLink>
          <NavLink to="/kyc" style={link}>
            KYC queue
          </NavLink>
          <NavLink to="/analytics" style={link}>
            Revenue
          </NavLink>
          <NavLink to="/aml" style={link}>
            AML flags
          </NavLink>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 32 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/kyc" element={<KycQueue />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/aml" element={<Aml />} />
        </Routes>
      </main>
    </div>
  );
}
