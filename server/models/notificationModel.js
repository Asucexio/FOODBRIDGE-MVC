const TABLE = 'notifications';

// In-memory fallback store if Supabase table is not yet migrated in remote DB
const memoryStore = new Map();

const createNotification = async (supabase, notification) => {
  const newNotification = {
    id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: notification.user_id,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info', // 'claim', 'pickup', 'expiry', 'system', 'info'
    link: notification.link || null,
    metadata: notification.metadata || {},
    is_read: false,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from(TABLE).insert(newNotification).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    // Fallback to memory store if table missing
    const userNotifs = memoryStore.get(notification.user_id) || [];
    userNotifs.unshift(newNotification);
    memoryStore.set(notification.user_id, userNotifs);
    return newNotification;
  }
};

const getNotificationsByUser = async (supabase, userId, page = 1, limit = 20, unreadOnly = false) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (err) {
    const userNotifs = memoryStore.get(userId) || [];
    const filtered = unreadOnly ? userNotifs.filter((n) => !n.is_read) : userNotifs;
    const paginated = filtered.slice(from, to + 1);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
    };
  }
};

const markAsRead = async (supabase, notificationId, userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    const userNotifs = memoryStore.get(userId) || [];
    const notif = userNotifs.find((n) => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
    }
    return notif;
  }
};

const markAllAsRead = async (supabase, userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data || [];
  } catch (err) {
    const userNotifs = memoryStore.get(userId) || [];
    userNotifs.forEach((n) => {
      n.is_read = true;
      n.read_at = new Date().toISOString();
    });
    return userNotifs;
  }
};

const deleteNotification = async (supabase, notificationId, userId) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (err) {
    const userNotifs = memoryStore.get(userId) || [];
    memoryStore.set(
      userId,
      userNotifs.filter((n) => n.id !== notificationId)
    );
  }
};

const getUnreadCount = async (supabase, userId) => {
  try {
    const { count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    const userNotifs = memoryStore.get(userId) || [];
    return userNotifs.filter((n) => !n.is_read).length;
  }
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
