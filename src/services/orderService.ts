import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Order, Customer, CustomRequest } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Save Order to Cloud Firestore
export async function saveOrderToCloud(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const orderDocRef = doc(db, 'orders', order.id);
    await setDoc(orderDocRef, {
      ...order,
      created_at: order.created_at || new Date().toISOString(),
    });

    // Also update/create customer document in Cloud Firestore
    const custId = order.customer_id || 'cust_' + order.customer_phone.replace(/\D/g, '');
    const custDocRef = doc(db, 'customers', custId);
    await setDoc(
      custDocRef,
      {
        id: custId,
        name: order.customer_name,
        phone: order.customer_phone,
        email: order.customer_email || '',
        city: order.city,
        address: order.address,
        total_orders: 1,
        total_spent: order.total_amount,
        created_at: order.created_at || new Date().toISOString(),
        last_order_at: order.created_at || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch all orders from Cloud Firestore
export async function fetchOrdersFromCloud(): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      orders.push({
        id: docSnap.id,
        order_number: data.order_number,
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || '',
        city: data.city,
        address: data.address,
        payment_method: data.payment_method,
        notes: data.notes || '',
        items: data.items || [],
        subtotal: Number(data.subtotal) || 0,
        delivery_fee: Number(data.delivery_fee) || 0,
        total_amount: Number(data.total_amount) || 0,
        status: data.status || 'Pending',
        created_at: data.created_at || new Date().toISOString(),
      });
    });

    // Sort newest first
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return orders;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Update order status in Cloud Firestore
export async function updateOrderStatusInCloud(orderId: string, status: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Save Custom Tailoring Request to Cloud Firestore
export async function saveCustomRequestToCloud(req: CustomRequest): Promise<void> {
  const path = `custom_requests/${req.id}`;
  try {
    const reqDocRef = doc(db, 'custom_requests', req.id);
    await setDoc(reqDocRef, {
      ...req,
      created_at: req.created_at || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch Custom Requests from Cloud Firestore
export async function fetchCustomRequestsFromCloud(): Promise<CustomRequest[]> {
  const path = 'custom_requests';
  try {
    const snapshot = await getDocs(collection(db, path));
    const requests: CustomRequest[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      requests.push({
        id: docSnap.id,
        request_number: data.request_number,
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || '',
        length: data.length,
        sleeves: data.sleeves,
        size: data.size,
        colour: data.colour,
        notes: data.notes || '',
        status: data.status || 'Pending',
        created_at: data.created_at || new Date().toISOString(),
      });
    });
    requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return requests;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Fetch Customers from Cloud Firestore
export async function fetchCustomersFromCloud(): Promise<Customer[]> {
  const path = 'customers';
  try {
    const snapshot = await getDocs(collection(db, path));
    const customers: Customer[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      customers.push({
        id: docSnap.id,
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        city: data.city,
        address: data.address,
        total_orders: Number(data.total_orders) || 1,
        total_spent: Number(data.total_spent) || 0,
        created_at: data.created_at || new Date().toISOString(),
        last_order_at: data.last_order_at || new Date().toISOString(),
      });
    });
    return customers;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
