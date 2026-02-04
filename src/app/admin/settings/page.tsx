"use client";

import { useState } from "react";
import Image from "next/image";
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../components/admin/AdminHeader";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin } from "@/components/context/AdminContext";
import { useRobloxConfig } from "@/components/hooks/useRobloxConfig";

export default function SettingsPage() {
  const { user, isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: <UserCircleIcon className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon className="w-5 h-5" /> },
    { id: "appearance", label: "Appearance", icon: <PaintBrushIcon className="w-5 h-5" /> },
  ];

  if (isAdmin) {
    tabs.push({
      id: "roblox",
      label: "Roblox",
      icon: <CubeIcon className="w-5 h-5" />,
    });
    tabs.push({
      id: "security",
      label: "Security",
      icon: <ShieldCheckIcon className="w-5 h-5" />,
    });
  }

  return (
    <>
      <AdminHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                    : "text-slate-600 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-slate-700 mb-6">
                Profile Settings
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    user?.name?.[0] || "U"
                  )}
                </div>
                <div>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg hover:opacity-90 transition-opacity">
                    Change Avatar
                  </button>
                  <p className="text-xs text-slate-400 mt-1">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Role
                  </label>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={isAdmin ? "success" : "info"}
                      label={isAdmin ? "Administrator" : "User"}
                      size="md"
                    />
                    <span className="text-sm text-slate-400">
                      {isAdmin
                        ? "Full access to all features"
                        : "Access to analytics only"}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-opacity">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-slate-700 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {[
                  {
                    title: "New engagement",
                    description: "Get notified when your content receives reactions",
                    enabled: true,
                  },
                  {
                    title: "Weekly digest",
                    description: "Receive a weekly summary of your analytics",
                    enabled: true,
                  },
                  {
                    title: "Server updates",
                    description: "Notifications when new servers connect",
                    enabled: false,
                  },
                  {
                    title: "Milestone alerts",
                    description: "Celebrate when you hit view milestones",
                    enabled: true,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-slate-700">{item.title}</p>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-slate-700 mb-6">
                Appearance Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Light", "Dark", "System"].map((theme) => (
                      <button
                        key={theme}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === "Light"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-full h-8 rounded-lg mb-2 ${
                            theme === "Dark"
                              ? "bg-gray-800"
                              : theme === "System"
                              ? "bg-gradient-to-r from-white to-gray-800"
                              : "bg-white border"
                          }`}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {theme}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    {[
                      "from-blue-500 to-violet-500",
                      "from-emerald-500 to-teal-500",
                      "from-orange-500 to-red-500",
                      "from-pink-500 to-purple-500",
                      "from-cyan-500 to-blue-500",
                    ].map((gradient, idx) => (
                      <button
                        key={idx}
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${gradient} ${
                          idx === 0 ? "ring-2 ring-offset-2 ring-blue-500" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "roblox" && isAdmin && <RobloxConfigSection />}

          {activeTab === "security" && isAdmin && (
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-slate-700 mb-6">
                Security Settings
              </h2>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    These settings affect all users with admin access. Make changes carefully.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Change Password
                  </label>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-opacity">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface FetchedGroup {
  id: string;
  name: string;
  role: string;
  rank: number;
  memberCount: number;
}

function RobloxConfigSection() {
  const {
    config,
    loading,
    error,
    saving,
    updateConfig,
    testApiKey,
    testGroup,
    addGroup,
    removeGroup,
    fetchMyGroups,
  } = useRobloxConfig();

  const [apiKey, setApiKey] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [newGroupId, setNewGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [testingKey, setTestingKey] = useState(false);
  const [testingGroup, setTestingGroup] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ valid?: boolean; message?: string; error?: string } | null>(null);
  const [groupTestResult, setGroupTestResult] = useState<{ accessible?: boolean; name?: string; error?: string } | null>(null);
  const [fetchingGroups, setFetchingGroups] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<FetchedGroup[]>([]);

  const handleTestApiKey = async () => {
    setTestingKey(true);
    setKeyTestResult(null);
    try {
      const result = await testApiKey(apiKey || undefined);
      setKeyTestResult(result);
    } catch (err) {
      setKeyTestResult({ valid: false, error: "Test failed" });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await updateConfig({
        api_key: apiKey,
        roblox_user_id: userId,
        roblox_username: username,
      });
      setApiKey("");
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleTestGroup = async () => {
    if (!newGroupId) return;
    setTestingGroup(true);
    setGroupTestResult(null);
    try {
      const result = await testGroup(newGroupId);
      setGroupTestResult(result);
      if (result.accessible && result.name) {
        setNewGroupName(result.name);
      }
    } catch (err) {
      setGroupTestResult({ accessible: false, error: "Test failed" });
    } finally {
      setTestingGroup(false);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupId) return;
    try {
      await addGroup(newGroupId, newGroupName || undefined);
      setNewGroupId("");
      setNewGroupName("");
      setGroupTestResult(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleFetchMyGroups = async () => {
    setFetchingGroups(true);
    setAvailableGroups([]);
    try {
      const groups = await fetchMyGroups();
      setAvailableGroups(groups);
    } catch (err) {
      // Error handled by hook
    } finally {
      setFetchingGroups(false);
    }
  };

  const handleAddFromList = async (group: FetchedGroup) => {
    try {
      await addGroup(group.id, group.name);
      // Remove from available list
      setAvailableGroups((prev) => prev.filter((g) => g.id !== group.id));
    } catch (err) {
      // Error handled by hook
    }
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Key Configuration */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-slate-700 mb-2">
          Roblox Open Cloud API
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Configure your Roblox Open Cloud API key to enable asset uploads.
          Create an API key at{" "}
          <a
            href="https://create.roblox.com/dashboard/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Creator Hub
          </a>
          .
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700">
            <XCircleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Status */}
        <div className="mb-6 p-4 rounded-xl bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {config?.is_configured ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-green-700">API key configured</span>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-700">Not configured</span>
                  </>
                )}
              </div>
            </div>
            {config?.api_key_preview && (
              <div className="text-right min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-600">Current Key</p>
                <code className="text-sm text-slate-500 font-mono block truncate max-w-[200px] ml-auto">
                  {config.api_key_preview}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              {config?.is_configured ? "Update API Key" : "API Key"}
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Roblox Open Cloud API key"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono text-sm text-slate-700 bg-white"
              />
              <button
                onClick={handleTestApiKey}
                disabled={!apiKey || testingKey}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                {testingKey ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  "Test"
                )}
              </button>
            </div>
            {keyTestResult && (
              <div className={`mt-2 text-sm flex items-center gap-1 ${keyTestResult.valid ? "text-green-600" : "text-red-600"}`}>
                {keyTestResult.valid ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <XCircleIcon className="w-4 h-4" />
                )}
                <span>{keyTestResult.message || keyTestResult.error}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Roblox User ID
              </label>
              <input
                type="text"
                value={userId || config?.roblox_user_id || ""}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Your Roblox user ID"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Roblox Username
              </label>
              <input
                type="text"
                value={username || config?.roblox_username || ""}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Roblox username"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveApiKey}
              disabled={saving || (!apiKey && !userId && !username)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Groups Management */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-slate-700 mb-2">
          Roblox Groups
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Add groups that your API key has permission to upload assets to.
          Make sure to grant asset upload permissions in Creator Hub.
        </p>

        {/* Saved Groups */}
        {config?.groups && config.groups.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-slate-600 mb-2">Saved Groups</p>
            {config.groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    G
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{group.name}</p>
                    <p className="text-xs text-slate-400">ID: {group.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeGroup(group.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove group"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Group */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Add Group
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroupId}
                onChange={(e) => setNewGroupId(e.target.value)}
                placeholder="Group ID"
                className="w-32 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
              />
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name (optional)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-700 bg-white"
              />
              <button
                onClick={handleTestGroup}
                disabled={!newGroupId || testingGroup}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                {testingGroup ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  "Test"
                )}
              </button>
              <button
                onClick={handleAddGroup}
                disabled={!newGroupId || saving}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add
              </button>
            </div>
            {groupTestResult && (
              <div className={`mt-2 text-sm flex items-center gap-1 ${groupTestResult.accessible ? "text-green-600" : "text-red-600"}`}>
                {groupTestResult.accessible ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Access confirmed: {groupTestResult.name}</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4" />
                    <span>{groupTestResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Fetch My Groups */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-600">Auto-detect Groups</p>
                <p className="text-xs text-slate-400">Fetch all groups you&apos;re a member of based on your User ID</p>
              </div>
              <button
                onClick={handleFetchMyGroups}
                disabled={fetchingGroups || !config?.roblox_user_id}
                className="px-4 py-2 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                {fetchingGroups ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowPathIcon className="w-4 h-4" />
                )}
                Fetch My Groups
              </button>
            </div>
            {!config?.roblox_user_id && (
              <p className="text-xs text-amber-600 mb-2">Set your Roblox User ID above to enable this feature</p>
            )}
            {availableGroups.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs text-slate-500 mb-2">Click to add a group:</p>
                {availableGroups
                  .filter((g) => !config?.groups.some((sg) => sg.id === g.id))
                  .map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleAddFromList(group)}
                      disabled={saving}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                          G
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{group.name}</p>
                          <p className="text-xs text-slate-400">
                            ID: {group.id} • {group.role} • {group.memberCount.toLocaleString()} members
                          </p>
                        </div>
                      </div>
                      <PlusIcon className="w-5 h-5 text-blue-500" />
                    </button>
                  ))}
                {availableGroups.filter((g) => !config?.groups.some((sg) => sg.id === g.id)).length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-2">All your groups have been added!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Default Destination */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold text-slate-700 mb-2">
          Default Upload Destination
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Choose where assets should be uploaded by default.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateConfig({ default_destination_type: "user" })}
            className={`p-4 rounded-xl border-2 transition-all ${
              config?.default_destination_type === "user"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <UserCircleIcon className={`w-8 h-8 mx-auto mb-2 ${
              config?.default_destination_type === "user" ? "text-blue-500" : "text-gray-400"
            }`} />
            <p className="font-medium text-slate-700">Personal Account</p>
            <p className="text-xs text-slate-400 mt-1">Upload to your own inventory</p>
          </button>
          <button
            onClick={() => updateConfig({ default_destination_type: "group" })}
            className={`p-4 rounded-xl border-2 transition-all ${
              config?.default_destination_type === "group"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <CubeIcon className={`w-8 h-8 mx-auto mb-2 ${
              config?.default_destination_type === "group" ? "text-blue-500" : "text-gray-400"
            }`} />
            <p className="font-medium text-slate-700">Group</p>
            <p className="text-xs text-slate-400 mt-1">Upload to a group inventory</p>
          </button>
        </div>

        {config?.default_destination_type === "group" && config.groups.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Default Group
            </label>
            <select
              value={config.default_group_id || ""}
              onChange={(e) => updateConfig({ default_group_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none bg-white text-slate-700"
            >
              <option value="">Select a group...</option>
              {config.groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
