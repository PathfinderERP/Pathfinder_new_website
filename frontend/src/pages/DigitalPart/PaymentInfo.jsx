import React, { useEffect, useState } from "react";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { coursesAPI, studentCornerAPI } from "../../services/api";

const PaymentInfo = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const [courseRes, scRes] = await Promise.all([
                    coursesAPI.getMyCourses(),
                    studentCornerAPI.getMyOrders()
                ]);

                // 1. Process Course Payments
                const coursePayments = courseRes.data.map(course => {
                    const info = course.payment_info || {};
                    return {
                        id: info.payment_id || `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                        itemName: course.name,
                        type: 'Course',
                        amount: info.amount_paid || 0,
                        date: info.date || course.enrolled_at || new Date().toISOString(),
                        status: info.status || course.enrollment_status || 'completed'
                    };
                });

                // 2. Process Student Corner Payments
                const scPayments = scRes.data.map(order => ({
                    id: order.payment_id || `ORD-${order.id?.substring(0, 8)}`,
                    itemName: order.items?.length > 1 ? `${order.items[0].name} + ${order.items.length - 1} more` : (order.items[0]?.name || 'Materials'),
                    type: 'Student Corner',
                    amount: order.total_amount || 0,
                    date: order.created_at,
                    status: order.payment_status || 'completed'
                }));

                // Combine and sort by date descending
                const allPayments = [...coursePayments, ...scPayments].sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );

                setPayments(allPayments);
            } catch (error) {
                console.error("Failed to fetch payments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-40 lg:pt-36 pb-12 sm:pb-16 2xl:max-w-7xl 2xl:mx-auto 2xl:shadow-2xl 2xl:rounded-[60px] 2xl:my-8 2xl:border 2xl:border-slate-100">
            <StudentSidebar />
            <main className="flex-1 flex flex-col gap-6 max-w-full overflow-hidden">
                <header className="mb-4">
                    <h1 className="text-3xl font-bold text-slate-900">Payment Information</h1>
                    <p className="text-slate-500">Track your fees and payment history</p>
                </header>

                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 min-h-[400px]">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-slate-500">Loading payment history...</p>
                        </div>
                    ) : payments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-4 px-4 font-semibold text-slate-600">Transaction ID</th>
                                        <th className="pb-4 px-4 font-semibold text-slate-600">Product/Course</th>
                                        <th className="pb-4 px-4 font-semibold text-slate-600">Category</th>
                                        <th className="pb-4 px-4 font-semibold text-slate-600">Date</th>
                                        <th className="pb-4 px-4 font-semibold text-slate-600">Amount</th>
                                        <th className="pb-4 px-4 font-semibold text-slate-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {payments.map((payment, index) => (
                                        <tr key={index} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">#{payment.id}</td>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-slate-900 leading-tight">{payment.itemName}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${payment.type === 'Course' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {payment.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 font-medium">{formatDate(payment.date)}</td>
                                            <td className="py-4 px-4 font-black text-slate-900">₹{payment.amount.toLocaleString()}</td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${payment.status === 'completed' || payment.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="bg-orange-50 p-6 rounded-full mb-6">
                                <CreditCardIcon className="h-16 w-16 text-orange-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Payment Records Yet</h2>
                            <p className="text-slate-500 max-w-md">
                                You haven't made any payments through the digital portal yet.
                                Your offline payment history will be synced here shortly.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PaymentInfo;
