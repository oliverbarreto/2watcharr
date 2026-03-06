'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout';
import {
    CheckCircle2,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Filter,
    MoreHorizontal,
    Check,
    X,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Notification } from '@/lib/domain/models';

import {
    getNotificationTypeLabel,
    getNotificationTypeIcon,
    getNotificationTypeColor,
    getNotificationTypeOptions,
} from '@/lib/utils/notification-helpers';
import { cn } from '@/lib/utils';

export default function ActivityPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isReadFilter, setIsReadFilter] = useState<string>('all');

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                limit: rowsPerPage.toString(),
                offset: ((currentPage - 1) * rowsPerPage).toString(),
            });

            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (isReadFilter !== 'all') params.append('isRead', isReadFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await fetch(`/api/notifications?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            setNotifications(data.items);
            setTotal(data.total);
        } catch (_error) {
            console.error('Error fetching notifications:', _error);
            toast.error('Failed to load activity log');
        } finally {

            setIsLoading(false);
        }
    }, [currentPage, rowsPerPage, typeFilter, isReadFilter, searchQuery]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead }),
            });
            if (!response.ok) throw new Error('Failed to update notification');

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead } : n));
            toast.success(isRead ? 'Marked as read' : 'Marked as unread');
        } catch {

            toast.error('Failed to update notification');
        }
    };


    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete notification');

            setNotifications(prev => prev.filter(n => n.id !== id));
            setTotal(prev => prev - 1);
            toast.success('Notification deleted');
        } catch {

            toast.error('Failed to delete notification');
        }
    };


    const handleMarkAllRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true }),
            });
            if (!response.ok) throw new Error('Failed to mark all as read');

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch {

            toast.error('Failed to mark all as read');
        }
    };


    const handleDeleteRead = async () => {
        try {
            const response = await fetch('/api/notifications?read=true', {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete read notifications');

            fetchNotifications();
            toast.success('Read notifications deleted');
        } catch {

            toast.error('Failed to delete read notifications');
        }
    };


    const handleDeleteAll = async () => {
        if (!confirm('Are you sure you want to delete ALL activity logs? This cannot be undone.')) return;

        try {
            const response = await fetch('/api/notifications?all=true', {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete all notifications');

            setNotifications([]);
            setTotal(0);
            toast.success('All activity logs deleted');
        } catch {

            toast.error('Failed to delete activity log');
        }
    };


    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString();
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const totalPages = Math.ceil(total / rowsPerPage);

    return (
        <Layout>
            <div className="animate-in fade-in duration-500 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                        <p className="text-muted-foreground">Track system events and integration activity</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark All Read
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cleanup
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDeleteRead}>
                                    Delete Read
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDeleteAll} className="text-red-500">
                                    Delete All
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="sm" onClick={fetchNotifications}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search description, channel..."
                                    className="pl-9 bg-muted/20 border-border/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchNotifications()}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[180px] bg-muted/20 border-border/50">
                                        <Filter className="mr-2 h-4 w-4 opacity-50" />
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {getNotificationTypeOptions().map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={isReadFilter} onValueChange={setIsReadFilter}>
                                    <SelectTrigger className="w-[140px] bg-muted/20 border-border/50">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="false">Unread</SelectItem>
                                        <SelectItem value="true">Read</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-border/10 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Channel</TableHead>
                                        <TableHead>Date / Time</TableHead>
                                        <TableHead>Executed By</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 7 }).map((_, j) => (
                                                    <TableCell key={j}>
                                                        <div className="h-4 bg-muted/20 animate-pulse rounded" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : notifications.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                No activity found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        notifications.map((n) => {
                                            const Icon = getNotificationTypeIcon(n.type);
                                            const colors = getNotificationTypeColor(n.type);
                                            return (
                                                <TableRow key={n.id} className={cn(!n.isRead && "bg-primary/5")}>
                                                    <TableCell>
                                                        {!n.isRead && (
                                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={cn("gap-1 py-1 font-medium", colors.bgClass, colors.textClass)}>
                                                            <Icon className="h-3 w-3" />
                                                            {getNotificationTypeLabel(n.type)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {n.channelName || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">{formatDate(n.createdAt)}</span>
                                                            <span className="text-xs text-muted-foreground">{formatTime(n.createdAt)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                                                            {n.executedBy}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate" title={n.description || ''}>
                                                        {n.description}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleMarkAsRead(n.id, !n.isRead)}>
                                                                    {n.isRead ? (
                                                                        <><X className="mr-2 h-4 w-4" /> Mark as Unread</>
                                                                    ) : (
                                                                        <><Check className="mr-2 h-4 w-4" /> Mark as Read</>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(n.id)} className="text-red-500">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground whitespace-nowrap">
                                    Rows per page:
                                </p>
                                <Select
                                    value={rowsPerPage.toString()}
                                    onValueChange={(v) => {
                                        setRowsPerPage(parseInt(v));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[70px] h-8 bg-muted/20 border-border/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground ml-4">
                                    Total: {total}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium mx-2">
                                    Page {currentPage} of {totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={currentPage === totalPages || total === 0}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
