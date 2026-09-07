const notificationModel = require('../models/notificationModel');

const createNotification = async (supabase, data) =>
  notificationModel.createNotification(supabase, data);

const getUserNotifications = async (supabase, userId, page = 1, limit = 20, unreadOnly = false) =>
  notificationModel.getNotificationsByUser(supabase, userId, page, limit, unreadOnly);

const markAsRead = async (supabase, notificationId, userId) =>
  notificationModel.markAsRead(supabase, notificationId, userId);

const markAllAsRead = async (supabase, userId) =>
  notificationModel.markAllAsRead(supabase, userId);

const deleteNotification = async (supabase, notificationId, userId) =>
  notificationModel.deleteNotification(supabase, notificationId, userId);

const getUnreadCount = async (supabase, userId) =>
  notificationModel.getUnreadCount(supabase, userId);

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
