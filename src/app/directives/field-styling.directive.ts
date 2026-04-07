import { computed, Directive, input } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";

@Directive({
    selector: '[formField]',
    host: {
        '[class.invalid]': 'state().invalid() && state().touched()',
        '[class.valid]': 'state().valid() && state().touched()',
        '[class.touched]': 'state().touched()',
        '[class.dirty]': 'state().dirty()'
    }
})
export class FieldStyleDirective<T> {
    readonly formField = input.required<FieldTree<T>>();
    readonly state = computed(() => this.formField()());
}