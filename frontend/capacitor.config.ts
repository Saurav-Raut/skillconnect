import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skillconnect.app',
  appName: 'SkillConnect',
  webDir: 'build',
  server: {
    url: 'https://skillconnect-chi.vercel.app/',
    cleartext: true
  }
};

export default config;
