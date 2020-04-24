import { browser } from 'protractor';

export class ScholarsPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }
}
