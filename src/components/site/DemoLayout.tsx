import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FeedbackWidget from '@/components/site/FeedbackWidget';

/** Routes that provide their own DemoFeedbackWidget */
const ROUTES_WITH_OWN_FEEDBACK = ['/demo/client', '/demo/restaurant', '/demo/guided'];

const DemoLayout: React.FC = () => {
  const location = useLocation();
  const hasOwnFeedback = ROUTES_WITH_OWN_FEEDBACK.some(r => location.pathname.startsWith(r));

  return (
    <>
      <Outlet />
      {!hasOwnFeedback && <FeedbackWidget />}
    </>
  );
};

export default DemoLayout;