
// Add missing React import to resolve the 'Cannot find namespace React' error.
import React from 'react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string;
}

export interface Location {
  id: string;
  city: string;
  address: string;
  phone: string;
}

export interface Treatment {
  title: string;
  description: string;
}