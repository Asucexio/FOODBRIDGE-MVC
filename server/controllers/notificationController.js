const notificationService = require('../services/notificationService');

const parsePagination = (query) => ({
  page: parseInt(query.page, 10) || 1,
  limit: Math.min(parseInt(query.limit, 10) || 20, 50),
});

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const unreadOnly = req.query.unread === 'true';
    const result = await notificationService.getUserNotifications(
      req.supabase,
      req.user.id,
      page,
      limit,
      unreadOnly
    );
    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.supabase, req.user.id);
    return res.json({ success: true, count });
  } catch (error) {
    return next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const updated = await notificationService.markAsRead(
      req.supabase,
      req.params.id,
      req.user.id
    );
    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.supabase, req.user.id);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(
      req.supabase,
      req.params.id,
      req.user.id
    );
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
