const rescueModel = require('../models/rescueModel');
const notificationService = require('../services/notificationService');

const parsePagination = (query) => ({
  page: parseInt(query.page, 10) || 1,
  limit: Math.min(parseInt(query.limit, 10) || 20, 50),
});

const getMissions = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const { status, urgency, vehicle_required, search } = req.query;

    const result = await rescueModel.getAllMissions(req.supabase, {
      status,
      urgency,
      vehicle_required,
      search,
      page,
      limit,
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getMissionById = async (req, res, next) => {
  try {
    const mission = await rescueModel.getMissionById(req.supabase, req.params.id);
    return res.json({ success: true, data: mission });
  } catch (error) {
    return next(error);
  }
};

const createMission = async (req, res, next) => {
  try {
    const {
      title,
      donor_name,
      pickup_address,
      recipient_name,
      dropoff_address,
      food_category,
      weight_kg,
      vehicle_required,
      urgency,
      requires_refrigeration,
      notes,
      pickup_window,
      distance_km,
    } = req.body;

    if (!title || !pickup_address || !dropoff_address) {
      return res.status(400).json({
        success: false,
        message: 'Title, pickup address, and dropoff address are required.',
      });
    }

    const mission = await rescueModel.createMission(req.supabase, {
      title,
      donor_id: req.user?.id || 'donor_user',
      donor_name: donor_name || 'Generous Donor Partner',
      pickup_address,
      recipient_id: 'rec_partner',
      recipient_name: recipient_name || 'Community Shelter Hub',
      dropoff_address,
      food_category: food_category || 'General Food Surplus',
      weight_kg: Number(weight_kg) || 10,
      vehicle_required: vehicle_required || 'bike',
      urgency: urgency || 'urgent',
      requires_refrigeration: Boolean(requires_refrigeration),
      notes: notes || '',
      pickup_window: pickup_window || 'Next 2-3 hours',
      distance_km: Number(distance_km) || 3.0,
    });

    return res.status(201).json({ success: true, data: mission });
  } catch (error) {
    return next(error);
  }
};

const claimMission = async (req, res, next) => {
  try {
    const { volunteer_name } = req.body;
    const volunteerId = req.user?.id || `vol_${Date.now()}`;
    const volunteerName = volunteer_name || req.user?.name || 'Volunteer Courier';

    const mission = await rescueModel.claimMission(req.supabase, req.params.id, {
      id: volunteerId,
      name: volunteerName,
    });

    // Notify user asynchronously
    (async () => {
      try {
        if (req.user?.id) {
          await notificationService.createNotification(req.supabase, {
            user_id: req.user.id,
            title: 'Rescue Mission Accepted! 🚴',
            message: `You accepted rescue mission "${mission.title}". Head to ${mission.pickup_address} for pickup.`,
            type: 'rescue',
            link: '/volunteers',
            metadata: { missionId: mission.id },
          });
        }
      } catch (err) {
        console.warn('Failed to send rescue notification:', err.message);
      }
    })();

    return res.json({ success: true, data: mission });
  } catch (error) {
    return next(error);
  }
};

const updateMissionStatus = async (req, res, next) => {
  try {
    const { status, notes, verification_code } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const updated = await rescueModel.updateMissionStatus(req.supabase, req.params.id, {
      status,
      notes,
      verification_code,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await rescueModel.getRescueStatistics();
    return res.json({ success: true, data: stats });
  } catch (error) {
    return next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const couriers = await rescueModel.getCouriersLeaderboard();
    return res.json({ success: true, data: couriers });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMissions,
  getMissionById,
  createMission,
  claimMission,
  updateMissionStatus,
  getStats,
  getLeaderboard,
};
