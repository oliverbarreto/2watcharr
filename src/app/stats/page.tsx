'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout';
import { 
    Video, 
    Mic, 
    Hash, 
    Users, 
    TrendingUp, 
    BarChart3, 
    Clock, 
    Calendar,
    Play,
    Plus,
    Star,
    Trash2,
    Tag as TagIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Table, 
    TableHeader, 
    TableBody, 
    TableHead, 
    TableRow, 
    TableCell 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
    ChartContainer, 
    ChartTooltip, 
    ChartTooltipContent 
} from '@/components/ui/chart';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid
} from 'recharts';

interface DashboardStats {
    counts: {
        totalVideos: number;
        totalPodcasts: number;
        totalChannels: number;
        totalTags: number;
    };
    usage: {
        added: number;
        watched: number;
        favorited: number;
        removed: number;
        tagged: number;
    };
    playTime: {
        totalSeconds: number;
        averageSecondsPerVideo: number;
        thisWeekSeconds: number;
        thisMonthSeconds: number;
    };
    activityTimeSeries: {
        date: string;
        added: number;
        watched: number;
    }[];
    detailedStats: {
        title: string;
        type: string;
        event_type: string;
        created_at: number;
    }[];
}

export default function StatsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'total'>('month');

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/stats?period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatDetailedDuration = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

        return parts.join(' ');
    };

    if (isLoading && !stats) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    if (!stats) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                        <BarChart3 className="h-12 w-12" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Failed to load statistics</h2>
                        <p className="text-muted-foreground">There was an error loading your usage data.</p>
                    </div>
                    <Button onClick={fetchStats} variant="outline">Try Again</Button>
                </div>
            </Layout>
        );
    }

    const chartConfig = {
        added: {
            label: "Added",
            color: "#3b82f6",
        },
        watched: {
            label: "Watched",
            color: "#22c55e",
        },
    };

    const periodLabels = {
        day: "Last 24 Hours",
        week: "This Week",
        month: "This Month",
        year: "This Year",
        total: "All Time"
    };

    return (
        <Layout>
            <div className="animate-in fade-in duration-500 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Usage Statistics</h1>
                        <p className="text-muted-foreground">Detailed insights into your watch history and library.</p>
                    </div>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard 
                        title="Total Videos" 
                        value={stats.counts.totalVideos} 
                        icon={<Video className="h-5 w-5" />}
                        description="Videos in your watch list"
                        color="text-red-500"
                        bg="bg-red-500/10"
                    />
                    <StatCard 
                        title="Total Podcasts" 
                        value={stats.counts.totalPodcasts} 
                        icon={<Mic className="h-5 w-5" />}
                        description="Podcasts in your watch list"
                        color="text-purple-500"
                        bg="bg-purple-500/10"
                    />
                    <StatCard 
                        title="Channels" 
                        value={stats.counts.totalChannels} 
                        icon={<Users className="h-5 w-5" />}
                        description="Followed sources"
                        color="text-blue-500"
                        bg="bg-blue-500/10"
                    />
                    <StatCard 
                        title="Tags" 
                        value={stats.counts.totalTags} 
                        icon={<Hash className="h-5 w-5" />}
                        description="Unique categories"
                        color="text-emerald-500"
                        bg="bg-emerald-500/10"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Summary (Side List) */}
                    <Card className="lg:col-span-1 border-none bg-card/50 backdrop-blur-sm self-start shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Activity Summary
                            </CardTitle>
                            <CardDescription>{periodLabels[period]}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <UsageItem 
                                label="Added" 
                                value={stats.usage.added} 
                                icon={<Plus className="h-4 w-4" />} 
                                color="text-blue-500"
                                bg="bg-blue-500/10"
                            />
                            <UsageItem 
                                label="Watched" 
                                value={stats.usage.watched} 
                                icon={<Play className="h-4 w-4" />} 
                                color="text-green-500"
                                bg="bg-green-500/10"
                            />
                            <UsageItem 
                                label="Favorited" 
                                value={stats.usage.favorited} 
                                icon={<Star className="h-4 w-4" />} 
                                color="text-amber-500"
                                bg="bg-amber-500/10"
                            />
                            <UsageItem 
                                label="Tagged" 
                                value={stats.usage.tagged} 
                                icon={<TagIcon className="h-4 w-4" />} 
                                color="text-indigo-500"
                                bg="bg-indigo-500/10"
                            />
                            <UsageItem 
                                label="Removed" 
                                value={stats.usage.removed} 
                                icon={<Trash2 className="h-4 w-4" />} 
                                color="text-red-500"
                                bg="bg-red-500/10"
                            />
                        </CardContent>
                    </Card>

                    {/* Charts Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Play Time Stats */}
                        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Viewing Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                    <div className="p-4 rounded-2xl bg-muted/30 flex flex-col items-center text-center transition-colors hover:bg-muted/40">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Time</p>
                                        <p className="text-2xl font-black text-primary tracking-tighter">{formatDetailedDuration(stats.playTime.totalSeconds)}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/30 flex flex-col items-center text-center transition-colors hover:bg-muted/40">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">This Week</p>
                                        <p className="text-2xl font-black tracking-tighter">{formatDuration(stats.playTime.thisWeekSeconds)}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/30 flex flex-col items-center text-center transition-colors hover:bg-muted/40">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg/Video</p>
                                        <p className="text-2xl font-black tracking-tighter">{formatDuration(stats.playTime.averageSecondsPerVideo)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Timeline Chart */}
                        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
                            <CardHeader className="flex items-center gap-2 space-y-0 border-b border-border/10 py-5 sm:flex-row">
                                <div className="grid flex-1 gap-1">
                                    <CardTitle className="text-lg font-bold">Activity Trend</CardTitle>
                                    <CardDescription>{periodLabels[period]} visualization</CardDescription>
                                </div>
                                <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                                    <SelectTrigger className="w-[160px] rounded-lg bg-muted/20 border-border/50">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-zinc-950/90 backdrop-blur-md border-zinc-800">
                                        <SelectItem value="day" className="rounded-lg">Today</SelectItem>
                                        <SelectItem value="week" className="rounded-lg">Last 7 days</SelectItem>
                                        <SelectItem value="month" className="rounded-lg">Last 30 days</SelectItem>
                                        <SelectItem value="year" className="rounded-lg">This Year</SelectItem>
                                        <SelectItem value="total" className="rounded-lg">All Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                                <ChartContainer config={chartConfig} className="aspect-[16/6] w-full">
                                    <AreaChart
                                        data={stats.activityTimeSeries}
                                        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="fillAdded" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="fillWatched" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                if (period === 'day') {
                                                    return date.toLocaleTimeString("en-US", { hour: 'numeric' });
                                                }
                                                if (period === 'year' || period === 'total') {
                                                    return date.toLocaleDateString("en-US", { month: 'short', year: '2-digit' });
                                                }
                                                return date.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                });
                                            }}
                                            fontSize={10}
                                            stroke="rgba(255,255,255,0.3)"
                                        />
                                        <YAxis 
                                            hide 
                                            domain={[0, 'auto']} 
                                        />
                                        <ChartTooltip
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                            content={
                                                <ChartTooltipContent 
                                                    indicator="dot" 
                                                    className="bg-zinc-950/90 border-zinc-800 backdrop-blur-md shadow-2xl"
                                                />
                                            }
                                        />
                                        <Area
                                            dataKey="added"
                                            type="monotone"
                                            fill="url(#fillAdded)"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            stackId="a"
                                            animationDuration={1500}
                                        />
                                        <Area
                                            dataKey="watched"
                                            type="monotone"
                                            fill="url(#fillWatched)"
                                            stroke="#22c55e"
                                            strokeWidth={2}
                                            stackId="a"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Detailed Stats Table */}
                <Card className="mt-8 border-none bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Detailed History
                        </CardTitle>
                        <CardDescription>Most recent events for {periodLabels[period]}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="font-bold uppercase tracking-wider text-[10px]">Title</TableHead>
                                    <TableHead className="font-bold uppercase tracking-wider text-[10px]">Type</TableHead>
                                    <TableHead className="font-bold uppercase tracking-wider text-[10px]">Action</TableHead>
                                    <TableHead className="font-bold uppercase tracking-wider text-[10px] text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.detailedStats.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No activity found for this period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats.detailedStats.map((event, i) => (
                                        <TableRow key={i} className="border-border/20 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium max-w-[300px] truncate">{event.title}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {event.type === 'video' ? <Video className="h-3 w-3 text-red-400" /> : <Mic className="h-3 w-3 text-purple-400" />}
                                                    <span className="capitalize text-xs">{event.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                    event.event_type === 'watched' ? 'bg-green-500/10 text-green-500' : 
                                                    event.event_type === 'added' ? 'bg-blue-500/10 text-blue-500' :
                                                    event.event_type === 'favorited' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-muted text-muted-foreground'
                                                }`}>
                                                    {event.event_type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {new Date(event.created_at * 1000).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
    color: string;
    bg: string;
}

function StatCard({ title, value, icon, description, color, bg }: StatCardProps) {
    return (
        <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all hover:translate-y-[-4px] bg-card/50 backdrop-blur-sm group">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${bg} ${color} shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tabular-nums tracking-tighter">{value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 font-semibold group-hover:text-foreground transition-colors">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

interface UsageItemProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

function UsageItem({ label, value, icon, color, bg }: UsageItemProps) {
    return (
        <div className="flex items-center justify-between group cursor-default p-1 rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bg} ${color} transition-all group-hover:scale-110 shadow-sm`}>
                    {icon}
                </div>
                <span className="font-bold text-sm text-foreground/70 group-hover:text-foreground transition-colors">{label}</span>
            </div>
            <span className="text-2xl font-black tabular-nums tracking-tighter pr-2">{value}</span>
        </div>
    );
}
