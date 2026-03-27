// import { computed, Directive, input } from "@angular/core";
// import { FieldTree } from "@angular/forms/signals";

// @Directive({
//     selector: '[fieldStyle]',
//     host: {
//         '[class.invalid]': 'invalid()',
//         '[class.valid]': 'valid()',
//         '[class.touched]': 'touched()',
//         '[class.dirty]': 'dirty()'
//     }
// })
// export class FieldStyleDirective<T> {
//     readonly formField = input.required<FieldTree<T>>();
//     readonly fieldState = computed(() => this.formField()());
//     readonly touched = computed(() => this.fieldState().touched());
//     readonly invalid = computed(() => this.fieldState().invalid());
//     readonly valid = computed(() => this.fieldState().valid());
//     readonly dirty = computed(() => this.fieldState().dirty());
// }  

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