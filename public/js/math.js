/**
 * math.js - Pure Deterministic Financial Math Engine
 * CRITICAL RULE: All financial and budget math is executed in pure deterministic code,
 * NEVER by the LLM. The LLM only proposes categories and percentage weights.
 */

/**
 * Format currency according to Indian / International standards
 * Indian Rupee uses Lakh/Crore grouping: ₹1,25,000 / ₹12,00,000
 */
export function formatCurrency(amount, currency = 'INR') {
  const num = Math.round(Number(amount) || 0);
  if (currency === 'INR') {
    return '₹' + formatIndianNumber(num);
  }
  const symbolMap = { USD: '$', AED: 'AED ', GBP: '£', EUR: '€' };
  const sym = symbolMap[currency] || (currency + ' ');
  return sym + num.toLocaleString('en-US');
}

/**
 * Indian Number System Formatter (e.g. 1200000 -> "12,00,000")
 */
export function formatIndianNumber(val) {
  const num = Math.abs(Math.round(val));
  const str = num.toString();
  if (str.length <= 3) return str;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return formattedOther + ',' + lastThree;
}

/**
 * Compute Category-Wise Amounts from Total Budget and Category Percentages.
 * Always normalizes percentages to ensure they sum to exactly 100%.
 * Guarantees that the sum of computed item plannedAmounts equals totalBudget to the exact single rupee.
 */
export function computeBudgetSplit(totalBudget, categories) {
  const total = Math.max(0, Number(totalBudget) || 0);
  if (!categories || categories.length === 0) return [];

  // Enforce contingency reserve rule (8-10%)
  const hasContingency = categories.some(c => 
    c.name.toLowerCase().includes('contingency') || c.name.toLowerCase().includes('reserve')
  );

  let list = categories.map(c => ({
    name: c.name.trim(),
    percent: Math.max(0, Number(c.percent) || 0),
    reason: c.reason || ''
  }));

  if (!hasContingency) {
    list.push({
      name: 'Contingency Safety Reserve',
      percent: 10,
      reason: 'Mandatory 10% safety cushion for sudden guest arrivals or unexpected cost surges.'
    });
  }

  // Normalize percentages to sum to exactly 100%
  const sumPercent = list.reduce((acc, c) => acc + c.percent, 0);
  if (sumPercent > 0) {
    list = list.map(c => ({
      ...c,
      percent: Number(((c.percent / sumPercent) * 100).toFixed(1))
    }));
  }

  // Calculate deterministic rupee amounts
  let accumulatedAmount = 0;
  const items = list.map((c, index) => {
    let amount = Math.round((c.percent / 100) * total);
    // Adjust last item to avoid rounding drift
    if (index === list.length - 1) {
      amount = total - accumulatedAmount;
    } else {
      accumulatedAmount += amount;
    }
    return {
      id: 'cat_' + (index + 1) + '_' + Math.random().toString(36).substr(2, 5),
      category: c.name,
      plannedPercent: c.percent,
      plannedAmount: Math.max(0, amount),
      actualAmount: 0,
      reason: c.reason || '',
      notes: ''
    };
  });

  return items;
}

/**
 * Calculates budget summary stats:
 * - totalBudget
 * - totalPlanned
 * - totalActual (spent)
 * - remaining = totalBudget - totalActual
 * - isOverBudget = totalActual > totalBudget
 * - overBudgetAmount = totalActual - totalBudget
 * - costPerGuest = totalBudget / guestCount
 */
export function calculateBudgetStats(totalBudget, items = [], guestCount = 1) {
  const total = Math.max(0, Number(totalBudget) || 0);
  const guests = Math.max(1, Number(guestCount) || 1);

  const totalPlanned = items.reduce((sum, item) => sum + (Number(item.plannedAmount) || 0), 0);
  const totalActual = items.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);

  const remaining = total - totalActual;
  const isOverBudget = totalActual > total;
  const overBudgetAmount = isOverBudget ? totalActual - total : 0;
  const costPerGuest = Math.round(total / guests);
  const spentPercent = total > 0 ? Math.min(100, Math.round((totalActual / total) * 100)) : 0;

  return {
    totalBudget: total,
    totalPlanned,
    totalActual,
    remaining,
    isOverBudget,
    overBudgetAmount,
    costPerGuest,
    spentPercent
  };
}

/**
 * Rebalance categories when a user manually modifies one category's planned amount.
 * The other categories auto-rebalance proportionally while preserving the contingency.
 */
export function rebalanceBudget(totalBudget, items, modifiedItemId, newAmount) {
  const total = Math.max(0, Number(totalBudget) || 0);
  const amount = Math.max(0, Math.min(total, Number(newAmount) || 0));

  const targetIndex = items.findIndex(i => i.id === modifiedItemId);
  if (targetIndex === -1) return items;

  const updatedItems = JSON.parse(JSON.stringify(items));
  updatedItems[targetIndex].plannedAmount = amount;
  updatedItems[targetIndex].plannedPercent = total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0;

  const remainingTotal = total - amount;
  const otherItems = updatedItems.filter((_, idx) => idx !== targetIndex);
  const currentOtherSum = otherItems.reduce((acc, it) => acc + it.plannedAmount, 0);

  if (otherItems.length > 0 && currentOtherSum > 0) {
    let rebalancedAccumulator = 0;
    otherItems.forEach((it, idx) => {
      const realIndex = updatedItems.findIndex(x => x.id === it.id);
      if (idx === otherItems.length - 1) {
        updatedItems[realIndex].plannedAmount = Math.max(0, remainingTotal - rebalancedAccumulator);
      } else {
        const prop = it.plannedAmount / currentOtherSum;
        const newPlanned = Math.round(prop * remainingTotal);
        updatedItems[realIndex].plannedAmount = Math.max(0, newPlanned);
        rebalancedAccumulator += newPlanned;
      }
      updatedItems[realIndex].plannedPercent = total > 0 ? Number(((updatedItems[realIndex].plannedAmount / total) * 100).toFixed(1)) : 0;
    });
  }

  return updatedItems;
}

/**
 * Returns balanced category splits based on celebration type and whether a venue is rented or own space
 */
export function getCategoriesForEvent(type, isMicro = false, needsVenue = true) {
  if (isMicro || !needsVenue) {
    if (type === 'birthday') {
      return [
        { name: 'Birthday Cake, Pastries & Candles', percent: 35, reason: 'Custom cake, cupcakes & sparkler candles' },
        { name: 'Food & Drinks (Snacks, Biryani & Soft Drinks)', percent: 40, reason: 'Food delivery or home feasts & chilled beverages' },
        { name: 'Room Fairy Lights, Balloons & Streamers', percent: 15, reason: 'Warm LED lights & damage-free wall decor' },
        { name: 'Contingency Safety Reserve', percent: 10, reason: '10% safety cushion for sudden delivery surges or extra treats' }
      ];
    } else if (type === 'wedding') {
      return [
        { name: 'Traditional Catering & Feast Dining', percent: 35, reason: 'Multi-course regional feasts & live counters' },
        { name: 'Stage Backdrop & Mandap Floral Decor', percent: 20, reason: 'Marigold, jasmine & ambient warm lighting' },
        { name: 'Photography & Candid Cinema', percent: 15, reason: 'Candid photo, cinema teaser & portraits' },
        { name: 'Bridal & Groom Attire & Jewelry', percent: 12, reason: 'Silks, styling & makeup' },
        { name: 'Invitations & Return Thamboolam', percent: 8, reason: 'Digital cards & return gifts' },
        { name: 'Contingency Safety Reserve', percent: 10, reason: 'Mandatory 10% safety cushion for surges' }
      ];
    } else if (type === 'housewarming') {
      return [
        { name: 'Banana Leaf Feast & Payasam', percent: 45, reason: 'Traditional feast for visiting relatives' },
        { name: 'Puja Samagri & Pandit Honorarium', percent: 20, reason: 'Ganapati homa, vastu puja & milk ritual' },
        { name: 'Mango Leaf & Floral Toran Decor', percent: 15, reason: 'Entrance, altar & balcony garlands' },
        { name: 'Brass Diya Return Favors', percent: 10, reason: 'Traditional gifts for family & neighbors' },
        { name: 'Contingency Safety Reserve', percent: 10, reason: 'Safety cushion' }
      ];
    } else {
      return [
        { name: 'Mahaprasad & Daily Bhog', percent: 42, reason: 'Community annadanam & prasadam' },
        { name: 'Clay Murti & Puja Items', percent: 18, reason: 'Eco-friendly idol & priest coordination' },
        { name: 'Lighting & Sound System', percent: 18, reason: 'LED lights & wireless mic' },
        { name: 'Banners & Volunteer Supplies', percent: 12, reason: 'Community notice & waste management' },
        { name: 'Contingency Safety Reserve', percent: 10, reason: 'Emergency buffer' }
      ];
    }
  }

  // When rented venue is needed (needsVenue = true)
  if (type === 'wedding') {
    return [
      { name: 'Kalyana Mandapam & Venue', percent: 28, reason: 'Hall, rooms & guest accommodation' },
      { name: 'Traditional Catering & Dining', percent: 27, reason: 'Multi-course regional feasts & live counters' },
      { name: 'Stage Backdrop & Mandap Decor', percent: 14, reason: 'Marigold, jasmine & warm lighting' },
      { name: 'Photography & Candid Cinema', percent: 10, reason: 'Candid photo, cinema teaser & drone' },
      { name: 'Bridal & Groom Attire & Jewelry', percent: 8, reason: 'Silks, styling & makeup' },
      { name: 'Invitations & Return Thamboolam', percent: 3, reason: 'Digital cards & return gifts' },
      { name: 'Contingency Safety Reserve', percent: 10, reason: 'Mandatory 10% safety cushion for surges' }
    ];
  } else if (type === 'birthday') {
    return [
      { name: 'Venue / Hall Rental', percent: 22, reason: 'Indoor clubhouse or banquet hall' },
      { name: 'Food, Themed Cake & Drinks', percent: 35, reason: 'Custom cake, snacks & kids buffet' },
      { name: 'Balloon Decor & Arch', percent: 18, reason: 'Backdrop and photo cutout' },
      { name: 'Magician & Game Emcee', percent: 10, reason: 'Interactive entertainment & games' },
      { name: 'Return Gift Hampers', percent: 7, reason: 'Activity books & non-plastic favors' },
      { name: 'Contingency Safety Reserve', percent: 8, reason: '8% reserve for sudden guests' }
    ];
  } else if (type === 'housewarming') {
    return [
      { name: 'Puja Samagri & Pandit Honorarium', percent: 20, reason: 'Ganapati homa, vastu puja & milk ritual' },
      { name: 'Banana Leaf Feast & Payasam', percent: 45, reason: 'Traditional feast for visiting relatives' },
      { name: 'Mango Leaf & Floral Toran Decor', percent: 15, reason: 'Entrance, altar & balcony garlands' },
      { name: 'Brass Diya Return Favors', percent: 10, reason: 'Traditional gifts for family & neighbors' },
      { name: 'Contingency Safety Reserve', percent: 10, reason: 'Safety cushion' }
    ];
  } else {
    return [
      { name: 'Pandal & Stage Setup', percent: 32, reason: 'Shamiana, sound & generator' },
      { name: 'Mahaprasad & Daily Bhog', percent: 30, reason: 'Community annadanam' },
      { name: 'Clay Murti & Puja Items', percent: 12, reason: 'Eco-friendly idol & priest coordination' },
      { name: 'Lighting & Sound System', percent: 12, reason: 'LED lights & wireless mic' },
      { name: 'Banners & Waste Management', percent: 5, reason: 'Green volunteer supplies' },
      { name: 'Contingency Safety Reserve', percent: 9, reason: 'Emergency buffer' }
    ];
  }
}
