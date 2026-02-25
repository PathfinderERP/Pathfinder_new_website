import React from "react";

const PageLayout = ({
  children,
  className = "",
  containerClassName = "",
  fullWidth = false,
  withPadding = true,
}) => {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {/* Minimal Header Spacer */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        {/* Mobile Small */}
        <div className="xs:hidden h-[60px]"></div>
        {/* Mobile Large */}
        <div className="hidden xs:block sm:hidden h-[5px]"></div>
        {/* Tablet Small */}
        <div className="hidden sm:block md:hidden h-[5px]"></div>
        {/* Tablet */}
        <div className="hidden md:block lg:hidden h-[10px]"></div>
        {/* Desktop Small */}
        <div className="hidden lg:block xl:hidden h-[67px]"></div>
        {/* Desktop Medium */}
        <div className="hidden xl:block 2xl:hidden h-[75px]"></div>
        {/* Large Desktop */}
        <div className="hidden 2xl:block h-[90px]"></div>
      </div>

      {/* Main Content Area */}
      {/* <main className="relative z-10">
        {fullWidth ? (
          <div className={withPadding ? "px-3 xs:px-4 sm:px-5 md:px-6" : ""}>
            {children}
          </div>
        ) : (
          <div className={`max-w-8xl mx-auto ${withPadding ? "px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8" : ""} ${containerClassName}`}>
            {children}
          </div>
        )}
      </main> */}
      <main className="relative z-10">
        {fullWidth ? (
          <div className={withPadding ? "px-3 xs:px-4 sm:px-5 md:px-6" : ""}>
            {children}
          </div>
        ) : (
          <div
            className={`max-w-8xl mx-auto ${
              withPadding ? "px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8" : ""
            } ${containerClassName}`}
          >
            {children}
          </div>
        )}
      </main>
    </div>
  );
};

export default PageLayout;
