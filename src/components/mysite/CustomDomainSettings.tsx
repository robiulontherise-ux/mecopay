import React from 'react';
import IntegrateCustomDomain from './IntegrateCustomDomain';

interface CustomDomainSettingsProps {
  user: any;
  brands?: any[];
}

export default function CustomDomainSettings({ user, brands = [] }: CustomDomainSettingsProps) {
  return <IntegrateCustomDomain user={user} brands={brands} />;
}

export { IntegrateCustomDomain };
