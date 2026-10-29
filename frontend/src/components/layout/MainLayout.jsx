import React from "react";
import Header from "../Header";
import Footer from "../Footer";

const MainLayout = ({ children, showHeader = true, showFooter = true }) => {
  const [width, setWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="main-layout relative">
      {showHeader && <Header />}
      <main 
        className="min-h-screen" 
        style={{ 
          paddingTop: showHeader ? `var(--header-total-height, calc(var(--announcement-height, 0px) + ${width < 1024 ? '72px' : '148px'}))` : '0px'
        }}
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
