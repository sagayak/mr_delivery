import React, { useMemo } from 'react';
import { Order } from '../types';
import { BoxIcon, CurrencyRupeeIcon, CurryIcon, RotiIcon } from './icons';

interface ReportCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const Reports: React.FC<{ orders: Order[] }> = ({ orders }) => {
    const reportData = useMemo(() => {
        let totalRevenue = 0;
        let totalRotis = 0;
        let totalCurries = 0;
        let totalMealboxes = 0;
        let totalMealboxPlus = 0;

        orders.forEach(order => {
            totalRevenue += order.totalAmount;

            const items = order.items.split(',').map(item => item.trim());

            items.forEach(itemStr => {
                const match = itemStr.match(/(.+) \(x(\d+)\)/);
                let itemName = itemStr;
                let quantity = 1;

                if (match) {
                    itemName = match[1].trim();
                    quantity = parseInt(match[2], 10);
                }

                const lowerItemName = itemName.toLowerCase();

                if (lowerItemName.includes('mealbox plus')) {
                    totalRotis += 3 * quantity;
                    totalCurries += 1 * quantity;
                    totalMealboxPlus += quantity;
                } else if (lowerItemName.includes('mealbox')) {
                    totalRotis += 2 * quantity;
                    totalCurries += 1 * quantity;
                    totalMealboxes += quantity;
                } else if (lowerItemName.includes('roti')) {
                    totalRotis += quantity;
                } else if (lowerItemName.includes('curry')) {
                    totalCurries += quantity;
                }
            });
        });

        return {
            totalRevenue,
            totalRotis,
            totalCurries,
            totalMealboxes,
            totalMealboxPlus,
        };
    }, [orders]);

    return (
        <section className="mb-6 bg-slate-800/50 rounded-lg p-4 shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Consolidated Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <ReportCard 
                    title="Total Revenue"
                    value={`₹${reportData.totalRevenue.toLocaleString('en-IN')}`}
                    icon={<CurrencyRupeeIcon className="w-6 h-6 text-slate-900" />}
                    color="bg-amber-400"
                />
                <ReportCard 
                    title="Total Rotis"
                    value={reportData.totalRotis}
                    icon={<RotiIcon className="w-6 h-6 text-slate-900" />}
                    color="bg-orange-400"
                />
                <ReportCard 
                    title="Total Curries"
                    value={reportData.totalCurries}
                    icon={<CurryIcon className="w-6 h-6 text-slate-900" />}
                    color="bg-red-400"
                />
                <ReportCard 
                    title="Mealboxes"
                    value={reportData.totalMealboxes}
                    icon={<BoxIcon className="w-6 h-6 text-slate-900" />}
                    color="bg-green-400"
                />
                <ReportCard 
                    title="Mealbox Plus"
                    value={reportData.totalMealboxPlus}
                    icon={<BoxIcon className="w-6 h-6 text-slate-900" />}
                    color="bg-teal-400"
                />
            </div>
        </section>
    );
};

export default Reports;
