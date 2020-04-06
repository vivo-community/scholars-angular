import { isPlatformBrowser } from '@angular/common';
import { Component, Input, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'scholars-twitter',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.scss'],
})
export class TwitterComponent implements AfterViewInit {
  @Input()
  public id: string;

  @Input()
  public height = 350;

  constructor(@Inject(PLATFORM_ID) private platformId: string) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // tslint:disable-next-line: no-string-literal
      window['twttr'].widgets.load();
    }
  }
}
