import React, { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [globalSelectedCentre, setGlobalSelectedCentre] = useState("All");

    return (
        <FilterContext.Provider value={{ globalSelectedCentre, setGlobalSelectedCentre }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
};
