import { Component, inject, input, InputSignal, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert.service';
import { ShiftService } from '../../../services/shift.service';

interface Users {
  userName: string;
  userId: number;
}

@Component({
  selector: 'app-select-user',
  imports: [CommonModule, DialogModule, ButtonModule,],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss'
})
export class SelectUserComponent {
  private shiftsService = inject(ShiftService)
  private alertService = inject(AlertService);
  visibleModal = model<boolean>(false);
  users: InputSignal<Users[]> = input.required<Users[]>();
  selected = output<number>();


  ngOnInit(): void {

  }

  onSelectUser(userId: number) {
    this.visibleModal.set(false)
    this.selected.emit(userId);
  }

  private isFridayOrSaturday(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
  }


}
