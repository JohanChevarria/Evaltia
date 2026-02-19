export type Gender = "unspecified" | "male" | "female" | "other";

export type SettingsInitialData = {
  userId: string;
  uniCode: string;

  profile: {
    username: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    birthdate: string | null;
  };

  plan: {
    name: string;
    status: "demo" | "premium" | "expired" | string;
    validUntil: string | null;
  };

  preferences: {
    darkMode: boolean;
    showName: boolean;
    allowMessages: boolean;
    publicProgress: boolean;
  };
};

export type SettingsSavePayload = {
  userId: string;
  uniCode: string;
  profile: SettingsInitialData["profile"];
  preferences: SettingsInitialData["preferences"];
};
