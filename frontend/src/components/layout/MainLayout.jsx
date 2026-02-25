import React from "react";
import Header from "../Header";
import Footer from "../Footer";

const MainLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="main-layout">
      {showHeader && <Header />}
      <main className="min-h-screen">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
