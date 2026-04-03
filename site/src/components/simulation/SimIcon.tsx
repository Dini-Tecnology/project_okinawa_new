/**
 * SimIcon — Renders a Lucide icon from a string name.
 * Used across simulation data to replace emoji usage with proper icons.
 */
import React from 'react';
import {
  Building2, ClipboardList, Users, Wine, Zap, RefreshCw, Rocket,
  UtensilsCrossed, Store, Leaf, Car, Coffee, Beer, Music, Truck, Soup,
  Banknote, TrendingDown, Star, Flame, BarChart3, Layers, AlertTriangle,
  FileText, Timer, HelpCircle, Sparkles, Gem, Calendar, Brain, Camera,
  PersonStanding, CreditCard, Package, Mic, Coins, MapPin, Trash2, Scale,
  Utensils, Volume2, Lock, GlassWater, Wifi, Cookie,
  Mail, Smartphone, Monitor, Bell, Crown, CheckCircle, AlertCircle,
  User, UserCheck, BookOpen, MessageCircle, AlertOctagon, Frown, Smile,
  Target, DollarSign, Play, ChefHat, ArrowRight, X, XCircle,
  ShieldAlert, Eye, Heart, ThumbsUp, Receipt, SquareStack, Gauge,
  CircleDollarSign, Activity, Percent, CircleCheck, Clock, Send, Ticket,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'building-2': Building2,
  'clipboard-list': ClipboardList,
  'users': Users,
  'wine': Wine,
  'zap': Zap,
  'refresh-cw': RefreshCw,
  'rocket': Rocket,
  'utensils-crossed': UtensilsCrossed,
  'store': Store,
  'leaf': Leaf,
  'car': Car,
  'coffee': Coffee,
  'beer': Beer,
  'music': Music,
  'truck': Truck,
  'soup': Soup,
  'banknote': Banknote,
  'trending-down': TrendingDown,
  'star': Star,
  'flame': Flame,
  'bar-chart-3': BarChart3,
  'layers': Layers,
  'alert-triangle': AlertTriangle,
  'file-text': FileText,
  'timer': Timer,
  'help-circle': HelpCircle,
  'sparkles': Sparkles,
  'gem': Gem,
  'calendar': Calendar,
  'brain': Brain,
  'camera': Camera,
  'person-standing': PersonStanding,
  'credit-card': CreditCard,
  'package': Package,
  'mic': Mic,
  'coins': Coins,
  'map-pin': MapPin,
  'trash-2': Trash2,
  'scale': Scale,
  'utensils': Utensils,
  'volume-2': Volume2,
  'lock': Lock,
  'glass-water': GlassWater,
  'wifi': Wifi,
  'cookie': Cookie,
  'mail': Mail,
  'smartphone': Smartphone,
  'monitor': Monitor,
  'bell': Bell,
  'crown': Crown,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'user': User,
  'user-check': UserCheck,
  'book-open': BookOpen,
  'message-circle': MessageCircle,
  'alert-octagon': AlertOctagon,
  'frown': Frown,
  'smile': Smile,
  'target': Target,
  'dollar-sign': DollarSign,
  'play': Play,
  'chef-hat': ChefHat,
  'arrow-right': ArrowRight,
  'x': X,
  'x-circle': XCircle,
  'shield-alert': ShieldAlert,
  'eye': Eye,
  'heart': Heart,
  'thumbs-up': ThumbsUp,
  'receipt': Receipt,
  'square-stack': SquareStack,
  'gauge': Gauge,
  'circle-dollar-sign': CircleDollarSign,
  'activity': Activity,
  'percent': Percent,
  'circle-check': CircleCheck,
  'clock': Clock,
  'send': Send,
  'ticket': Ticket,
};

interface SimIconProps {
  name: string;
  size?: number;
  className?: string;
}

const SimIcon: React.FC<SimIconProps> = ({ name, size = 18, className = '' }) => {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) {
    // Fallback: render nothing for unknown icons
    return <span className={`inline-block ${className}`} style={{ width: size, height: size }} />;
  }
  return <IconComponent size={size} className={className} />;
};

export default SimIcon;
