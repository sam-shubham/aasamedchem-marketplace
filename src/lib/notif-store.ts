import { create } from "zustand";

export type NotifType = "INFO" | "WARNING" | "SUCCESS";

export type Notification = {
 id: string;
 title: string;
 message: string;
 type: NotifType;
 read: boolean;
 link?: string;
 createdAt: string;
 event: string;
};

type NotifStore = {
 notifications: Notification[];
 unreadCount: number;
 isLoading: boolean;
 setNotifications: (n: Notification[]) => void;
 markRead: (id: string) => Promise<void>;
 markAllRead: () => Promise<void>;
 fetchNotifications: () => Promise<void>;
 fetchCount: () => Promise<void>;
};

export const useNotifStore = create<NotifStore>((set, get) => ({
 notifications: [],
 unreadCount: 0,
 isLoading: false,

 setNotifications: (notifications) => {
 const unreadCount = notifications.filter((n) => !n.read).length;
 set({ notifications, unreadCount });
 },

 markRead: async (id) => {
 set((state) => ({
 notifications: state.notifications.map((n) =>
 n.id === id ? { ...n, read: true } : n
 ),
 unreadCount: Math.max(0, state.unreadCount - 1),
 }));
 try {
 await fetch("/api/notifications", {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ id }),
 });
 } catch (error) {
 console.error("Failed to mark notification as read on server:", error);
 }
 },

 markAllRead: async () => {
 await fetch("/api/notifications?all=true", { method: "PATCH" });
 set((state) => ({
 notifications: state.notifications.map((n) => ({ ...n, read: true })),
 unreadCount: 0,
 }));
 },

 fetchNotifications: async () => {
 set({ isLoading: true });
 try {
 const res = await fetch("/api/notifications?limit=30");
 if (res.ok) {
 const data = await res.json();
 get().setNotifications(data.notifications ?? []);
 }
 } finally {
 set({ isLoading: false });
 }
 },

 fetchCount: async () => {
 try {
 const res = await fetch("/api/notifications/count");
 if (res.ok) {
 const data = await res.json();
 set({ unreadCount: data.count });
 }
 } catch {
 // silent
 }
 },
}));