import { Component, input, output } from '@angular/core';
import { GetUserDTO } from '../../../models/users/getUserDTO.interface';

@Component({
  selector: 'app-user-pagination',
  imports: [],
  templateUrl: './user-pagination.component.html',
  styleUrl: './user-pagination.component.scss'
})
export class UserPaginationComponent {
  pageSelected = output<number>();
  currentPage = input.required<number>();
  hasPreviousPage = input.required<boolean>();
  hasNextPage = input.required<boolean>();
  users = input.required<GetUserDTO[]>();
  lastPage = input.required<number>();;

  setPage(page: number) {
    this.pageSelected.emit(page);
  }
}