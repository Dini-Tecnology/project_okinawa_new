import React from 'react';
import { Outlet } from 'react-router-dom';
import FeedbackWidget from '@/components/site/FeedbackWidget';

const SiteLayout: React.FC = () => (
  <>
    <Outlet />
    <FeedbackWidget />
  </>
);

export default SiteLayout;