import React from 'react';
import HomePage from './HomePage';
import ListingDetailPage from './ListingDetailPage';
import { LoginPage, RegisterPage } from './AuthPages';

import DashboardPage from './DashboardPage';

import ItineraryPlannerPage from './ItineraryPlannerPage';

import AdminDashboardPage from './AdminDashboardPage';

const Placeholder: React.FC<{ name: string }> = ({ name }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{name}</h1>
    <p>This page is under construction.</p>
  </div>
);

export { HomePage, ListingDetailPage, LoginPage, RegisterPage, DashboardPage, ItineraryPlannerPage, AdminDashboardPage };
