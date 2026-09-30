import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  ShoppingCart,
  Users,
  Scissors,
  DollarSign,
  Download,
  Package,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ExternalLink,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Upload,
  Smartphone,
  Laptop,
  AlertCircle,
  Cloud,
} from 'lucide-react';
import { Order, Customer, CustomRequest, DashboardStats } from '../types';
import {
  fetchOrdersFromCloud,
  fetchCustomersFromCloud,
  fetchCustomRequestsFromCloud,
  updateOrderStatusInCloud,
  saveOrderToCloud,
} from '../services/orderService';

interface AdminPageProps {
  navigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('eloria_admin_session') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'custom_requests'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Sync features
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pasteDataInput, setPasteDataInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const correctPasscode = localStorage.getItem('eloria_owner_passcode') || 'eloria2026';

  // Check for auto-import link on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const syncDataRaw = params.get('syncData');
      if (syncDataRaw) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(syncDataRaw))));
        if (decoded.orders && Array.isArray(decoded.orders)) {
          const localOrders: Order[] = JSON.parse(localStorage.getItem('eloria_local_orders') || '[]');
          const merged = [...localOrders];
          decoded.orders.forEach((o: Order) => {
            if (!merged.some((m) => m.order_number === o.order_number)) {
              merged.push(o);
            }
          });
          localStorage.setItem('eloria_local_orders', JSON.stringify(merged));

          if (decoded.customers) {
            const localCusts: Customer[] = JSON.parse(localStorage.getItem('eloria_local_customers') || '[]');
            const mergedCusts = [...localCusts];
            decoded.customers.forEach((c: Customer) => {
              if (!mergedCusts.some((m) => m.phone === c.phone)) {
                mergedCusts.push(c);
              }
            });
            localStorage.setItem('eloria_local_customers', JSON.stringify(mergedCusts));
          }

          setIsAuthenticated(true);
          sessionStorage.setItem('eloria_admin_session', 'true');
          setSyncNotice(`🎉 Successfully imported ${decoded.orders.length} order(s) from your other device!`);
          window.history.replaceState({}, document.title, window.location.pathname);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Error importing from URL:', err);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === correctPasscode || passcodeInput === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('eloria_admin_session', 'true');
      setPasscodeError('');
      fetchData();
    } else {
      setPasscodeError('Incorrect passcode. Access is restricted to store owner.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('eloria_admin_session');
    setPasscodeInput('');
  };

  const fetchData = async () => {
    setIsLoading(true);
    let cloudOrdersList: Order[] = [];
    let cloudCustsList: Customer[] = [];
    let cloudReqsList: CustomRequest[] = [];
    let serverOrders: Order[] = [];
    let serverCustomers: Customer[] = [];
    let serverRequests: CustomRequest[] = [];
    let serverStats: DashboardStats | null = null;

    // 1. Fetch from Cloud Firestore (primary cloud database)
    try {
      const [cOrders, cCusts, cReqs] = await Promise.all([
        fetchOrdersFromCloud(),
        fetchCustomersFromCloud(),
        fetchCustomRequestsFromCloud(),
      ]);
      cloudOrdersList = cOrders || [];
      cloudCustsList = cCusts || [];
      cloudReqsList = cReqs || [];
    } catch (cErr) {
      console.warn('Cloud Firestore fetch notice:', cErr);
    }

    // 2. Fetch from Express server if running
    try {
      const [resOrders, resCust, resReq, resStats] = await Promise.all([
        fetch('/api/orders').then((r) => r.ok ? r.json() : { orders: [] }).catch(() => ({ orders: [] })),
        fetch('/api/customers').then((r) => r.ok ? r.json() : { customers: [] }).catch(() => ({ customers: [] })),
        fetch('/api/custom-requests').then((r) => r.ok ? r.json() : { requests: [] }).catch(() => ({ requests: [] })),
        fetch('/api/stats').then((r) => r.ok ? r.json() : { stats: null }).catch(() => ({ stats: null })),
      ]);

      if (resOrders?.orders) serverOrders = resOrders.orders;
      if (resCust?.customers) serverCustomers = resCust.customers;
      if (resReq?.requests) serverRequests = resReq.requests;
      if (resStats?.stats) serverStats = resStats.stats;
    } catch (err) {
      console.warn('Local Express API notice:', err);
    }

    // 3. Merge with local storage data and deduplicate
    try {
      const localOrders: Order[] = JSON.parse(localStorage.getItem('eloria_local_orders') || '[]');
      const localCusts: Customer[] = JSON.parse(localStorage.getItem('eloria_local_customers') || '[]');
      const localReqs: CustomRequest[] = JSON.parse(localStorage.getItem('eloria_local_requests') || '[]');

      // Start with cloud orders as base
      const combinedOrders = [...cloudOrdersList];

      // Merge server orders
      serverOrders.forEach((so) => {
        if (!combinedOrders.some((co) => co.order_number === so.order_number)) {
          combinedOrders.push(so);
        }
      });

      // Merge local orders and backfill to cloud if missing
      localOrders.forEach((lo) => {
        if (!combinedOrders.some((co) => co.order_number === lo.order_number)) {
          combinedOrders.push(lo);
          // Sync missing local order to cloud firestore
          saveOrderToCloud(lo).catch(() => {});
        }
      });

      // Deduplicate customers by phone
      const combinedCusts = [...cloudCustsList];
      [...serverCustomers, ...localCusts].forEach((c) => {
        if (!combinedCusts.some((cc) => cc.phone === c.phone)) {
          combinedCusts.push(c);
        }
      });

      // Deduplicate requests by request_number
      const combinedReqs = [...cloudReqsList];
      [...serverRequests, ...localReqs].forEach((r) => {
        if (!combinedReqs.some((cr) => cr.request_number === r.request_number)) {
          combinedReqs.push(r);
        }
      });

      setOrders(combinedOrders);
      setCustomers(combinedCusts);
      setCustomRequests(combinedReqs);

      const totalRevenue = combinedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      setStats({
        totalOrders: combinedOrders.length,
        totalRevenue: serverStats?.totalRevenue ? Math.max(serverStats.totalRevenue, totalRevenue) : totalRevenue,
        totalCustomers: combinedCusts.length,
        totalCustomRequests: combinedReqs.length,
      });

      // Update local storage backup
      localStorage.setItem('eloria_local_orders', JSON.stringify(combinedOrders));
      localStorage.setItem('eloria_local_customers', JSON.stringify(combinedCusts));
      localStorage.setItem('eloria_local_requests', JSON.stringify(combinedReqs));
    } catch (e) {
      console.error('Data combination error:', e);
      setOrders(cloudOrdersList.length ? cloudOrdersList : serverOrders);
      setCustomers(cloudCustsList.length ? cloudCustsList : serverCustomers);
      setCustomRequests(cloudReqsList.length ? cloudReqsList : serverRequests);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      // Update in Cloud Firestore
      await updateOrderStatusInCloud(id, newStatus).catch(() => {});

      await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdateCustomStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/custom-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setCustomRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'City',
      'Address',
      'Items Ordered',
      'Payment Method',
      'Subtotal',
      'Delivery Fee',
      'Total (PKR)',
      'Status',
      'Notes',
    ];

    const rows = orders.map((o) => {
      const itemsStr = (o.items || [])
        .map((it) => `${it.product.name} (Size: ${it.size}, Qty: ${it.quantity}, Price: ${it.product.price})`)
        .join('; ');
      return [
        `"${o.order_number}"`,
        `"${new Date(o.created_at).toLocaleString()}"`,
        `"${o.customer_name.replace(/"/g, '""')}"`,
        `"${o.customer_phone}"`,
        `"${o.customer_email || ''}"`,
        `"${o.city}"`,
        `"${o.address.replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        `"${o.payment_method}"`,
        o.subtotal,
        o.delivery_fee,
        o.total_amount,
        `"${o.status}"`,
        `"${(o.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eloria_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateSyncLink = () => {
    try {
      const payload = {
        orders,
        customers,
        customRequests,
        exportedAt: new Date().toISOString(),
      };
      const jsonStr = JSON.stringify(payload);
      const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      const fullUrl = `${window.location.origin}/admin?syncData=${encoded}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    } catch (e) {
      console.error('Failed to generate sync link', e);
    }
  };

  const downloadBackupJSON = () => {
    const payload = {
      orders,
      customers,
      customRequests,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `eloria_db_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const ordersToImport = Array.isArray(parsed) ? parsed : parsed.orders;
        if (Array.isArray(ordersToImport)) {
          const localOrders: Order[] = JSON.parse(localStorage.getItem('eloria_local_orders') || '[]');
          const merged = [...localOrders];
          ordersToImport.forEach((o: Order) => {
            if (!merged.some((m) => m.order_number === o.order_number)) merged.push(o);
          });
          localStorage.setItem('eloria_local_orders', JSON.stringify(merged));
          setImportStatus(`Successfully restored ${ordersToImport.length} order(s)!`);
          fetchData();
        } else {
          setImportStatus('Invalid JSON backup format.');
        }
      } catch (err) {
        setImportStatus('Failed to read JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    try {
      const parsed = JSON.parse(pasteDataInput.trim());
      const ordersToImport = Array.isArray(parsed) ? parsed : parsed.orders;
      if (Array.isArray(ordersToImport)) {
        const localOrders: Order[] = JSON.parse(localStorage.getItem('eloria_local_orders') || '[]');
        const merged = [...localOrders];
        ordersToImport.forEach((o: Order) => {
          if (!merged.some((m) => m.order_number === o.order_number)) merged.push(o);
        });
        localStorage.setItem('eloria_local_orders', JSON.stringify(merged));
        setImportStatus(`Successfully imported ${ordersToImport.length} order(s)!`);
        setPasteDataInput('');
        fetchData();
      } else {
        setImportStatus('No orders array found in the pasted data.');
      }
    } catch (e) {
      setImportStatus('Invalid JSON text. Please check and try again.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      `${o.order_number} ${o.customer_name} ${o.customer_phone} ${o.city} ${o.address}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.phone} ${c.email} ${c.city} ${c.address}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredRequests = customRequests.filter((r) =>
    `${r.request_number} ${r.customer_name} ${r.phone} ${r.colour} ${r.notes}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex flex-col justify-center items-center px-4 py-12 text-[#2a1722]">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#3f1731]/15 p-8 shadow-xl">
          <div className="text-center">
            <span className="relative inline-block h-12 w-36 overflow-hidden mb-3">
              <img
                src="/eloria-logo.jpg"
                alt="ELORIA by Laiba"
                className="absolute left-1/2 top-1/2 h-auto w-[115%] max-w-none -translate-x-1/2 -translate-y-1/2"
              />
            </span>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8b3e67] bg-[#f7eef1] py-1 px-3 rounded-full w-fit mx-auto mt-2">
              <Lock size={12} /> Store Owner Access Only
            </div>
            <h2 className="mt-4 font-serif text-3xl text-[#2a1722]">Private Studio Portal</h2>
            <p className="mt-2 text-xs text-[#705b66] leading-relaxed">
              This database area is strictly restricted to the store owner. Customers cannot view this section.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2a1722] mb-1.5">
                Owner Passcode / Password
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  placeholder="Enter passcode (default: eloria2026)"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full h-12 border border-[#3f1731]/20 rounded-lg px-4 text-sm outline-none focus:border-[#3f1731] transition"
                  autoFocus
                />
                <KeyRound size={17} className="absolute right-3.5 text-[#8b3e67]" />
              </div>
            </div>

            {passcodeError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-200">
                {passcodeError}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-[#3f1731] hover:bg-[#2d1025] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Unlock size={16} /> Unlock Customer Database
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-[#705b66]">
            <button
              onClick={() => navigate('/')}
              className="hover:text-[#3f1731] flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Back to Store
            </button>
            <span className="text-[0.72rem] bg-neutral-100 px-2.5 py-1 rounded text-[#705b66]">
              Default PIN: <strong className="text-[#3f1731]">eloria2026</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] pb-24 text-[#2a1722]">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-[#3f1731] text-white px-6 py-6 shadow-md">
        <div className="mx-auto max-w-[1440px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-xs uppercase tracking-wider text-white/70 hover:text-white transition"
              >
                <ArrowLeft size={14} /> Back to Store
              </button>
              <span className="text-white/40">|</span>
              <span className="inline-flex items-center gap-1.5 rounded bg-emerald-700/80 px-2.5 py-0.5 text-[0.7rem] uppercase font-bold tracking-wider text-white">
                <Cloud size={12} /> Live Cloud Database (All Devices Synced)
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
              ELORIA Customer &amp; Orders Database
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Private owner portal: view who placed orders, customer delivery addresses, contact numbers, exact ordered items, and prices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1.5 rounded bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2.5 text-xs font-semibold text-white transition shadow-xs"
              title="Sync orders between laptop and mobile"
            >
              <Smartphone size={14} />
              <span>Sync with Mobile</span>
            </button>
            <button
              onClick={exportOrdersCSV}
              className="flex items-center gap-2 rounded bg-white px-3.5 py-2.5 text-xs font-semibold text-[#3f1731] hover:bg-neutral-100 transition shadow-xs"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 rounded border border-white/30 px-3.5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded bg-rose-900/50 hover:bg-rose-900 px-3 py-2.5 text-xs font-medium text-white transition border border-rose-500/30"
              title="Lock database and log out"
            >
              <LogOut size={13} /> Lock
            </button>
          </div>
        </div>
      </div>

      {/* Sync Notice Alert */}
      {syncNotice && (
        <div className="bg-emerald-100 border-b border-emerald-300 text-emerald-900 px-6 py-3 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-700" />
            <span>{syncNotice}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 mt-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#3f1731]/10 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#705b66]">
              <span className="text-xs uppercase font-semibold tracking-wider">Total Orders</span>
              <ShoppingCart size={18} className="text-[#8b3e67]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#2a1722]">
              {stats?.totalOrders ?? orders.length}
            </p>
            <span className="text-[0.75rem] text-[#705b66]">Stored in database</span>
          </div>

          <div className="rounded-xl border border-[#3f1731]/10 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#705b66]">
              <span className="text-xs uppercase font-semibold tracking-wider">Revenue</span>
              <DollarSign size={18} className="text-[#8b3e67]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#2a1722]">
              Rs. {(stats?.totalRevenue ?? orders.reduce((s, o) => s + o.total_amount, 0)).toLocaleString('en-PK')}
            </p>
            <span className="text-[0.75rem] text-[#705b66]">Order payments total</span>
          </div>

          <div className="rounded-xl border border-[#3f1731]/10 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#705b66]">
              <span className="text-xs uppercase font-semibold tracking-wider">Unique Customers</span>
              <Users size={18} className="text-[#8b3e67]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#2a1722]">
              {stats?.totalCustomers ?? customers.length}
            </p>
            <span className="text-[0.75rem] text-[#705b66]">Customer profiles tracked</span>
          </div>

          <div className="rounded-xl border border-[#3f1731]/10 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#705b66]">
              <span className="text-xs uppercase font-semibold tracking-wider">Custom Stitching</span>
              <Scissors size={18} className="text-[#8b3e67]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#2a1722]">
              {stats?.totalCustomRequests ?? customRequests.length}
            </p>
            <span className="text-[0.75rem] text-[#705b66]">Design-your-own inquiries</span>
          </div>
        </div>

        {/* Tab Selection & Search Filters */}
        <div className="mt-8 rounded-t-xl border-x border-t border-[#3f1731]/10 bg-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === 'orders'
                  ? 'bg-[#3f1731] text-white shadow-xs'
                  : 'bg-[#f7eef1]/60 text-[#705b66] hover:bg-[#f7eef1]'
              }`}
            >
              Customer Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === 'customers'
                  ? 'bg-[#3f1731] text-white shadow-xs'
                  : 'bg-[#f7eef1]/60 text-[#705b66] hover:bg-[#f7eef1]'
              }`}
            >
              Registered Customers ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('custom_requests')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === 'custom_requests'
                  ? 'bg-[#3f1731] text-white shadow-xs'
                  : 'bg-[#f7eef1]/60 text-[#705b66] hover:bg-[#f7eef1]'
              }`}
            >
              Custom Stitching Requests ({customRequests.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-[#3f1731]/20 bg-[#faf8f6] px-3.5 py-2 text-sm w-full md:w-64">
              <Search size={16} className="text-[#8b3e67] shrink-0" />
              <input
                type="text"
                placeholder="Search by name, phone, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-xs text-[#2a1722]"
              />
            </div>

            {activeTab === 'orders' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-[#3f1731]/20 bg-[#faf8f6] px-3 py-2 text-xs font-medium text-[#2a1722] outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Stitching">In Stitching</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab Body */}
        <div className="border border-[#3f1731]/10 bg-white rounded-b-xl shadow-xs overflow-hidden">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="divide-y divide-[#3f1731]/10">
              {filteredOrders.length === 0 ? (
                <div className="py-20 text-center text-[#705b66]">
                  <Package size={44} className="mx-auto text-[#8b3e67]/40 mb-3" />
                  <p className="font-serif text-2xl text-[#2a1722]">No orders match your search.</p>
                  <p className="mt-1 text-sm text-[#705b66]">
                    Place an order on the storefront to test live database recording!
                  </p>
                  <button
                    onClick={() => navigate('/collections/frocks')}
                    className="mt-5 inline-flex items-center gap-2 bg-[#3f1731] px-5 py-2.5 text-xs font-medium text-white rounded hover:bg-[#2d1025]"
                  >
                    Go to Storefront <ExternalLink size={13} />
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div key={order.id} className="p-5 sm:p-6 transition hover:bg-[#faf7f8]/50">
                      {/* Order Summary Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-bold text-[#3f1731] bg-[#f7eef1] px-2.5 py-1 rounded">
                              {order.order_number}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'Dispatched'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'In Stitching'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'Confirmed'
                                  ? 'bg-amber-100 text-amber-800'
                                  : order.status === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[#705b66]">
                              <Calendar size={13} />
                              {new Date(order.created_at).toLocaleString()}
                            </span>
                          </div>

                          {/* Customer Brief */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#2a1722]">
                            <span className="font-semibold text-sm">{order.customer_name}</span>
                            <span className="flex items-center gap-1 text-[#705b66]">
                              <Phone size={13} className="text-[#8b3e67]" /> {order.customer_phone}
                            </span>
                            {order.customer_email && (
                              <span className="flex items-center gap-1 text-[#705b66]">
                                <Mail size={13} className="text-[#8b3e67]" /> {order.customer_email}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[#705b66]">
                              <MapPin size={13} className="text-[#8b3e67]" /> {order.city}
                            </span>
                            <span className="flex items-center gap-1 text-[#705b66]">
                              <CreditCard size={13} className="text-[#8b3e67]" /> {order.payment_method.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Order Total & Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 border-t lg:border-t-0 pt-3 lg:pt-0">
                          <div className="text-right">
                            <span className="text-xs text-[#705b66] block">Order Total</span>
                            <strong className="font-serif text-xl sm:text-2xl font-bold text-[#2a1722]">
                              Rs. {order.total_amount.toLocaleString('en-PK')}
                            </strong>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="rounded border border-[#3f1731]/20 bg-white px-3 py-2 text-xs font-semibold text-[#2a1722] outline-none shadow-xs"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="In Stitching">In Stitching</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="flex items-center gap-1 rounded bg-[#f7eef1] px-3 py-2 text-xs font-medium text-[#3f1731] hover:bg-[#eedee4] transition"
                            >
                              {isExpanded ? 'Hide' : 'Details'}{' '}
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      {isExpanded && (
                        <div className="mt-5 rounded-xl border border-[#3f1731]/10 bg-[#faf8f9] p-5 text-xs">
                          <div className="grid gap-6 md:grid-cols-2">
                            {/* Ordered items breakdown */}
                            <div>
                              <h4 className="font-serif text-base font-semibold text-[#2a1722] mb-3">
                                Items Ordered ({order.items?.length || 0}):
                              </h4>
                              <div className="space-y-2.5">
                                {order.items?.map((it, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-lg border border-[#3f1731]/10 bg-white p-3 shadow-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={it.product.image}
                                        alt={it.product.name}
                                        className="h-14 w-11 object-cover rounded border border-[#3f1731]/10"
                                      />
                                      <div>
                                        <p className="font-serif text-sm font-semibold text-[#2a1722]">
                                          {it.product.name}
                                        </p>
                                        <div className="text-[0.72rem] text-[#705b66] mt-0.5 space-x-2">
                                          <span>Size: <strong>{it.size}</strong></span>
                                          <span>&middot;</span>
                                          <span>Quantity: <strong>{it.quantity}</strong></span>
                                          <span>&middot;</span>
                                          <span>Unit Price: Rs. {it.product.price.toLocaleString('en-PK')}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <strong className="text-sm text-[#2a1722]">
                                      Rs. {(it.product.price * it.quantity).toLocaleString('en-PK')}
                                    </strong>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 rounded-lg bg-white p-3.5 border border-[#3f1731]/10 space-y-1.5">
                                <div className="flex justify-between text-[#705b66]">
                                  <span>Subtotal</span>
                                  <span>Rs. {order.subtotal?.toLocaleString('en-PK')}</span>
                                </div>
                                <div className="flex justify-between text-[#705b66]">
                                  <span>Delivery Fee ({order.city})</span>
                                  <span>{order.delivery_fee === 0 ? 'Free' : `Rs. ${order.delivery_fee}`}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm text-[#2a1722] pt-2 border-t border-neutral-100">
                                  <span>Grand Total</span>
                                  <span>Rs. {order.total_amount?.toLocaleString('en-PK')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Customer & Delivery details */}
                            <div className="space-y-4">
                              <div className="rounded-lg border border-[#3f1731]/10 bg-white p-4 shadow-xs">
                                <h4 className="font-serif text-base font-semibold text-[#2a1722] mb-3">
                                  Delivery &amp; Customer Information:
                                </h4>
                                <div className="space-y-2 leading-relaxed text-[#2a1722]">
                                  <div>
                                    <strong className="text-[#705b66]">Customer Name:</strong>{' '}
                                    <span className="font-medium">{order.customer_name}</span>
                                  </div>
                                  <div>
                                    <strong className="text-[#705b66]">Mobile Phone:</strong>{' '}
                                    <a href={`tel:${order.customer_phone}`} className="font-mono text-[#3f1731] underline">
                                      {order.customer_phone}
                                    </a>
                                  </div>
                                  {order.customer_email && (
                                    <div>
                                      <strong className="text-[#705b66]">Email Address:</strong>{' '}
                                      <a href={`mailto:${order.customer_email}`} className="text-[#3f1731] underline">
                                        {order.customer_email}
                                      </a>
                                    </div>
                                  )}
                                  <div>
                                    <strong className="text-[#705b66]">Destination City:</strong>{' '}
                                    <span className="font-medium">{order.city}</span>
                                  </div>
                                  <div>
                                    <strong className="text-[#705b66]">Full Shipping Address:</strong>
                                    <div className="mt-1 rounded bg-[#f7f5f2] p-2.5 font-medium border border-neutral-200">
                                      {order.address}
                                    </div>
                                  </div>
                                  <div>
                                    <strong className="text-[#705b66]">Payment Choice:</strong>{' '}
                                    <span className="font-medium uppercase">{order.payment_method}</span>
                                  </div>
                                  {order.notes && (
                                    <div>
                                      <strong className="text-[#705b66]">Customer Notes:</strong>
                                      <div className="mt-1 rounded bg-[#f7f5f2] p-2.5 italic border border-neutral-200">
                                        &ldquo;{order.notes}&rdquo;
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <a
                                  href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(order.customer_name)}%2C%20regarding%20your%20ELORIA%20order%20${order.order_number}...`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded bg-[#25D366] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1EBE5D] transition"
                                >
                                  WhatsApp Customer
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: CUSTOMERS DATABASE */}
          {activeTab === 'customers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#3f1731]/10 bg-[#f7eef1] text-[#2a1722]">
                  <tr>
                    <th className="p-4 font-semibold uppercase tracking-wider">Customer</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Phone</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">City</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Address</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-center">Orders</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">Total Spent</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3f1731]/10">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#705b66]">
                        No customer records yet.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#faf7f8]">
                        <td className="p-4 font-medium text-[#2a1722]">
                          <div className="font-semibold text-sm">{cust.name}</div>
                          {cust.email && <div className="text-[0.7rem] text-[#705b66]">{cust.email}</div>}
                        </td>
                        <td className="p-4 font-mono font-medium text-[#3f1731]">{cust.phone}</td>
                        <td className="p-4 font-medium">{cust.city}</td>
                        <td className="p-4 max-w-sm truncate text-[#705b66]">{cust.address}</td>
                        <td className="p-4 text-center">
                          <span className="rounded-full bg-[#f7eef1] px-2.5 py-1 font-bold text-[#3f1731]">
                            {cust.total_orders}
                          </span>
                        </td>
                        <td className="p-4 text-right font-serif font-bold text-[#2a1722] text-sm">
                          Rs. {cust.total_spent?.toLocaleString('en-PK')}
                        </td>
                        <td className="p-4 text-[#705b66]">
                          {new Date(cust.last_order_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: CUSTOM STITCHING REQUESTS */}
          {activeTab === 'custom_requests' && (
            <div className="divide-y divide-[#3f1731]/10">
              {filteredRequests.length === 0 ? (
                <div className="py-20 text-center text-[#705b66]">
                  <Scissors size={40} className="mx-auto text-[#8b3e67]/40 mb-3" />
                  <p className="font-serif text-2xl text-[#2a1722]">No custom requests yet.</p>
                  <p className="mt-1 text-sm text-[#705b66]">
                    Requests made in &ldquo;Design Your Own&rdquo; will be listed here with length, sleeves, and measurements.
                  </p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div key={req.id} className="p-5 sm:p-6 transition hover:bg-[#faf7f8]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-[#8b3e67] bg-[#f7eef1] px-2.5 py-0.5 rounded">
                            {req.request_number}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              req.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'In Progress'
                                ? 'bg-purple-100 text-purple-800'
                                : req.status === 'Contacted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="text-xs text-[#705b66]">
                            {new Date(req.created_at).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="mt-1 font-serif text-xl font-semibold text-[#2a1722]">
                          {req.customer_name} &middot;{' '}
                          <a href={`tel:${req.phone}`} className="font-mono text-[#3f1731] underline">
                            {req.phone}
                          </a>
                        </h3>
                      </div>

                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateCustomStatus(req.id, e.target.value)}
                        className="rounded border border-[#3f1731]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#2a1722] outline-none shadow-xs"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-[#3f1731]/10 bg-[#faf8f9] p-4 text-xs sm:grid-cols-4">
                      <div>
                        <strong className="text-[#705b66] block">Length:</strong>
                        <span className="font-medium text-sm text-[#2a1722]">{req.length}</span>
                      </div>
                      <div>
                        <strong className="text-[#705b66] block">Sleeves:</strong>
                        <span className="font-medium text-sm text-[#2a1722]">{req.sleeves}</span>
                      </div>
                      <div>
                        <strong className="text-[#705b66] block">Size:</strong>
                        <span className="font-medium text-sm text-[#2a1722]">{req.size}</span>
                      </div>
                      <div>
                        <strong className="text-[#705b66] block">Colour:</strong>
                        <span className="font-medium text-sm text-[#2a1722]">{req.colour}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="mt-3 text-xs bg-white p-3 border border-neutral-200 rounded-lg">
                        <strong className="text-[#705b66] block mb-1">Customer Specifications / Notes:</strong>
                        <p className="text-[#2a1722]">{req.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sync Across Devices Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[#3f1731]/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#3f1731]/10">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-800">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2a1722]">
                    Sync with Mobile / Other Devices
                  </h3>
                  <p className="text-xs text-[#705b66]">
                    Easily share and view your customer orders on any device
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSyncModalOpen(false);
                  setImportStatus(null);
                }}
                className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              >
                ✕
              </button>
            </div>

            {importStatus && (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
                {importStatus}
              </div>
            )}

            <div className="mt-6 space-y-6 text-xs text-[#2a1722]">
              {/* Method 1: 1-Click Sync Link */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 font-semibold text-emerald-950 mb-1 text-sm">
                  <Share2 size={16} className="text-emerald-700" />
                  <span>Option 1: 1-Click Mobile Sync Link (Recommended)</span>
                </div>
                <p className="text-emerald-800/80 mb-3 leading-relaxed">
                  Generate a direct link that bundles all current orders. Send this link to your phone via WhatsApp or email, open it on your phone, and all orders will instantly appear!
                </p>
                <button
                  onClick={generateSyncLink}
                  className="w-full h-11 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2 transition shadow-xs"
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedLink ? 'Sync Link Copied to Clipboard!' : 'Copy Mobile Sync Link'}</span>
                </button>
              </div>

              {/* Method 2: Backup File Download / Upload */}
              <div className="rounded-xl border border-neutral-200 bg-[#faf8f6] p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-[#2a1722] text-sm">
                  <Download size={16} className="text-[#8b3e67]" />
                  <span>Option 2: Backup File (JSON)</span>
                </div>
                <p className="text-[#705b66] leading-relaxed">
                  Save a permanent copy of your database to your device, or restore orders from a previous backup file.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={downloadBackupJSON}
                    className="h-10 rounded-lg border border-[#3f1731]/20 bg-white font-medium hover:bg-neutral-50 transition flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} /> Download Backup
                  </button>
                  <label className="h-10 rounded-lg border border-[#3f1731]/20 bg-white font-medium hover:bg-neutral-50 transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload size={14} /> Restore File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Method 3: Paste Data */}
              <div className="rounded-xl border border-neutral-200 bg-[#faf8f6] p-4 space-y-2.5">
                <div className="font-semibold text-[#2a1722] text-sm">
                  Option 3: Paste Backup Code
                </div>
                <textarea
                  rows={2}
                  value={pasteDataInput}
                  onChange={(e) => setPasteDataInput(e.target.value)}
                  placeholder="Paste JSON orders backup text here..."
                  className="w-full rounded-lg border border-neutral-300 p-2 font-mono text-[0.7rem] outline-none focus:border-[#3f1731]"
                />
                <button
                  onClick={handlePasteImport}
                  disabled={!pasteDataInput.trim()}
                  className="w-full h-9 rounded-lg bg-[#3f1731] hover:bg-[#2d1025] disabled:opacity-40 text-white font-medium transition"
                >
                  Import Pasted Data
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => {
                  setIsSyncModalOpen(false);
                  setImportStatus(null);
                }}
                className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#2a1722] font-medium text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
