import { SelectedProposal } from "../models/proposals/selectedProposal.interface";

export const GetTimeFrom = (selectedProposal: SelectedProposal) => {
    return new Date(parseInt(selectedProposal.date.split('.')[2]), parseInt(selectedProposal.date.split('.')[1]) - 1, parseInt(selectedProposal.date.split('.')[0]), parseInt(selectedProposal.from.split(':')[0]), parseInt(selectedProposal.from.split(':')[1]));
}

export const GetTimeTo = (selectedProposal: SelectedProposal) => {
    return new Date(parseInt(selectedProposal.date.split('.')[2]), parseInt(selectedProposal.date.split('.')[1]) - 1, parseInt(selectedProposal.date.split('.')[0]), parseInt(selectedProposal.to.split(':')[0]), parseInt(selectedProposal.to.split(':')[1]));
}