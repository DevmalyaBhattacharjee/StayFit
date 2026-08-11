import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/contexts/auth-context";
import { AppRoutes } from "@/routes/app-routes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
