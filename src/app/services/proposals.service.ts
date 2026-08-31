import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Response } from '../models/response.interface';
import {
  ProposalCard,
  SavedScheduleGeneratorRequestDTO,
  ScheduleGeneratorRequest,
} from '../models/proposals.interface';

@Service()
export class ProposalsService {
  private http = inject(HttpClient);
  private BASE_ROUTE = environment.PROPOSALS_PATH;
  updateHub = signal(false);

  deleteProposalCard(monthYear: string, destination: string) {
    monthYear = monthYear.length === 5 ? '0' + monthYear : monthYear;
    const url =
      this.BASE_ROUTE +
      `DeleteProposalCard?monthYear=${monthYear as string}&destination=${destination}`;
    return this.http.delete<Response>(url);
  }

  uploadPDF(card: ProposalCard) {
    const url = this.BASE_ROUTE + 'GenerateProposalPDF';
    return this.http.post<Response>(url, card);
  }

  getScheduledShifts(monthYear: string) {
    if (monthYear.length === 5) {
      monthYear = '0' + monthYear;
    }
    const url = this.BASE_ROUTE + `GetScheduledShifts?monthYear=${monthYear}`;
    return this.http.get<Response>(url);
  }

  saveProposals(cards: ProposalCard[]) {
    const url = this.BASE_ROUTE + `CreateUpdate`;
    return this.http.post<Response>(url, cards);
  }

  generateSchedule(request: ScheduleGeneratorRequest) {
    const url = this.BASE_ROUTE + `Generate`;
    return this.http.post<Response>(url, request);
  }

  getSavedGenerator(request: SavedScheduleGeneratorRequestDTO) {
    const url = this.BASE_ROUTE + `GetSavedGenerator`;
    return this.http.post<Response>(url, request);
  }

  saveGenerator(request: ScheduleGeneratorRequest) {
    const url = this.BASE_ROUTE + `SaveGenerator`;
    return this.http.post<Response>(url, request);
  }
}
