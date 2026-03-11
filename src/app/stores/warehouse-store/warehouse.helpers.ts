import { required, SchemaPathTree, validate } from "@angular/forms/signals";

export interface WarehouseItemForm {
    name: string;
}

export function buildWarehouseItem(a: SchemaPathTree<WarehouseItemForm>) {
    required(a.name, { message: 'Název položky je povinný' });

    validate(a.name, field =>
        (field.value()?.length ?? 0) > 30
            ? { kind: 'maxLength', message: 'Prosím pouze 30 znaků' }
            : null
    );
}