import { Component, computed, inject, output } from '@angular/core';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-user-pagination',
  imports: [],
  templateUrl: './user-pagination.component.html',
  styleUrl: './user-pagination.component.scss'
})
export class UserPaginationComponent {
  private usersService = inject(UsersService);
  pageSelected = output<number>();
  currentPage = computed(() => this.usersService.currentPage());
  selectedList = computed(() => this.usersService.selectedList());
  hasNextPage = computed(() => this.usersService.hasNextPage());
  hasPreviousPage = computed(() => this.usersService.hasPreviousPage());
  lastPage = computed(() => this.usersService.lastPage());
  users = computed(() => this.usersService.filteredUsers());

  setPage(page: number) {
    this.usersService.currentPage.set(page);
    this.usersService.selectList(this.selectedList(), page);
  }
}