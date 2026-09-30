import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw, ShoppingCart, Users, Scissors, DollarSign, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Order, Customer, CustomRequest, DashboardStats } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'custom_requests'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resOrders, resCust, resReq, resStats] = await Promise.all([
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/customers').then((r) => r.json()),
        fetch('/api/custom-requests').then((r) => r.json()),
        fetch('/api/stats').then((r) => r.json()),
      ]);

      if (resOrders.orders) setOrders(resOrders.orders);
      if (resCust.customers) setCustomers(resCust.customers);
      if (resReq.requests) setCustomRequests(resReq.requests);
      if (resStats.stats) setStats(resStats.stats);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
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

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      `${o.order_number} ${o.customer_name} ${o.customer_phone} ${o.city}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.phone} ${c.email} ${c.city}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredRequests = customRequests.filter((r) =>
    `${r.request_number} ${r.customer_name} ${r.phone} ${r.colour}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col rounded-xl border border-[#3f1731]/15 bg-[#fffdfb] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#3f1731]/15 bg-[#3f1731] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl tracking-wide">ELORIA Store Backend</span>
            <span className="rounded bg-white/20 px-2.5 py-0.5 text-xs uppercase tracking-wider font-semibold">
              SQLite Database
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 gap-4 border-b border-[#3f1731]/10 bg-[#f7eef1]/60 p-4 sm:grid-cols-4">
          <div className="rounded-lg border border-[#3f1731]/10 bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-[#705b66]">
              <span className="text-xs uppercase font-medium">Orders</span>
              <ShoppingCart size={16} className="text-[#8b3e67]" />
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-[#2a1722]">
              {stats?.totalOrders ?? orders.length}
            </p>
          </div>

          <div className="rounded-lg border border-[#3f1731]/10 bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-[#705b66]">
              <span className="text-xs uppercase font-medium">Revenue</span>
              <DollarSign size={16} className="text-[#8b3e67]" />
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-[#2a1722]">
              Rs. {(stats?.totalRevenue ?? orders.reduce((s, o) => s + o.total_amount, 0)).toLocaleString('en-PK')}
            </p>
          </div>

          <div className="rounded-lg border border-[#3f1731]/10 bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-[#705b66]">
              <span className="text-xs uppercase font-medium">Customers</span>
              <Users size={16} className="text-[#8b3e67]" />
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-[#2a1722]">
              {stats?.totalCustomers ?? customers.length}
            </p>
          </div>

          <div className="rounded-lg border border-[#3f1731]/10 bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-[#705b66]">
              <span className="text-xs uppercase font-medium">Custom Inquiries</span>
              <Scissors size={16} className="text-[#8b3e67]" />
            </div>
            <p className="mt-2 font-serif text-2xl font-bold text-[#2a1722]">
              {stats?.totalCustomRequests ?? customRequests.length}
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col gap-3 border-b border-[#3f1731]/10 px-6 py-3 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === 'orders'
                  ? 'bg-[#3f1731] text-white shadow-xs'
                  : 'text-[#705b66] hover:bg-[#f7eef1]'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === 'customers'
                  ? 'bg-[#3f1731] text-white shadow-xs'
                  : 'text-[#705b66] hover:bg-[#f7eef1]'
              }`}
            >
              Customer Database ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('custom_requests')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === 'custom_requests'
                  ? 'bg-[#3f1731] text-white shadow-xs'
                  : 'text-[#705b66] hover:bg-[#f7eef1]'
              }`}
            >
              Custom Stitching Requests ({customRequests.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded border border-[#3f1731]/20 bg-neutral-50 px-3 py-1.5 text-sm">
              <Search size={15} className="text-[#8b3e67]" />
              <input
                type="text"
                placeholder="Search database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 sm:w-56 bg-transparent outline-none text-xs"
              />
            </div>

            {activeTab === 'orders' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-[#3f1731]/20 bg-neutral-50 px-2 py-1.5 text-xs text-[#2a1722] outline-none"
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

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fffdfb]">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center text-[#705b66]">
                  <p className="font-serif text-xl">No orders found.</p>
                  <p className="mt-1 text-xs">Customer orders will appear here as soon as they are placed.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div
                      key={order.id}
                      className="rounded-lg border border-[#3f1731]/15 bg-white p-5 shadow-xs transition hover:border-[#3f1731]/30"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-bold text-[#3f1731]">
                              {order.order_number}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
                          </div>

                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#705b66]">
                            <span>
                              <strong>Customer:</strong> {order.customer_name}
                            </span>
                            <span>
                              <strong>Phone:</strong> {order.customer_phone}
                            </span>
                            <span>
                              <strong>City:</strong> {order.city}
                            </span>
                            <span>
                              <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-[#705b66]">Total Amount</div>
                            <div className="font-serif text-lg font-bold text-[#2a1722]">
                              Rs. {order.total_amount.toLocaleString('en-PK')}
                            </div>
                          </div>

                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="rounded border border-[#3f1731]/20 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-[#2a1722] outline-none"
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
                            className="rounded p-1.5 text-[#705b66] hover:bg-neutral-100"
                            aria-label="Expand order details"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="mt-4 border-t border-[#3f1731]/10 pt-4 text-xs">
                          <div className="grid gap-4 md:grid-cols-2">
                            {/* Items */}
                            <div className="space-y-2">
                              <span className="font-semibold text-[#2a1722] block">
                                Ordered Items ({order.items?.length || 0}):
                              </span>
                              <div className="divide-y divide-neutral-100 rounded border border-[#3f1731]/10 bg-neutral-50/50 p-2">
                                {order.items?.map((it, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between py-1.5"
                                  >
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={it.product.image}
                                        alt={it.product.name}
                                        className="h-9 w-7 object-cover rounded-xs"
                                      />
                                      <div>
                                        <div className="font-medium text-[#2a1722]">
                                          {it.product.name}
                                        </div>
                                        <div className="text-[0.7rem] text-[#705b66]">
                                          Size: {it.size} &middot; Qty: {it.quantity}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="font-semibold text-[#2a1722]">
                                      Rs. {(it.product.price * it.quantity).toLocaleString('en-PK')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 rounded border border-[#3f1731]/10 bg-neutral-50/50 p-3 text-xs leading-5">
                              <div>
                                <strong>Delivery Address:</strong> {order.address}, {order.city}
                              </div>
                              <div>
                                <strong>Payment Method:</strong> {order.payment_method.toUpperCase()}
                              </div>
                              {order.customer_email && (
                                <div>
                                  <strong>Email:</strong> {order.customer_email}
                                </div>
                              )}
                              {order.notes && (
                                <div>
                                  <strong>Special Instructions:</strong> {order.notes}
                                </div>
                              )}
                              <div className="pt-2 border-t border-neutral-200 flex justify-between font-medium">
                                <span>Subtotal: Rs. {order.subtotal?.toLocaleString('en-PK')}</span>
                                <span>Delivery: {order.delivery_fee === 0 ? 'Free' : `Rs. ${order.delivery_fee}`}</span>
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

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="overflow-x-auto rounded-lg border border-[#3f1731]/15 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#3f1731]/10 bg-[#f7eef1] text-[#2a1722]">
                  <tr>
                    <th className="p-3.5 font-semibold">Customer</th>
                    <th className="p-3.5 font-semibold">Phone</th>
                    <th className="p-3.5 font-semibold">City</th>
                    <th className="p-3.5 font-semibold">Address</th>
                    <th className="p-3.5 font-semibold text-center">Orders</th>
                    <th className="p-3.5 font-semibold text-right">Total Spent</th>
                    <th className="p-3.5 font-semibold">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3f1731]/10">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#705b66]">
                        No customer records yet.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#f7eef1]/30">
                        <td className="p-3.5 font-medium text-[#2a1722]">
                          <div>{cust.name}</div>
                          {cust.email && <div className="text-[0.7rem] text-[#705b66]">{cust.email}</div>}
                        </td>
                        <td className="p-3.5 font-mono text-[#3f1731]">{cust.phone}</td>
                        <td className="p-3.5">{cust.city}</td>
                        <td className="p-3.5 max-w-xs truncate text-[#705b66]">{cust.address}</td>
                        <td className="p-3.5 text-center font-bold text-[#2a1722]">{cust.total_orders}</td>
                        <td className="p-3.5 text-right font-serif font-bold text-[#2a1722]">
                          Rs. {cust.total_spent?.toLocaleString('en-PK')}
                        </td>
                        <td className="p-3.5 text-[#705b66]">
                          {new Date(cust.last_order_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* CUSTOM REQUESTS TAB */}
          {activeTab === 'custom_requests' && (
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="py-16 text-center text-[#705b66]">
                  <p className="font-serif text-xl">No custom requests yet.</p>
                  <p className="mt-1 text-xs">Customer requests submitted via &quot;Design Your Own&quot; will be stored here.</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-lg border border-[#3f1731]/15 bg-white p-5 shadow-xs"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-[#8b3e67]">
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
                        </div>
                        <h4 className="mt-1 font-serif text-lg text-[#2a1722]">
                          {req.customer_name} &middot; {req.phone}
                        </h4>
                      </div>

                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateCustomStatus(req.id, e.target.value)}
                        className="rounded border border-[#3f1731]/20 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-[#2a1722] outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded bg-[#f7eef1]/60 p-3 text-xs sm:grid-cols-4">
                      <div>
                        <strong className="text-[#705b66] block">Length:</strong>
                        <span className="font-medium text-[#2a1722]">{req.length}</span>
                      </div>
                      <div>
                        <strong className="text-[#705b66] block">Sleeves:</strong>
                        <span className="font-medium text-[#2a1722]">{req.sleeves}</span>
                      </div>
                      <div>
                        <strong className="text-[#705b66] block">Size:</strong>
                        <span className="font-medium text-[#2a1722]">{req.size}</span>
                      </div>
                      <div>
                        <strong className="text-[#705b66] block">Colour:</strong>
                        <span className="font-medium text-[#2a1722]">{req.colour}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="mt-3 text-xs text-[#705b66] bg-neutral-50 p-2.5 border border-neutral-200 rounded">
                        <strong>Notes:</strong> {req.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
