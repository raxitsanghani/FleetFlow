import { Truck, Wrench, Fuel, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
    TRIP: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    MAINTENANCE: { icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
    FUEL: { icon: Fuel, color: 'text-purple-600', bg: 'bg-purple-50' }
};

const ActivityFeed = ({ activities = [] }) => {
    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Clock size={40} className="mb-2 opacity-20" />
                <p className="text-sm italic">No recent activity detected</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {activities.map((activity) => {
                const config = iconMap[activity.type] || iconMap.TRIP;
                const Icon = config.icon;
                const isPositive = activity.amount?.startsWith('+');

                return (
                    <div key={activity.id} className="flex items-start space-x-4">
                        <div className={`p-2.5 rounded-xl ${config.bg} ${config.color} shrink-0`}>
                            <Icon size={20} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {activity.title}
                                </p>
                                {activity.amount && (
                                    <span className={`text-xs font-bold flex items-center shrink-0 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {activity.amount}
                                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate uppercase tracking-tight">
                                {activity.description}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center">
                                <Clock size={10} className="mr-1" />
                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivityFeed;
