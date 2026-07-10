import { computed, Directive, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Directive({
  selector: '[formFieldStyle]',
  host: {
    '[class.invalid]': 'state().invalid() && state().touched()',
    '[class.valid]': 'state().valid() && state().touched()',
    '[class.touched]': 'state().touched()',
    '[class.dirty]': 'state().dirty()',
  },
})
export class FieldStyleDirective<T> {
  readonly formFieldStyle = input.required<FieldTree<T>>();
  readonly state = computed(() => this.formFieldStyle()());
}
