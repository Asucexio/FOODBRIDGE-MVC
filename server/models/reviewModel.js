const TABLE = 'reviews';

// In-memory fallback and seed data for offline / demo mode
const seedReviews = [
  {
    id: 'rev_1',
    author_id: 'user_rec_1',
    author_name: 'Hope Community Shelter',
    author_role: 'recipient',
    target_user_id: 'user_donor_1',
    target_name: 'Green Harvest Bakery',
    donation_id: 'don_1',
    donation_title: 'Fresh Artisan Sourdough & Pastries',
    rating: 5,
    tags: ['Fresh Food', 'Punctual Pickup', 'Well Packaged', 'Friendly Communication'],
    comment: 'Green Harvest Bakery provided immaculate fresh bread that nourished over 40 families today. Pickup was swift and seamless!',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'rev_2',
    author_id: 'user_rec_2',
    author_name: 'Downtown Food Rescue',
    author_role: 'recipient',
    target_user_id: 'user_donor_2',
    target_name: 'City Fresh Produce Market',
    donation_id: 'don_2',
    donation_title: 'Organic Apples & Citrus Crates',
    rating: 5,
    tags: ['Fresh Food', 'Generous Portion', 'Punctual Pickup'],
    comment: 'The produce was vibrant, high-quality, and packed safely in reusable crates. Truly grateful for the partnership.',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'rev_3',
    author_id: 'user_donor_1',
    author_name: 'Green Harvest Bakery',
    author_role: 'donor',
    target_user_id: 'user_rec_1',
    target_name: 'Hope Community Shelter',
    donation_id: 'don_1',
    donation_title: 'Fresh Artisan Sourdough & Pastries',
    rating: 5,
    tags: ['Punctual Pickup', 'Respectful Handling', 'Friendly Communication'],
    comment: 'The shelter pickup team arrived right on schedule with insulated transport bags and complete verification.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'rev_4',
    author_id: 'user_rec_3',
    author_name: 'St. Jude Youth Kitchen',
    author_role: 'recipient',
    target_user_id: 'user_donor_3',
    target_name: 'Sunrise Catering Co.',
    donation_id: 'don_3',
    donation_title: 'Catering Trays: Roasted Veggies & Quinoa',
    rating: 4,
    tags: ['Fresh Food', 'Well Packaged', 'Generous Portion'],
    comment: 'Delicious hot food trays securely sealed and labeled with dietary notes. Our kids loved the meals!',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'rev_5',
    author_id: 'user_rec_4',
    author_name: 'Riverside Community Pantry',
    author_role: 'recipient',
    target_user_id: 'user_donor_1',
    target_name: 'Green Harvest Bakery',
    donation_id: 'don_4',
    donation_title: 'Morning Bagels & Croissants',
    rating: 5,
    tags: ['Fresh Food', 'Punctual Pickup', 'Generous Portion'],
    comment: 'Always reliable, consistent, and deeply caring donors. 10/10 recommend collaborating with them.',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
];

const memoryStore = [...seedReviews];

const createReview = async (supabase, review) => {
  const newReview = {
    id: review.id || `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    author_id: review.author_id,
    author_name: review.author_name || 'Community Member',
    author_role: review.author_role || 'donor',
    target_user_id: review.target_user_id || 'community',
    target_name: review.target_name || 'Community Partner',
    donation_id: review.donation_id || null,
    donation_title: review.donation_title || null,
    rating: Number(review.rating) || 5,
    tags: Array.isArray(review.tags) ? review.tags : [],
    comment: review.comment || '',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from(TABLE).insert(newReview).select().single();
    if (error) throw error;
    memoryStore.unshift(data);
    return data;
  } catch (err) {
    memoryStore.unshift(newReview);
    return newReview;
  }
};

const getReviewsByTargetUser = async (supabase, targetUserId, page = 1, limit = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data, error, count } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('target_user_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  } catch (err) {
    const matching = memoryStore.filter(
      (r) => r.target_user_id === targetUserId || targetUserId === 'all'
    );
    const paginated = matching.slice(from, to + 1);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total: matching.length,
        totalPages: Math.ceil(matching.length / limit) || 1,
      },
    };
  }
};

const getCommunityReviews = async (supabase, page = 1, limit = 20, minRating = 0, tag = null) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (minRating > 0) {
      query = query.gte('rating', minRating);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  } catch (err) {
    let list = [...memoryStore];
    if (minRating > 0) {
      list = list.filter((r) => r.rating >= minRating);
    }
    if (tag) {
      list = list.filter((r) => r.tags && r.tags.includes(tag));
    }
    const paginated = list.slice(from, to + 1);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total: list.length,
        totalPages: Math.ceil(list.length / limit) || 1,
      },
    };
  }
};

const computeSummaryFromList = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      trustScore: 100,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      topTags: [],
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const tagCounts = {};
  let totalRating = 0;

  reviews.forEach((r) => {
    const star = Math.min(Math.max(Math.round(r.rating), 1), 5);
    distribution[star] = (distribution[star] || 0) + 1;
    totalRating += r.rating;

    if (Array.isArray(r.tags)) {
      r.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const avg = totalRating / reviews.length;
  // Trust score formula: weighted percentage based on rating
  const trustScore = Math.min(100, Math.round((avg / 5) * 100));

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    averageRating: Number(avg.toFixed(1)),
    totalReviews: reviews.length,
    trustScore,
    distribution,
    topTags: sortedTags,
  };
};

const getUserRatingSummary = async (supabase, targetUserId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('rating, tags')
      .eq('target_user_id', targetUserId);

    if (error) throw error;
    return computeSummaryFromList(data || []);
  } catch (err) {
    const userReviews = memoryStore.filter(
      (r) => r.target_user_id === targetUserId || targetUserId === 'all'
    );
    return computeSummaryFromList(userReviews);
  }
};

const getGlobalRatingSummary = async (supabase) => {
  try {
    const { data, error } = await supabase.from(TABLE).select('rating, tags');
    if (error) throw error;
    return computeSummaryFromList(data || []);
  } catch (err) {
    return computeSummaryFromList(memoryStore);
  }
};

module.exports = {
  createReview,
  getReviewsByTargetUser,
  getCommunityReviews,
  getUserRatingSummary,
  getGlobalRatingSummary,
};
