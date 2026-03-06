'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Plus, Trash2, Edit2, ExternalLink, RefreshCw } from 'lucide-react';

import { toast } from 'sonner';
import { LabcastARRIntegration } from '@/lib/domain/models';

export function LabcastARRSettings() {
    const [integrations, setIntegrations] = useState<LabcastARRIntegration[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [isTesting, setIsTesting] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        apiUrl: '',
        apiToken: '',
        channelId: '',
        autoTag: '2WatchARR',
        audioQuality: 'default',
        audioLanguage: 'default',
        enabled: true,
    });

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {

            const response = await fetch('/api/integrations/labcastarr');
            const data = await response.json();
            if (data.integrations) {
                setIntegrations(data.integrations);
            }
        } catch {
            toast.error('Failed to load LabcastARR integrations');
        }
    };


    const handleTest = async () => {
        if (!formData.apiUrl || !formData.apiToken) {
            toast.error('API URL and Token are required to test connection');
            return;
        }

        setIsTesting(true);
        try {
            const response = await fetch('/api/integrations/labcastarr/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiUrl: formData.apiUrl,
                    apiToken: formData.apiToken,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Connection successful!');
            } else {
                toast.error('Connection failed. Please check your credentials.');
            }
        } catch {
            toast.error('Testing failed. Check console for details.');
        } finally {


            setIsTesting(true); // Wait, should be false
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.apiUrl || !formData.apiToken || !formData.channelId) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSaving(true);
        try {
            const method = editingId ? 'PATCH' : 'POST';
            const url = editingId
                ? `/api/integrations/labcastarr/${editingId}`
                : '/api/integrations/labcastarr';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(editingId ? 'Integration updated' : 'Integration added');
                setIsAddingNew(false);
                setEditingId(null);
                resetForm();
                fetchIntegrations();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to save integration');
            }
        } catch {
            toast.error('Failed to save integration');
        } finally {


            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this integration?')) return;

        try {
            const response = await fetch(`/api/integrations/labcastarr/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Integration deleted');
                fetchIntegrations();
            } else {
                toast.error('Failed to delete');
            }
        } catch {
            toast.error('Error deleting');
        }
    };



    const handleToggleEnabled = async (integration: LabcastARRIntegration) => {
        try {
            const response = await fetch(`/api/integrations/labcastarr/${integration.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !integration.enabled }),
            });

            if (response.ok) {
                fetchIntegrations();
            }
        } catch {
            toast.error('Failed to toggle status');
        }
    };



    const startEdit = (integration: LabcastARRIntegration) => {
        setEditingId(integration.id);
        setFormData({
            name: integration.name,
            apiUrl: integration.apiUrl,
            apiToken: integration.apiToken,
            channelId: integration.channelId,
            autoTag: integration.autoTag,
            audioQuality: integration.audioQuality,
            audioLanguage: integration.audioLanguage,
            enabled: integration.enabled,
        });
        setIsAddingNew(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            apiUrl: '',
            apiToken: '',
            channelId: '',
            autoTag: '2WatchARR',
            audioQuality: 'default',
            audioLanguage: 'default',
            enabled: true,
        });
        setEditingId(null);
    };

    return (
        <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Integration with LabcastARR</CardTitle>
                        <CardDescription>
                            Connect to LabcastARR to automatically create podcast episodes from videos.
                        </CardDescription>
                    </div>
                    {!isAddingNew && (
                        <Button onClick={() => setIsAddingNew(true)} size="sm" className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isAddingNew ? (
                    <div className="space-y-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Integration Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. My Podcast"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apiUrl">LabcastARR API URL *</Label>
                                <Input
                                    id="apiUrl"
                                    placeholder="https://labcast.yourdomain.com"
                                    value={formData.apiUrl}
                                    onChange={e => setFormData({ ...formData, apiUrl: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apiToken">LabcastARR API Token *</Label>
                                <Input
                                    id="apiToken"
                                    type="password"
                                    placeholder="Your integration token"
                                    value={formData.apiToken}
                                    onChange={e => setFormData({ ...formData, apiToken: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="channelId">LabcastARR Channel ID *</Label>
                                <Input
                                    id="channelId"
                                    placeholder="e.g. 1"
                                    value={formData.channelId}
                                    onChange={e => setFormData({ ...formData, channelId: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="autoTag">Auto-Send Tag</Label>
                                <Input
                                    id="autoTag"
                                    placeholder="2WatchARR"
                                    value={formData.autoTag}
                                    onChange={e => setFormData({ ...formData, autoTag: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                                <p className="text-[10px] text-zinc-500">Videos with this tag will be auto-sent.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Audio Quality</Label>
                                    <Select
                                        value={formData.audioQuality}
                                        onValueChange={v => setFormData({ ...formData, audioQuality: v })}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800">
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Language</Label>
                                    <Select
                                        value={formData.audioLanguage}
                                        onValueChange={v => setFormData({ ...formData, audioLanguage: v })}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800">
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="en">English (en)</SelectItem>
                                            <SelectItem value="es">Spanish (es)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                            <Button
                                variant="outline"
                                className="border-zinc-800 hover:bg-zinc-900"
                                onClick={() => { setIsAddingNew(false); resetForm(); }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleTest}
                                disabled={isTesting}
                                className="border-zinc-800"
                            >
                                {isTesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                                Test Connection
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary hover:bg-primary/90 ml-auto"
                            >
                                {isSaving ? 'Saving...' : editingId ? 'Update Integration' : 'Add Integration'}
                            </Button>
                        </div>
                    </div>
                ) : integrations.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 italic">
                        No LabcastARR integrations configured.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {integrations.map(integration => (
                            <div
                                key={integration.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <Switch
                                        checked={integration.enabled}
                                        onCheckedChange={() => handleToggleEnabled(integration)}
                                    />
                                    <div>
                                        <p className="font-medium text-zinc-100">{integration.name}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-zinc-500">Channel: {integration.channelId}</span>
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                {integration.autoTag}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => startEdit(integration)}>
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-400" onClick={() => handleDelete(integration.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
