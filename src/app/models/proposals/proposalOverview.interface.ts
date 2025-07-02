export interface ProposalOverview {
    proposalsOverview: ProposalDestinationOverview[];
}

export interface ProposalDestinationOverview {
    destination: string;
    cooks: ProposalOverviewUser[];
    drivers: ProposalOverviewUser[];
}

export interface ProposalOverviewUser {
    userId: number;
    userName: string;
    userSurname: string;
    userNick: string;
    position: string;
    from?: string;
    to?: string;
}