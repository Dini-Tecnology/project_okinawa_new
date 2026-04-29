/**
 * Type declarations for expo modules and third-party libraries
 * that lack their own type definitions in this project.
 */

declare module 'expo-apple-authentication' {
  export function isAvailableAsync(): Promise<boolean>;
  export function signInAsync(options?: any): Promise<any>;
  export enum AppleAuthenticationScope {
    FULL_NAME = 0,
    EMAIL = 1,
  }
  const content: any;
  export default content;
}

declare module 'expo-auth-session/providers/google' {
  export interface GoogleAuthRequestConfig {
    clientId?: string;
    iosClientId?: string;
    androidClientId?: string;
    webClientId?: string;
    expoClientId?: string;
    scopes?: string[];
  }
  export interface AuthSessionResult {
    type: 'cancel' | 'dismiss' | 'locked' | 'error' | 'success';
    authentication?: {
      accessToken: string;
      idToken?: string;
      refreshToken?: string;
    } | null;
    error?: any;
    params?: Record<string, string>;
    url?: string;
  }
  export function useAuthRequest(
    config: GoogleAuthRequestConfig,
    discovery?: any
  ): [any, AuthSessionResult | null, () => Promise<AuthSessionResult>];
  const content: any;
  export default content;
}

declare module 'expo-web-browser' {
  export function maybeCompleteAuthSession(): { type: string };
  export function openBrowserAsync(url: string, options?: any): Promise<any>;
  export function openAuthSessionAsync(url: string, redirectUrl?: string, options?: any): Promise<any>;
  const content: any;
  export default content;
}

declare module 'expo-crypto' {
  export function getRandomBytesAsync(byteCount: number): Promise<Uint8Array>;
  export function digestStringAsync(algorithm: string, data: string): Promise<string>;
  const content: any;
  export default content;
}

declare module 'expo-sharing' {
  export function isAvailableAsync(): Promise<boolean>;
  export function shareAsync(url: string, options?: any): Promise<void>;
  const content: any;
  export default content;
}

declare module 'expo-blur' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';
  export interface BlurViewProps extends ViewProps {
    intensity?: number;
    tint?: 'light' | 'dark' | 'default' | 'extraLight' | 'chromeMaterial' | 'chromeMaterialDark' | 'chromeMaterialLight';
    blurReductionFactor?: number;
    experimentalBlurMethod?: string;
  }
  export const BlurView: ComponentType<BlurViewProps>;
  const content: any;
  export default content;
}

declare module 'lucide-react-native' {
  import { ComponentType } from 'react';
  import { SvgProps } from 'react-native-svg';
  interface IconProps extends SvgProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
  }
  type Icon = ComponentType<IconProps>;
  export const Home: Icon;
  export const Search: Icon;
  export const Heart: Icon;
  export const User: Icon;
  export const ShoppingCart: Icon;
  export const MapPin: Icon;
  export const Star: Icon;
  export const Clock: Icon;
  export const ChevronRight: Icon;
  export const ChevronLeft: Icon;
  export const Bell: Icon;
  export const Settings: Icon;
  export const Menu: Icon;
  export const X: Icon;
  export const Check: Icon;
  export const Plus: Icon;
  export const Minus: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const Filter: Icon;
  export const Utensils: Icon;
  export const QrCode: Icon;
  export const CreditCard: Icon;
  export const Gift: Icon;
  export const Calendar: Icon;
  export const BarChart: Icon;
  export const Truck: Icon;
  export const Package: Icon;
  export const AlertCircle: Icon;
  export const Info: Icon;
  export const Wifi: Icon;
  export const WifiOff: Icon;
  export const RefreshCw: Icon;
  export const Bookmark: Icon;
  export const Share: Icon;
  export const MoreHorizontal: Icon;
  export const MoreVertical: Icon;
  export const Edit: Icon;
  export const Trash: Icon;
  export const Copy: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Lock: Icon;
  export const Unlock: Icon;
  export const Phone: Icon;
  export const Mail: Icon;
  export const Camera: Icon;
  export const Image: Icon;
  export const Scan: Icon;
  export const Zap: Icon;
  export const LayoutDashboard: Icon;
  export const ClipboardList: Icon;
  export const ChefHat: Icon;
  export const Users: Icon;
  export const Layers: Icon;
  export const LogOut: Icon;
  export const Receipt: Icon;
  export const DollarSign: Icon;
  export const Tag: Icon;
  export const Percent: Icon;
  export const TrendingUp: Icon;
  export const TrendingDown: Icon;
  export const Activity: Icon;
  export const PieChart: Icon;
  export const BarChart2: Icon;
  export const FileText: Icon;
  export const Printer: Icon;
  export const Download: Icon;
  export const Upload: Icon;
  export const Shield: Icon;
  export const Key: Icon;
  export const Globe: Icon;
  export const Navigation: Icon;
  export const Map: Icon;
  export const Coffee: Icon;
  export const Wine: Icon;
  export const UtensilsCrossed: Icon;
  export const Store: Icon;
  export const Building: Icon;
  export const Palmtree: Icon;
  export const Music: Icon;
  export const Headphones: Icon;
  export const Timer: Icon;
  export const Hourglass: Icon;
  export const AlertTriangle: Icon;
  export const XCircle: Icon;
  export const CheckCircle: Icon;
  export const MinusCircle: Icon;
  export const PlusCircle: Icon;
  export const HelpCircle: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const ArrowUp: Icon;
  export const ArrowDown: Icon;
  export const RotateCcw: Icon;
  export const RotateCw: Icon;
  export const Maximize: Icon;
  export const Minimize: Icon;
  export const ExternalLink: Icon;
  export const Link: Icon;
  export const Clipboard: Icon;
  export const Send: Icon;
  export const MessageCircle: Icon;
  export const MessageSquare: Icon;
  export const Inbox: Icon;
  export const Archive: Icon;
  export const Flag: Icon;
  export const ThumbsUp: Icon;
  export const ThumbsDown: Icon;
  export const Award: Icon;
  export const Crown: Icon;
  export const Sparkles: Icon;
  export const Flame: Icon;
  export const Sun: Icon;
  export const Moon: Icon;
  export const Cloud: Icon;
  export const Droplet: Icon;
  export const Snowflake: Icon;
  // Allow any other named icon export via index signature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any;
  export default content;
}

declare module '@react-native-community/slider' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';
  interface SliderProps extends ViewProps {
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    disabled?: boolean;
    onValueChange?: (value: number) => void;
    onSlidingStart?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
  }
  const Slider: ComponentType<SliderProps>;
  export default Slider;
}

declare module '@react-native-community/datetimepicker' {
  import { ComponentType } from 'react';
  interface DateTimePickerProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime' | 'countdown';
    display?: 'default' | 'spinner' | 'calendar' | 'clock' | 'compact' | 'inline';
    onChange?: (event: any, date?: Date) => void;
    maximumDate?: Date;
    minimumDate?: Date;
    minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
    is24Hour?: boolean;
    locale?: string;
    timeZoneOffsetInMinutes?: number;
    textColor?: string;
    accentColor?: string;
    themeVariant?: 'light' | 'dark';
    disabled?: boolean;
  }
  const DateTimePicker: ComponentType<DateTimePickerProps>;
  export default DateTimePicker;
}

declare module '@testing-library/react-hooks' {
  export function renderHook<TResult>(
    callback: () => TResult,
    options?: any
  ): {
    result: { current: TResult };
    rerender: (props?: any) => void;
    unmount: () => void;
    waitFor: (callback: () => boolean | void, options?: any) => Promise<void>;
    waitForNextUpdate: (options?: any) => Promise<void>;
  };
  export function act(callback: () => void | Promise<void>): Promise<void>;
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  const Icon: ComponentType<IconProps>;
  export default Icon;
}

declare module 'react-native-chart-kit' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    backgroundGradientFromOpacity?: number;
    backgroundGradientToOpacity?: number;
    color?: (opacity?: number) => string;
    labelColor?: (opacity?: number) => string;
    strokeWidth?: number;
    barPercentage?: number;
    useShadowColorFromDataset?: boolean;
    decimalPlaces?: number;
    propsForDots?: any;
    propsForLabels?: any;
    propsForBackgroundLines?: any;
    fillShadowGradient?: string;
    fillShadowGradientOpacity?: number;
    style?: any;
    [key: string]: any;
  }

  interface ChartData {
    labels?: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
      withDots?: boolean;
      [key: string]: any;
    }>;
    legend?: string[];
    [key: string]: any;
  }

  interface BaseChartProps extends ViewProps {
    data: ChartData;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    bezier?: boolean;
    withInnerLines?: boolean;
    withOuterLines?: boolean;
    withHorizontalLabels?: boolean;
    withVerticalLabels?: boolean;
    withDots?: boolean;
    withShadow?: boolean;
    withScrollableDot?: boolean;
    segments?: number;
    fromZero?: boolean;
    yAxisLabel?: string;
    yAxisSuffix?: string;
    yAxisInterval?: number;
    xLabelsOffset?: number;
    yLabelsOffset?: number;
    hidePointsAtIndex?: number[];
    formatXLabel?: (xValue: string) => string;
    formatYLabel?: (yValue: string) => string;
    getDotColor?: (dataPoint: any, dataPointIndex: number) => string;
    onDataPointClick?: (data: any) => void;
    decorator?: () => any;
    verticalLabelRotation?: number;
    horizontalLabelRotation?: number;
    transparent?: boolean;
    style?: any;
    [key: string]: any;
  }

  export const LineChart: ComponentType<BaseChartProps>;
  export const BarChart: ComponentType<BaseChartProps>;
  export const PieChart: ComponentType<any>;
  export const ProgressChart: ComponentType<any>;
  export const ContributionGraph: ComponentType<any>;
  export const StackedBarChart: ComponentType<any>;
  export const AbstractChart: ComponentType<any>;
}

declare module 'msw' {
  export function http(...args: any[]): any;
  export function graphql(...args: any[]): any;
  export function HttpResponse(...args: any[]): any;
  export const rest: any;
  const content: any;
  export default content;
}

declare module 'msw/node' {
  export function setupServer(...handlers: any[]): {
    listen: (options?: any) => void;
    close: () => void;
    resetHandlers: (...handlers: any[]) => void;
    use: (...handlers: any[]) => void;
  };
}
