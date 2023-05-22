export interface Feature {
  name: string;
  identifier: string;
  description: string;
  enabled: boolean;
  enable: () => void;
  disable: () => void;
}

export interface StorageChanges {
  [key: string]: chrome.storage.StorageChange;
}

export interface StorageRecords {
  [key: string]: any;
}
