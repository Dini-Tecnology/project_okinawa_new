import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type RestaurantRole =
  | 'owner'
  | 'manager'
  | 'maitre'
  | 'chef'
  | 'barman'
  | 'cook'
  | 'waiter';

export type ManagerRoleView =
  | 'manager-ops'
  | 'manager-orders'
  | 'manager-approvals'
  | 'manager-cash'
  | 'manager-tables'
  | 'manager-staff'
  | 'manager-report'
  | 'manager-stock'
  | 'manager-promotions'
  | 'manager-qr'
  | 'manager-settings';

export type MaitreRoleView =
  | 'maitre-reservations'
  | 'maitre-flow'
  | 'maitre-tables'
  | 'maitre-management';

export type ChefRoleView =
  | 'chef-kds'
  | 'chef-approvals'
  | 'chef-analytics'
  | 'chef-cost'
  | 'chef-menu'
  | 'chef-stock';

export type BarmanRoleView =
  | 'barman-station'
  | 'bar-kds'
  | 'bar-recipes'
  | 'bar-stock';

export type CookRoleView =
  | 'cook-station'
  | 'cook-kds';

export type WaiterRoleView =
  | 'waiter'
  | 'waiter-calls'
  | 'waiter-table-actions'
  | 'waiter-assistance'
  | 'waiter-table-charge'
  | 'waiter-tap-to-pay'
  | 'waiter-order-management'
  | 'waiter-table-map'
  | 'waiter-tips';

interface RestaurantRoleContextValue {
  role: RestaurantRole;
  setRole: (role: RestaurantRole) => void;
  managerView: ManagerRoleView;
  setManagerView: (view: ManagerRoleView) => void;
  maitreView: MaitreRoleView;
  setMaitreView: (view: MaitreRoleView) => void;
  chefView: ChefRoleView;
  setChefView: (view: ChefRoleView) => void;
  barmanView: BarmanRoleView;
  setBarmanView: (view: BarmanRoleView) => void;
  cookView: CookRoleView;
  setCookView: (view: CookRoleView) => void;
  waiterView: WaiterRoleView;
  setWaiterView: (view: WaiterRoleView) => void;
}

const RestaurantRoleContext = createContext<RestaurantRoleContextValue | undefined>(undefined);

export function RestaurantRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RestaurantRole>('owner');
  const [managerView, setManagerView] = useState<ManagerRoleView>('manager-ops');
  const [maitreView, setMaitreView] = useState<MaitreRoleView>('maitre-reservations');
  const [chefView, setChefView] = useState<ChefRoleView>('chef-kds');
  const [barmanView, setBarmanView] = useState<BarmanRoleView>('barman-station');
  const [cookView, setCookView] = useState<CookRoleView>('cook-station');
  const [waiterView, setWaiterView] = useState<WaiterRoleView>('waiter');

  const value = useMemo(
    () => ({
      role,
      setRole,
      managerView,
      setManagerView,
      maitreView,
      setMaitreView,
      chefView,
      setChefView,
      barmanView,
      setBarmanView,
      cookView,
      setCookView,
      waiterView,
      setWaiterView,
    }),
    [role, managerView, maitreView, chefView, barmanView, cookView, waiterView],
  );

  return (
    <RestaurantRoleContext.Provider value={value}>
      {children}
    </RestaurantRoleContext.Provider>
  );
}

export function useRestaurantRole() {
  const context = useContext(RestaurantRoleContext);
  if (!context) {
    throw new Error('useRestaurantRole must be used within RestaurantRoleProvider');
  }
  return context;
}
