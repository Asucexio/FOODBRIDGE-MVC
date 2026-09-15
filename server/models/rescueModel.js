const TABLE = 'rescue_missions';

// Rich seed data for offline / demo mode
const seedMissions = [
  {
    id: 'mission_1',
    title: 'Surplus Bakery & Warm Pastries',
    donor_id: 'user_donor_1',
    donor_name: 'Green Harvest Bakery',
    pickup_address: '142 Baker Street, Sector 4',
    recipient_id: 'user_rec_1',
    recipient_name: 'Hope Community Shelter',
    dropoff_address: '88 Peace Avenue, Downtown',
    food_category: 'Bakery & Bread',
    weight_kg: 18.5,
    vehicle_required: 'bike', // bike, car, van, walk
    urgency: 'critical', // critical, urgent, flexible
    requires_refrigeration: false,
    notes: 'Bakery bags are packed and ready by the back kitchen door. Ring buzzer #2.',
    status: 'available', // available, assigned, picked_up, in_transit, delivered
    volunteer_id: null,
    volunteer_name: null,
    verification_code: '8392',
    pickup_window: 'Within 2 hours',
    distance_km: 2.4,
    est_duration_mins: 12,
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    completed_at: null,
  },
  {
    id: 'mission_2',
    title: 'Chilled Dairy Crates & Fresh Greens',
    donor_id: 'user_donor_2',
    donor_name: 'City Fresh Produce Market',
    pickup_address: '500 Market Square, Dock 3',
    recipient_id: 'user_rec_2',
    recipient_name: 'Downtown Youth Center Pantry',
    dropoff_address: '320 Elm Boulevard, Central',
    food_category: 'Produce & Dairy',
    weight_kg: 42.0,
    vehicle_required: 'car',
    urgency: 'urgent',
    requires_refrigeration: true,
    notes: 'Insulated cooler boxes ready at loading dock 3. Ask for Marco.',
    status: 'assigned',
    volunteer_id: 'vol_alex_1',
    volunteer_name: 'Alex Rivera (Eco-Courier)',
    verification_code: '4910',
    pickup_window: 'Today by 5:00 PM',
    distance_km: 4.8,
    est_duration_mins: 22,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    completed_at: null,
  },
  {
    id: 'mission_3',
    title: 'Prepared Hot Catering Trays (Roasted Veggies & Rice)',
    donor_id: 'user_donor_3',
    donor_name: 'Sunrise Catering Co.',
    pickup_address: '77 Banquet Hall Road',
    recipient_id: 'user_rec_3',
    recipient_name: 'St. Jude Community Kitchen',
    dropoff_address: '15 Mission Way, West District',
    food_category: 'Prepared Meals',
    weight_kg: 26.0,
    vehicle_required: 'car',
    urgency: 'critical',
    requires_refrigeration: false,
    notes: 'Food warmers packed in thermal insulated bags. Please transport promptly.',
    status: 'in_transit',
    volunteer_id: 'vol_sam_2',
    volunteer_name: 'Samantha Chen',
    verification_code: '6125',
    pickup_window: 'Immediate Rescue',
    distance_km: 3.1,
    est_duration_mins: 15,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    completed_at: null,
  },
  {
    id: 'mission_4',
    title: 'Pantry Staples & Canned Legumes Crates',
    donor_id: 'user_donor_4',
    donor_name: 'Metro Grocery Hub',
    pickup_address: '900 Logistics Way, Bay 12',
    recipient_id: 'user_rec_4',
    recipient_name: 'Eastside Food Bank',
    dropoff_address: '404 Solidarity Road',
    food_category: 'Pantry & Canned Goods',
    weight_kg: 75.0,
    vehicle_required: 'van',
    urgency: 'flexible',
    requires_refrigeration: false,
    notes: 'Heavy crates. Hand truck / dolly recommended. Loading bay has ramp.',
    status: 'available',
    volunteer_id: null,
    volunteer_name: null,
    verification_code: '2094',
    pickup_window: 'Anytime before 8:00 PM',
    distance_km: 6.5,
    est_duration_mins: 28,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    completed_at: null,
  },
  {
    id: 'mission_5',
    title: 'Organic Apples & Seasonal Citrus Baskets',
    donor_id: 'user_donor_2',
    donor_name: 'City Fresh Produce Market',
    pickup_address: '500 Market Square, Dock 3',
    recipient_id: 'user_rec_1',
    recipient_name: 'Hope Community Shelter',
    dropoff_address: '88 Peace Avenue, Downtown',
    food_category: 'Fresh Fruits',
    weight_kg: 15.0,
    vehicle_required: 'bike',
    urgency: 'urgent',
    requires_refrigeration: false,
    notes: 'Pre-boxed in 3 light crates. Fits on cargo bike or backpack + panniers.',
    status: 'delivered',
    volunteer_id: 'vol_alex_1',
    volunteer_name: 'Alex Rivera (Eco-Courier)',
    verification_code: '7721',
    pickup_window: 'Delivered at 1:30 PM',
    distance_km: 2.2,
    est_duration_mins: 10,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
];

const seedCouriers = [
  {
    id: 'vol_alex_1',
    name: 'Alex Rivera',
    avatar: '🚴',
    role: 'Lead Cargo Cyclist',
    vehicle_type: 'bike',
    rating: 4.95,
    completed_missions: 38,
    total_kg_rescued: 412.5,
    co2_saved_kg: 98.4,
    badge: 'Eco-Champion 🌟',
    status: 'active',
  },
  {
    id: 'vol_sam_2',
    name: 'Samantha Chen',
    avatar: '🚗',
    role: 'Rapid Responder Driver',
    vehicle_type: 'car',
    rating: 4.98,
    completed_missions: 54,
    total_kg_rescued: 780.0,
    co2_saved_kg: 172.0,
    badge: 'Master Courier 🛡️',
    status: 'on_mission',
  },
  {
    id: 'vol_david_3',
    name: 'David Kalu',
    avatar: '🚐',
    role: 'Heavy Cargo Van Volunteer',
    vehicle_type: 'van',
    rating: 4.91,
    completed_missions: 29,
    total_kg_rescued: 1240.0,
    co2_saved_kg: 285.6,
    badge: 'Heavy Lifter 🏋️',
    status: 'available',
  },
  {
    id: 'vol_elena_4',
    name: 'Elena Rostova',
    avatar: '🚶',
    role: 'Neighborhood Walking Courier',
    vehicle_type: 'walk',
    rating: 5.0,
    completed_missions: 19,
    total_kg_rescued: 145.0,
    co2_saved_kg: 34.8,
    badge: 'Local Hero ❤️',
    status: 'available',
  },
];

const memoryStore = [...seedMissions];
const courierStore = [...seedCouriers];

const getAllMissions = async (supabase, filters = {}) => {
  const { status, urgency, vehicle_required, search, page = 1, limit = 20 } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase.from(TABLE).select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (urgency && urgency !== 'all') {
      query = query.eq('urgency', urgency);
    }
    if (vehicle_required && vehicle_required !== 'all') {
      query = query.eq('vehicle_required', vehicle_required);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  } catch (err) {
    let list = [...memoryStore];

    if (status && status !== 'all') {
      list = list.filter((m) => m.status === status);
    }
    if (urgency && urgency !== 'all') {
      list = list.filter((m) => m.urgency === urgency);
    }
    if (vehicle_required && vehicle_required !== 'all') {
      list = list.filter((m) => m.vehicle_required === vehicle_required);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.donor_name.toLowerCase().includes(q) ||
          m.recipient_name.toLowerCase().includes(q) ||
          m.food_category.toLowerCase().includes(q)
      );
    }

    const paginated = list.slice(from, to + 1);

    return {
      data: paginated,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: list.length,
        totalPages: Math.ceil(list.length / limit) || 1,
      },
    };
  }
};

const getMissionById = async (supabase, missionId) => {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', missionId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    const found = memoryStore.find((m) => m.id === missionId);
    if (!found) throw new Error('Rescue mission not found');
    return found;
  }
};

const createMission = async (supabase, missionData) => {
  const newMission = {
    id: missionData.id || `mission_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: missionData.title || 'Food Rescue Dispatch',
    donor_id: missionData.donor_id || 'user_donor_curr',
    donor_name: missionData.donor_name || 'Community Donor',
    pickup_address: missionData.pickup_address || 'City Center Pickup Hub',
    recipient_id: missionData.recipient_id || 'user_rec_curr',
    recipient_name: missionData.recipient_name || 'Community Kitchen',
    dropoff_address: missionData.dropoff_address || 'Local Shelter Hub',
    food_category: missionData.food_category || 'General Surplus',
    weight_kg: Number(missionData.weight_kg) || 10.0,
    vehicle_required: missionData.vehicle_required || 'bike',
    urgency: missionData.urgency || 'urgent',
    requires_refrigeration: Boolean(missionData.requires_refrigeration),
    notes: missionData.notes || '',
    status: 'available',
    volunteer_id: null,
    volunteer_name: null,
    verification_code: Math.floor(1000 + Math.random() * 9000).toString(),
    pickup_window: missionData.pickup_window || 'Next 2-3 hours',
    distance_km: Number(missionData.distance_km) || 3.2,
    est_duration_mins: Math.round((Number(missionData.distance_km) || 3.2) * 5),
    created_at: new Date().toISOString(),
    completed_at: null,
  };

  try {
    const { data, error } = await supabase.from(TABLE).insert(newMission).select().single();
    if (error) throw error;
    memoryStore.unshift(data);
    return data;
  } catch (err) {
    memoryStore.unshift(newMission);
    return newMission;
  }
};

const claimMission = async (supabase, missionId, volunteer) => {
  const volunteerId = volunteer.id || 'vol_curr_user';
  const volunteerName = volunteer.name || 'Volunteer Courier';

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        volunteer_id: volunteerId,
        volunteer_name: volunteerName,
        status: 'assigned',
      })
      .eq('id', missionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    const mission = memoryStore.find((m) => m.id === missionId);
    if (!mission) throw new Error('Rescue mission not found');
    if (mission.status !== 'available') {
      throw new Error(`Mission cannot be claimed; current status is ${mission.status}`);
    }

    mission.volunteer_id = volunteerId;
    mission.volunteer_name = volunteerName;
    mission.status = 'assigned';
    return mission;
  }
};

const updateMissionStatus = async (supabase, missionId, statusUpdate) => {
  const { status, notes, verification_code } = statusUpdate;
  const validStatuses = ['available', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const updates = {
    status,
    ...(notes && { notes }),
    ...(status === 'delivered' && { completed_at: new Date().toISOString() }),
  };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', missionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    const mission = memoryStore.find((m) => m.id === missionId);
    if (!mission) throw new Error('Rescue mission not found');

    if (status === 'delivered' && verification_code && mission.verification_code) {
      if (verification_code.trim() !== mission.verification_code.trim()) {
        throw new Error('Handover verification PIN is incorrect');
      }
    }

    Object.assign(mission, updates);
    return mission;
  }
};

const getRescueStatistics = async () => {
  const totalMissions = memoryStore.length;
  const deliveredMissions = memoryStore.filter((m) => m.status === 'delivered');
  const activeMissions = memoryStore.filter((m) => ['assigned', 'picked_up', 'in_transit'].includes(m.status));
  const availableMissions = memoryStore.filter((m) => m.status === 'available');

  const totalKgRescued = memoryStore
    .filter((m) => m.status === 'delivered' || m.status === 'in_transit' || m.status === 'picked_up')
    .reduce((sum, m) => sum + (m.weight_kg || 0), 0);

  // Each kg of rescued food averts ~2.5 kg CO2e
  const co2SavedKg = Number((totalKgRescued * 2.5).toFixed(1));

  return {
    totalMissions,
    availableCount: availableMissions.length,
    activeCount: activeMissions.length,
    deliveredCount: deliveredMissions.length,
    totalKgRescued: Number(totalKgRescued.toFixed(1)),
    co2SavedKg,
    estimatedMealsProvided: Math.round(totalKgRescued * 2.2),
    activeCouriersCount: courierStore.length + 3,
  };
};

const getCouriersLeaderboard = async () => {
  return [...courierStore].sort((a, b) => b.total_kg_rescued - a.total_kg_rescued);
};

module.exports = {
  getAllMissions,
  getMissionById,
  createMission,
  claimMission,
  updateMissionStatus,
  getRescueStatistics,
  getCouriersLeaderboard,
};
