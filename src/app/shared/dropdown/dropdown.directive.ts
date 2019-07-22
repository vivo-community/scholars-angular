import { Directive, HostListener, HostBinding, ElementRef } from '@angular/core';

@Directive({
    selector: '[scholars-dropdown]',
})

export class DropdownDirective {
    constructor(private _el: ElementRef) {
    }

    @HostBinding('class.show')
    isOpen = false;

    @HostListener('click')
    toggleOpen() {
        this.isOpen=!this.isOpen;
        if(this.isOpen) {
            this._el.nativeElement.querySelector('.dropdown-menu').classList.add('show');
        } else {
            this._el.nativeElement.querySelector('.dropdown-menu').classList.remove('show');
        }
    }
}