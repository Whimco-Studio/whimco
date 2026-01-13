"use client";

import { useState } from "react";
import Image from "next/image";
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "../../components/admin/AdminHeader";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin } from "@/components/context/AdminContext";

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
          <nav className="bg-white rounded-2xl shadow-xl p-2">
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
            <div className="bg-white rounded-2xl shadow-xl p-6">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
            <div className="bg-white rounded-2xl shadow-xl p-6">
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
            <div className="bg-white rounded-2xl shadow-xl p-6">
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

          {activeTab === "security" && isAdmin && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
