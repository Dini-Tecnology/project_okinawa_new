import * as React from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

const TABLET_MIN = 768;
const DESKTOP_MIN = 1200;

export function useDeviceType(): DeviceType {
  const [device, setDevice] = React.useState<DeviceType>(() => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < TABLET_MIN) return "mobile";
    if (w < DESKTOP_MIN) return "tablet";
    return "desktop";
  });

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < TABLET_MIN) setDevice("mobile");
      else if (w < DESKTOP_MIN) setDevice("tablet");
      else setDevice("desktop");
    };

    window.addEventListener("resize", update);
    update();
    return () => window.removeEventListener("resize", update);
  }, []);

  return device;
}

export function useIsMobile() {
  return useDeviceType() === "mobile";
}

export function useIsTablet() {
  return useDeviceType() === "tablet";
}

export function useIsDesktop() {
  return useDeviceType() === "desktop";
}
