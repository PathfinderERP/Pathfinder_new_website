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
          paddingTop: `calc(var(--announcement-height, 48px) + ${width < 768 ? '100px' : '170px'})` 
        }}
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
