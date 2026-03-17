import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FilterProvider } from "./contexts/FilterContext";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./contexts/CartContext";
import ScrollToTop from "./components/ScrollToTop";

import { ThemeProvider } from "./contexts/ThemeContext";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <FilterProvider>
          <ThemeProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <div className="App relative">
                {/* Debug info in development */}
                {/* {import.meta.env.VITE_DEBUG === "true" && (
                  <div className="bg-yellow-100 text-yellow-800 text-center py-1 text-xs">
                    {import.meta.env.VITE_APP_TITLE} -{" "}
                    {import.meta.env.VITE_API_BASE_URL}
                  </div>
                )} */}

                {/* Routes handle their own layouts now */}
                <AppRoutes />
              </div>
            </Router>
          </ThemeProvider>
        </FilterProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
