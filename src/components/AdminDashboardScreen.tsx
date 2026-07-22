import React, { useState, useEffect } from "react";
import { 
  Shield, Users, Tag, PlusCircle, Trash2, Megaphone, 
  Settings, Ban, CheckCircle, Search, Edit2, Check, X,
  MapPin, Car, Plus, AlertCircle, RefreshCw, Globe,
  Sparkles, Download
} from "lucide-react";
import { User, SparePart, AppVersionConfig } from "../types";
import { 
  fetchAllUsers, toggleUserBlockStatus, sendAnnouncement,
  fetchMetadataConfig, saveMetadataConfig, deleteSparePartListing,
  updateSparePartListing, fetchAppVersionConfig, updateAppVersionConfig
} from "../lib/firebase";

interface AdminDashboardScreenProps {
  currentUser: User | null;
  allParts: SparePart[];
  onPartUpdated: () => void;
  onBackToApp: () => void;
}

export default function AdminDashboardScreen({
  currentUser,
  allParts,
  onPartUpdated,
  onBackToApp
}: AdminDashboardScreenProps) {
  // Navigation tabs inside Admin Panel
  const [activeTab, setActiveTab] = useState<"users" | "listings" | "metadata" | "announcements" | "version">("users");

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Metadata state
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<Record<string, string[]>>({});
  const [locations, setLocations] = useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // New items fields
  const [newCategory, setNewCategory] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandModels, setNewBrandModels] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Announcements state
  const [annTitle, setAnnTitle] = useState("");
  const [annText, setAnnText] = useState("");
  const [annSuccess, setAnnSuccess] = useState(false);
  const [sendingAnn, setSendingAnn] = useState(false);

  // Edit list states
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingTitle, setEditingTitle] = useState("");

  // App Version management states
  const [vLatestVersion, setVLatestVersion] = useState("1.0.0");
  const [vMinVersion, setVMinVersion] = useState("1.0.0");
  const [vForceUpdate, setVForceUpdate] = useState(false);
  const [vApkUrl, setVApkUrl] = useState("https://autopartsindia.app/download/app-latest.apk");
  const [vReleaseNotes, setVReleaseNotes] = useState("Performance improvements & bug fixes.");
  const [vReleaseDate, setVReleaseDate] = useState("2026-07-22");
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [versionSaveSuccess, setVersionSaveSuccess] = useState(false);

  const loadVersionData = async () => {
    setLoadingVersion(true);
    try {
      const config = await fetchAppVersionConfig();
      setVLatestVersion(config.latestVersion);
      setVMinVersion(config.minimumSupportedVersion);
      setVForceUpdate(config.forceUpdate);
      setVApkUrl(config.apkDownloadUrl);
      setVReleaseNotes(config.releaseNotes);
      setVReleaseDate(config.releaseDate);
    } catch (e) {
      console.error("Failed to load app version config in admin:", e);
    } finally {
      setLoadingVersion(false);
    }
  };

  const handleSaveVersionConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVersion(true);
    setVersionSaveSuccess(false);
    try {
      const updatedConfig: AppVersionConfig = {
        latestVersion: vLatestVersion.trim(),
        minimumSupportedVersion: vMinVersion.trim(),
        forceUpdate: vForceUpdate,
        apkDownloadUrl: vApkUrl.trim(),
        releaseNotes: vReleaseNotes.trim(),
        releaseDate: vReleaseDate.trim()
      };
      const success = await updateAppVersionConfig(updatedConfig);
      if (success) {
        setVersionSaveSuccess(true);
        setTimeout(() => setVersionSaveSuccess(false), 4000);
      } else {
        alert("Failed to save app update configuration.");
      }
    } catch (err) {
      alert("Error saving app update config: " + err);
    } finally {
      setSavingVersion(false);
    }
  };

  // Load all users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await fetchAllUsers();
      // Exclude admin from being blocked/listed as togglable if needed, but show anyway
      setUsers(allUsers);
    } catch (e) {
      console.error("Failed to load users for admin:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load metadata
  const loadMeta = async () => {
    setLoadingMeta(true);
    try {
      const config = await fetchMetadataConfig();
      setCategories(config.categories);
      setBrands(config.brands);
      setLocations(config.locations);
    } catch (e) {
      console.error("Failed to load metadata config:", e);
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email === "wwwautoparts2@gmail.com") {
      loadUsers();
      loadMeta();
      loadVersionData();
    }
  }, [currentUser]);

  // Block/unblock handler
  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    if (userId === currentUser?.id) {
      alert("You cannot block yourself!");
      return;
    }
    const confirmMsg = `Are you sure you want to ${currentBlocked ? "unblock" : "block"} this user?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const success = await toggleUserBlockStatus(userId, currentBlocked);
      if (success) {
        setUsers(prev => 
          prev.map(u => u.id === userId ? { ...u, isBlocked: !currentBlocked } : u)
        );
      }
    } catch (e) {
      alert("Failed to change block status: " + e);
    }
  };

  // Category additions
  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      alert("Category already exists!");
      return;
    }
    const updated = [...categories, trimmed];
    try {
      await saveMetadataConfig("categories", { list: updated });
      setCategories(updated);
      setNewCategory("");
    } catch (e) {
      alert("Failed to save categories: " + e);
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat}"?`)) return;
    const updated = categories.filter(c => c !== cat);
    try {
      await saveMetadataConfig("categories", { list: updated });
      setCategories(updated);
    } catch (e) {
      alert("Failed to delete category: " + e);
    }
  };

  // Brand additions
  const handleAddBrand = async () => {
    const brandName = newBrandName.trim();
    if (!brandName) return;
    const modelsList = newBrandModels
      .split(",")
      .map(m => m.trim())
      .filter(m => m.length > 0);

    if (brands[brandName]) {
      alert("Brand already exists!");
      return;
    }

    const updated = { ...brands, [brandName]: modelsList };
    try {
      await saveMetadataConfig("brands", { map: updated });
      setBrands(updated);
      setNewBrandName("");
      setNewBrandModels("");
    } catch (e) {
      alert("Failed to save brands: " + e);
    }
  };

  const handleDeleteBrand = async (brand: string) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brand}"?`)) return;
    const updated = { ...brands };
    delete updated[brand];
    try {
      await saveMetadataConfig("brands", { map: updated });
      setBrands(updated);
    } catch (e) {
      alert("Failed to delete brand: " + e);
    }
  };

  // Location additions
  const handleAddLocation = async () => {
    const trimmed = newLocation.trim();
    if (!trimmed) return;
    if (locations.includes(trimmed)) {
      alert("Location already exists!");
      return;
    }
    const updated = [...locations, trimmed];
    try {
      await saveMetadataConfig("locations", { list: updated });
      setLocations(updated);
      setNewLocation("");
    } catch (e) {
      alert("Failed to save locations: " + e);
    }
  };

  const handleDeleteLocation = async (loc: string) => {
    if (!window.confirm(`Are you sure you want to delete location "${loc}"?`)) return;
    const updated = locations.filter(l => l !== loc);
    try {
      await saveMetadataConfig("locations", { list: updated });
      setLocations(updated);
    } catch (e) {
      alert("Failed to delete location: " + e);
    }
  };

  // Delete dynamic ad listing
  const handleDeleteAd = async (partId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this ad listing? This cannot be undone.")) return;
    try {
      const success = await deleteSparePartListing(partId);
      if (success) {
        onPartUpdated();
      } else {
        alert("Delete returned false. Make sure listing exists.");
      }
    } catch (e) {
      alert("Failed to delete listing: " + e);
    }
  };

  // Quick edit price or title
  const handleSaveQuickEdit = async (partId: string) => {
    try {
      const success = await updateSparePartListing(partId, {
        title: editingTitle,
        price: editingPrice
      });
      if (success) {
        setEditingPartId(null);
        onPartUpdated();
      } else {
        alert("Update returned false.");
      }
    } catch (e) {
      alert("Failed to update listing: " + e);
    }
  };

  // Broadcast announcement
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = annTitle.trim();
    const text = annText.trim();
    if (!title || !text) return;

    setSendingAnn(true);
    try {
      await sendAnnouncement(title, text);
      setAnnSuccess(true);
      setAnnTitle("");
      setAnnText("");
      setTimeout(() => setAnnSuccess(false), 5000);
    } catch (e) {
      alert("Failed to send announcement: " + e);
    } finally {
      setSendingAnn(false);
    }
  };

  // Filters users list
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone && u.phone.includes(searchTerm))
  );

  // Filters ads list
  const filteredParts = allParts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.carBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-full">
      {/* Header Bar */}
      <header className="bg-[#0056D2] text-white px-4 py-4 flex items-center justify-between shadow-md select-none shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="text-yellow-400 fill-yellow-400" size={24} />
          <div>
            <h1 className="font-sans font-black text-lg tracking-tight leading-none">Super Admin</h1>
            <p className="text-[10px] text-blue-100 mt-0.5 opacity-90">Auto Parts Control Panel</p>
          </div>
        </div>
        
        <button 
          onClick={onBackToApp}
          className="bg-white/15 hover:bg-white/20 active:bg-white/10 px-3 py-1.5 rounded-full text-xs font-black tracking-tight flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <X size={14} />
          Exit Admin
        </button>
      </header>

      {/* Admin Quick Tabs */}
      <div className="bg-white border-b border-slate-100 flex items-center justify-around select-none shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => { setActiveTab("users"); setSearchTerm(""); }}
          className={`flex-1 py-3 text-xs font-black tracking-tight border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "users" 
              ? "border-[#0056D2] text-[#0056D2]" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users size={16} />
          Users ({users.length})
        </button>

        <button
          onClick={() => { setActiveTab("listings"); setSearchTerm(""); }}
          className={`flex-1 py-3 text-xs font-black tracking-tight border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "listings" 
              ? "border-[#0056D2] text-[#0056D2]" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Tag size={16} />
          Ads ({allParts.length})
        </button>

        <button
          onClick={() => { setActiveTab("metadata"); setSearchTerm(""); }}
          className={`flex-1 py-3 text-xs font-black tracking-tight border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "metadata" 
              ? "border-[#0056D2] text-[#0056D2]" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Settings size={16} />
          Metadata
        </button>

        <button
          onClick={() => { setActiveTab("announcements"); setSearchTerm(""); }}
          className={`flex-1 py-3 text-xs font-black tracking-tight border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "announcements" 
              ? "border-[#0056D2] text-[#0056D2]" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Megaphone size={16} />
          Announcements
        </button>

        <button
          onClick={() => { setActiveTab("version"); setSearchTerm(""); loadVersionData(); }}
          className={`flex-1 py-3 text-xs font-black tracking-tight border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "version" 
              ? "border-[#0056D2] text-[#0056D2]" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sparkles size={16} />
          App Update
        </button>
      </div>

      {/* Main Panel Content (Scrollable Container Locked to Viewport) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* TAB 1: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Search and Refresh bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#0056D2] shadow-sm"
                />
              </div>
              <button 
                onClick={loadUsers}
                disabled={loadingUsers}
                className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-[#0056D2] hover:border-blue-100 disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center justify-center"
              >
                <RefreshCw size={16} className={loadingUsers ? "animate-spin" : ""} />
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <RefreshCw className="animate-spin text-[#0056D2] mb-2" size={24} />
                <span className="text-xs font-bold">Fetching user accounts...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-150 p-8 text-center text-slate-400">
                <Users className="mx-auto mb-2 opacity-50 text-slate-300" size={32} />
                <p className="text-xs font-bold">No registered users matched your filter.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id}
                    className={`bg-white rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 shadow-sm ${
                      user.isBlocked 
                        ? "border-rose-100 bg-rose-50/10" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-800 truncate">{user.name}</span>
                        {user.email === "wwwautoparts2@gmail.com" && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                            <Shield size={8} /> Super Admin
                          </span>
                        )}
                        {user.isBlocked && (
                          <span className="bg-rose-100 text-rose-800 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Suspended
                          </span>
                        )}
                      </div>
                      
                      <div className="text-[10px] text-slate-500 truncate space-y-0.5 font-medium">
                        {user.phone && <p>Phone: {user.phone}</p>}
                        {(user.state || user.district) && (
                          <p className="text-slate-400 flex items-center gap-0.5 text-[9px]">
                            <MapPin size={10} />
                            {[user.district, user.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {user.email === "wwwautoparts2@gmail.com" ? (
                        <span className="text-[10px] text-amber-600 font-bold px-2 py-1 bg-amber-50 rounded-full border border-amber-100 select-none">
                          Immutable
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleBlock(user.id, !!user.isBlocked)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-tight flex items-center gap-1 transition-all cursor-pointer border ${
                            user.isBlocked 
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-150" 
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-150"
                          }`}
                        >
                          {user.isBlocked ? (
                            <>
                              <CheckCircle size={12} />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Ban size={12} />
                              Block User
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LISTINGS MANAGEMENT */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            {/* Search ad box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search ad titles, brands, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#0056D2] shadow-sm"
              />
            </div>

            {filteredParts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-150 p-8 text-center text-slate-400">
                <Tag className="mx-auto mb-2 opacity-50 text-slate-300" size={32} />
                <p className="text-xs font-bold">No active spare part listings match your filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredParts.map((part) => (
                  <div 
                    key={part.id}
                    className="bg-white rounded-2xl border border-slate-100 p-3 flex gap-3 shadow-sm"
                  >
                    {/* Part Image */}
                    <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {(part.imageUrls && part.imageUrls[0]) || part.imageUrl ? (
                        <img 
                          src={(part.imageUrls && part.imageUrls[0]) || part.imageUrl} 
                          alt={part.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Car className="text-slate-300" size={24} />
                      )}
                      {part.sold && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[8px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">
                            Sold
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Part Details / Quick Edit Form */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {editingPartId === part.id ? (
                        <div className="space-y-1.5 pr-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-400">₹</span>
                            <input
                              type="number"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(Number(e.target.value))}
                              className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                            />
                            <button
                              onClick={() => handleSaveQuickEdit(part.id)}
                              className="p-1 bg-emerald-550 hover:bg-emerald-650 text-white rounded cursor-pointer"
                              title="Save Changes"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingPartId(null)}
                              className="p-1 bg-slate-150 hover:bg-slate-250 text-slate-600 rounded cursor-pointer"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-bold text-xs text-slate-800 leading-tight truncate">{part.title}</h3>
                            <span className="font-black text-xs text-[#0056D2] shrink-0">₹{part.price.toLocaleString("en-IN")}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate font-medium">
                            <span>{part.carBrand}</span>
                            <span className="text-slate-300">•</span>
                            <span>{part.category}</span>
                          </p>
                          <p className="text-[9px] text-slate-500 font-medium">
                            Seller: <span className="text-slate-700 font-bold">{part.contactName}</span>
                          </p>
                        </div>
                      )}

                      {/* Listing Actions */}
                      {editingPartId !== part.id && (
                        <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1 select-none">
                          <button
                            onClick={() => {
                              setEditingPartId(part.id);
                              setEditingPrice(part.price);
                              setEditingTitle(part.title);
                            }}
                            className="text-[10px] font-black text-slate-500 hover:text-[#0056D2] flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 size={10} />
                            Edit Listing
                          </button>

                          <button
                            onClick={() => handleDeleteAd(part.id)}
                            className="text-[10px] font-black text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={10} />
                            Delete Ad
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: METADATA & SCHEMA CONFIG */}
        {activeTab === "metadata" && (
          <div className="space-y-5 pb-6">
            <div className="bg-[#0056D2]/5 border border-[#0056D2]/10 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="text-[#0056D2] shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-black text-[#0056D2]">Live Catalog Configuration</p>
                <p className="mt-0.5 text-slate-500 text-[10px]">
                  Add or delete options in categories, brands, or popular districts. These changes will reflect in real-time across the app listing dropdowns and filters.
                </p>
              </div>
            </div>

            {loadingMeta ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <RefreshCw className="animate-spin text-[#0056D2] mb-2" size={24} />
                <span className="text-xs font-bold">Syncing catalog parameters...</span>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1. Categories Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <Tag className="text-[#0056D2]" size={16} />
                    <h2 className="text-xs font-black text-slate-800">Part Categories ({categories.length})</h2>
                  </div>

                  {/* Add category form */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Add new category (e.g. Lights)"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0056D2]"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="bg-[#0056D2] hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Category Pills List */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {categories.map((cat) => (
                      <span 
                        key={cat} 
                        className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                      >
                        {cat}
                        <button 
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Brand Models Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <Car className="text-[#0056D2]" size={16} />
                    <h2 className="text-xs font-black text-slate-800">Car Brands & Models ({Object.keys(brands).length})</h2>
                  </div>

                  {/* Add Brand Form */}
                  <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <input
                      type="text"
                      placeholder="Brand Name (e.g. Maruti Suzuki)"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0056D2]"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Models comma-separated (e.g. Swift, Alto)"
                        value={newBrandModels}
                        onChange={(e) => setNewBrandModels(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0056D2]"
                      />
                      <button
                        onClick={handleAddBrand}
                        className="bg-[#0056D2] hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center transition-all shrink-0"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Brands List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(brands).map(([brandName, models]) => (
                      <div 
                        key={brandName}
                        className="border border-slate-100 rounded-xl p-2.5 flex items-start justify-between gap-2 bg-slate-50/20"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-800">{brandName}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">
                            Models: {(models as string[]).length > 0 ? (models as string[]).join(", ") : "No specific models"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteBrand(brandName)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Popular Districts / Locations Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <Globe className="text-[#0056D2]" size={16} />
                    <h2 className="text-xs font-black text-slate-800">Popular Locations ({locations.length})</h2>
                  </div>

                  {/* Add Location form */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Add new district name"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0056D2]"
                    />
                    <button
                      onClick={handleAddLocation}
                      className="bg-[#0056D2] hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Locations pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {locations.map((loc) => (
                      <span 
                        key={loc} 
                        className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                      >
                        {loc}
                        <button 
                          onClick={() => handleDeleteLocation(loc)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 4: BROADCAST SYSTEM */}
        {activeTab === "announcements" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2.5 select-none">
                <Megaphone className="text-[#0056D2]" size={18} />
                <h2 className="text-xs font-black text-slate-800">Broadcast Announcement</h2>
              </div>

              {annSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 font-bold flex items-center gap-2 animate-fade-in select-none">
                  <CheckCircle className="text-emerald-500" size={16} />
                  Announcement successfully broadcast to all registered users!
                </div>
              )}

              <form onSubmit={handleSendAnnouncement} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Announcement Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. App Maintenance Scheduled"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#0056D2]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Detailed Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type the message details. This will be sent as an instant in-app notification and message to all users in the marketplace..."
                    value={annText}
                    onChange={(e) => setAnnText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0056D2]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingAnn || !annTitle || !annText}
                  className="w-full bg-[#0056D2] hover:bg-blue-700 disabled:opacity-50 text-white font-black py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md select-none mt-4"
                >
                  <Megaphone size={14} />
                  {sendingAnn ? "Sending Announcement..." : "Broadcast Message"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: APP VERSION MANAGEMENT */}
        {activeTab === "version" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-800">App Version & Update Configuration</h2>
                    <p className="text-[10px] text-slate-400">Manage release metadata stored in Firestore document app_config/version</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadVersionData}
                  disabled={loadingVersion}
                  className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer border border-slate-200"
                  title="Reload version from Firestore"
                >
                  <RefreshCw size={14} className={loadingVersion ? "animate-spin" : ""} />
                </button>
              </div>

              {versionSaveSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 font-bold flex items-center gap-2 animate-fade-in select-none">
                  <CheckCircle className="text-emerald-500" size={16} />
                  App version configuration updated successfully in Firestore!
                </div>
              )}

              <form onSubmit={handleSaveVersionConfig} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Latest Version (latestVersion)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1.1.0"
                      value={vLatestVersion}
                      onChange={(e) => setVLatestVersion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0056D2]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Minimum Supported (minimumSupportedVersion)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1.0.0"
                      value={vMinVersion}
                      onChange={(e) => setVMinVersion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0056D2]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                  <input
                    type="checkbox"
                    id="forceUpdateCheck"
                    checked={vForceUpdate}
                    onChange={(e) => setVForceUpdate(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="forceUpdateCheck" className="text-xs font-bold text-amber-900 cursor-pointer">
                    Force Update Required (forceUpdate)
                    <span className="block text-[10px] text-amber-700 font-normal mt-0.5">
                      When enabled, users cannot dismiss the update dialog or continue using the app until they update.
                    </span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    APK Download URL (apkDownloadUrl)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://autopartsindia.app/download/app-latest.apk"
                    value={vApkUrl}
                    onChange={(e) => setVApkUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0056D2]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Release Date (releaseDate)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-07-22"
                    value={vReleaseDate}
                    onChange={(e) => setVReleaseDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0056D2]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Release Notes (releaseNotes)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe changes in this update..."
                    value={vReleaseNotes}
                    onChange={(e) => setVReleaseNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0056D2]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingVersion}
                  className="w-full bg-[#0056D2] hover:bg-blue-700 disabled:opacity-50 text-white font-black py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md select-none mt-4"
                >
                  <Sparkles size={14} />
                  {savingVersion ? "Saving Version Config..." : "Publish App Update Config"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
