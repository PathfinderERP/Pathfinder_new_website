import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { centresAPI } from "../../services/api";
import CentreDetails from "../../components/Centres/CentreDetails";
import MainLayout from "../../components/layout/MainLayout";

const CentreDetailPage = () => {
    const { id } = useParams();
    const [centre, setCentre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCentre = async () => {
            try {
                setLoading(true);
                // We'll use the getAll and find by ID for now, or use a specific getById if it exists
                const response = await centresAPI.getAll();
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                const found = data.find(c => c.id === id || c.centre_code === id);

                if (found) {
                    setCentre(found);
                } else {
                    setError("Centre not found.");
                }
            } catch (err) {
                console.error("Error fetching centre details:", err);
                setError("Failed to load centre data.");
            } finally {
                setLoading(false);
            }
        };

        fetchCentre();
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="py-20 flex flex-col items-center justify-center min-h-screen">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Loading Centre Profile...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="py-20 text-center min-h-screen flex flex-col items-center justify-center">
                    <h2 className="text-4xl font-black text-slate-900 mb-4">{error}</h2>
                    <button onClick={() => window.history.back()} className="text-orange-600 font-bold underline">Go Back</button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <CentreDetails centre={centre} />
        </MainLayout>
    );
};

export default CentreDetailPage;
