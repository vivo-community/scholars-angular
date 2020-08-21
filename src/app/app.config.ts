import { InjectionToken } from '@angular/core';

interface AppConfig {
  host: string;
  port: number;
  baseHref: string;
  serviceUrl: string;
  embedUrl: string;
  vivoUrl: string;
  vivoEditorUrl: string;
  collectSearchStats: boolean;
}

const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export {
  AppConfig,
  APP_CONFIG
};
