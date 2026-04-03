import { describe, it, expect } from 'vitest';

/**
 * Phase 5 — Structural QA for responsive demo architecture.
 * Validates that all 7 roles × 22+ screens are properly mapped.
 */

// Import the shared config to validate completeness
import { ROLE_CONFIG, ROLE_JOURNEYS, SCREEN_INFO, type RestaurantScreen, type StaffRole } from '@/components/demo/restaurant/RestaurantDemoShared';

describe('Restaurant Demo — Responsive Architecture QA', () => {

  it('has all 7 staff roles defined', () => {
    const expectedRoles: StaffRole[] = ['owner', 'manager', 'maitre', 'chef', 'barman', 'cook', 'waiter'];
    expect(ROLE_CONFIG.map(r => r.id).sort()).toEqual(expectedRoles.sort());
  });

  it('every role has a journey with at least 2 steps', () => {
    for (const role of ROLE_CONFIG) {
      const journey = ROLE_JOURNEYS[role.id];
      expect(journey.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('every journey screen has SCREEN_INFO entry', () => {
    const allScreens = new Set<RestaurantScreen>();
    for (const role of ROLE_CONFIG) {
      for (const stage of ROLE_JOURNEYS[role.id]) {
        allScreens.add(stage.screen);
      }
    }
    for (const screen of allScreens) {
      expect(SCREEN_INFO[screen]).toBeDefined();
      expect(SCREEN_INFO[screen].title).toBeTruthy();
      expect(SCREEN_INFO[screen].desc).toBeTruthy();
    }
  });

  it('every role has a default screen that exists in its journey', () => {
    for (const role of ROLE_CONFIG) {
      const journeyScreens = ROLE_JOURNEYS[role.id].map(s => s.screen);
      expect(journeyScreens).toContain(role.defaultScreen);
    }
  });

  it('role configs have required visual properties', () => {
    for (const role of ROLE_CONFIG) {
      expect(role.label).toBeTruthy();
      expect(role.desc).toBeTruthy();
      expect(role.emoji).toBeTruthy();
      expect(role.colorClass).toMatch(/^text-/);
      expect(role.bgClass).toMatch(/^bg-/);
      expect(role.gradient).toMatch(/^from-/);
    }
  });

  it('covers all expected screens', () => {
    const allScreens = Object.keys(SCREEN_INFO) as RestaurantScreen[];
    // Must have at least 22 screens
    expect(allScreens.length).toBeGreaterThanOrEqual(23);
    // Key screens must exist
    const critical = ['dashboard', 'table-map', 'orders', 'kds-kitchen', 'waiter', 'analytics', 'config-hub'];
    for (const s of critical) {
      expect(allScreens).toContain(s);
    }
  });
});
