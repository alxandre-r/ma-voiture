/**
 * @file src/app/settings/page.tsx
 */

import React from "react";

import { getCurrentUserInfo } from '@/lib/data/user/getCurrentUserInfo';
import { User } from '@/types/user';

import SettingsLayout from "./SettingsLayout";

export default async function SettingsPage() {
  const user = await getCurrentUserInfo()
  if (!user) {
    throw new Error("User not authenticated");
  }

  console.log("Current user:", user);

  return <SettingsLayout user={user as User} />;
}