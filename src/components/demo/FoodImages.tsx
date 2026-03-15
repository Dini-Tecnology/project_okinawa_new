/**
 * Food Image System — Real food photos for all demo experiences.
 * Uses Unsplash CDN for high-quality, properly sized food photography.
 */
import React from 'react';

// Unsplash photo IDs mapped to food categories — curated for premium aesthetics
const FOOD_PHOTOS: Record<string, string> = {
  // === BURGERS & FAST FOOD ===
  'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
  'burger-double': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=400&fit=crop',
  'chicken-burger': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop',
  'veggie-burger': 'https://images.unsplash.com/photo-1520072959219-c595e6cdc07a?w=400&h=400&fit=crop',
  'fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop',
  'onion-rings': 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=400&fit=crop',
  'nuggets': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop',
  'combo': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=400&fit=crop',
  'wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop',
  
  // === MILKSHAKES & DRINKS ===
  'milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop',
  'milkshake-oreo': 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=400&fit=crop',
  'soda': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=400&fit=crop',
  'juice': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop',
  'juice-green': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop',
  'water': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop',
  'sparkling-water': 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&h=400&fit=crop',
  
  // === DESSERTS ===
  'sundae': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop',
  'cookie': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
  'brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop',
  'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
  'churros': 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=400&fit=crop',
  'tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
  'apple-pie': 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&h=400&fit=crop',
  'souffle': 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=400&fit=crop',
  'pudding': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
  'mousse': 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400&h=400&fit=crop',
  'fruit-bowl': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=400&fit=crop',
  
  // === COFFEE & TEA ===
  'espresso': 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=400&fit=crop',
  'cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
  'filter-coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
  'latte': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
  'cold-brew': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop',
  'matcha': 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop',
  'green-tea': 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop',
  'chamomile': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
  
  // === BAKERY ===
  'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=400&fit=crop',
  'pao-queijo': 'https://images.unsplash.com/photo-1598733835143-2f0746e6e51c?w=400&h=400&fit=crop',
  'sandwich-caprese': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop',
  
  // === BOWLS & HEALTHY ===
  'rice': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=400&fit=crop',
  'brown-rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  'quinoa': 'https://images.unsplash.com/photo-1505576399279-0d95e3b37811?w=400&h=400&fit=crop',
  'mixed-greens': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
  'wrap-bowl': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop',
  'grilled-chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop',
  'beef': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=400&fit=crop',
  'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop',
  'tofu': 'https://images.unsplash.com/photo-1628680029817-52e2cba02c16?w=400&h=400&fit=crop',
  'shrimp': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop',
  'tomato': 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=400&h=400&fit=crop',
  'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop',
  'cucumber': 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&h=400&fit=crop',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
  'beet': 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=400&h=400&fit=crop',
  'edamame': 'https://images.unsplash.com/photo-1564894809611-1742fc40ed80?w=400&h=400&fit=crop',
  'avocado': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop',
  'egg': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=400&fit=crop',
  'feta': 'https://images.unsplash.com/photo-1626957341926-98752fc2ba90?w=400&h=400&fit=crop',
  'tahini': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop',
  'pesto': 'https://images.unsplash.com/photo-1592918329773-3e8d4749e95b?w=400&h=400&fit=crop',
  
  // === MEXICAN ===
  'taco': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop',
  'burrito': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop',
  'quesadilla': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=400&fit=crop',
  'nachos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=400&fit=crop',
  'horchata': 'https://images.unsplash.com/photo-1544252890-c3e95e867f38?w=400&h=400&fit=crop',
  'hibiscus': 'https://images.unsplash.com/photo-1544252890-c3e95e867f38?w=400&h=400&fit=crop',
  
  // === ITALIAN / CASUAL ===
  'lasagna': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop',
  'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
  'pizza-pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
  'risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=400&fit=crop',
  'parmegiana': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=400&fit=crop',
  'caesar-salad': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=400&fit=crop',
  'bruschetta': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=400&fit=crop',
  'mac-cheese': 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400&h=400&fit=crop',
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  
  // === BUFFET ===
  'grilled-meat': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop',
  'salad-bar': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
  'sushi-platter': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop',
  
  // === BEER & DRINKS ===
  'ipa': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop',
  'pilsen': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop',
  'stout': 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=400&h=400&fit=crop',
  'wheat-beer': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop',
  'beer-craft': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop',
  'gin-tonic': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop',
  'aperol': 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400&h=400&fit=crop',
  'moscow-mule': 'https://images.unsplash.com/photo-1514362545857-3bc16c8c7f1b?w=400&h=400&fit=crop',
  'beer-bucket': 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=400&fit=crop',
  'cheese-board': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
  'rustic-fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop',
  
  // === BOTTLES / CLUB ===
  'vodka': 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400&h=400&fit=crop',
  'champagne': 'https://images.unsplash.com/photo-1594372365401-3b5ff14eee78?w=400&h=400&fit=crop',
  'whisky': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop',
  'tequila': 'https://images.unsplash.com/photo-1585539358849-bf23ce4b9a7b?w=400&h=400&fit=crop',
  'cocktail': 'https://images.unsplash.com/photo-1514362545857-3bc16c8c7f1b?w=400&h=400&fit=crop',
  
  // === WINE ===
  'wine-red': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
  'wine-glass': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
  
  // === FINE DINING ===
  'amuse-bouche': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
  'wagyu': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop',
  'steak': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop',
  
  // === DRIVE-THRU ===
  'coffee-latte': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
  
  // === GENERIC FALLBACKS ===
  'food-generic': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
  'drink-generic': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop',
  'dessert-generic': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
};

/**
 * FoodImg — Renders a properly sized food photo with lazy loading and rounded corners.
 * Uses Unsplash CDN for high-quality imagery.
 */
export const FoodImg: React.FC<{
  id: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'detail';
  className?: string;
  rounded?: string;
}> = ({ id, alt = 'Food photo', size = 'md', className = '', rounded }) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    hero: 'w-28 h-28',
    detail: 'w-full aspect-square max-h-48',
  };

  const roundedMap = {
    xs: 'rounded-lg',
    sm: 'rounded-xl',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-2xl',
    hero: 'rounded-3xl',
    detail: 'rounded-2xl',
  };

  const src = FOOD_PHOTOS[id] || FOOD_PHOTOS['food-generic'];
  const r = rounded || roundedMap[size];

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`${sizeMap[size]} ${r} object-cover shrink-0 ${className}`}
    />
  );
};

/**
 * Get a food photo URL by key. Falls back to generic food photo.
 */
export const getFoodPhoto = (id: string): string => {
  return FOOD_PHOTOS[id] || FOOD_PHOTOS['food-generic'];
};

export default FOOD_PHOTOS;
