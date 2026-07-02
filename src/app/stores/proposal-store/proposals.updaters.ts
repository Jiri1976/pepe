import { PartialStateUpdater } from '@ngrx/signals';
import { ProposalSlice } from './proposal.slice';
import { getSelectedMonthYear } from './proposal.helpers';
import {
  initializeMonthYear,
  isFridayOrSaturday,
} from '../../helpers/common-functions.helper';
import {
  ProposalCard,
  ProposalShift,
  ProposalUser,
  Inputs,
} from '../../models/proposals.interface';

export function resetCalendar(): PartialStateUpdater<ProposalSlice> {
  return (_) => ({
    monthYear: initializeMonthYear(),
  });
}

export function setSchedules(
  schedules: ProposalCard[],
): PartialStateUpdater<ProposalSlice> {
  return (_) => ({
    schedules,
    _original: structuredClone(schedules),
  });
}

export function setSelectedProposal(
  selectedProposal: ProposalShift,
): PartialStateUpdater<ProposalSlice> {
  const proposal: ProposalShift = { ...selectedProposal };
  if (proposal.from === null) {
    proposal.from = '11:00';
  }

  if (proposal.to === null) {
    proposal.to = isFridayOrSaturday(proposal.proposalDate) ? '23:00' : '22:00';
  }

  return (_) => ({
    selectedProposal: proposal,
  });
}

export function setMonthYear(
  monthYear: Date,
): PartialStateUpdater<ProposalSlice> {
  return (_) => ({
    monthYear: getSelectedMonthYear(monthYear),
  });
}

export function updatePositions(
  currentIndex: number,
  targetIndex: number,
  destination: string,
): PartialStateUpdater<ProposalSlice> {
  return (state) => {
    return {
      schedules: state.schedules.map((card) => {
        if (card.destination !== destination) {
          return card;
        }

        const users = [...card.users];
        const [movedUser] = users.splice(currentIndex, 1);
        const insertAt =
          targetIndex === currentIndex ? targetIndex + 1 : targetIndex;
        users.splice(insertAt, 0, movedUser);
        const reorderedUsers = users.map((user, index) => ({
          ...user,
          shifts: user.shifts.map((shift) => ({
            ...shift,
            listOrder: index,
          })),
        }));

        return {
          ...card,
          users: reorderedUsers,
        };
      }),
    };
  };
}

export function setOriginal(): PartialStateUpdater<ProposalSlice> {
  return (state) => ({
    _original: structuredClone(state.schedules),
  });
}

export function removeFromActive(
  user: ProposalUser,
  index: number,
  currentCard: ProposalCard,
  userShifts: ProposalShift[],
): PartialStateUpdater<ProposalSlice> {
  return (state) => {
    return {
      schedules: state.schedules.map((card) => {
        if (card.destination !== currentCard.destination) {
          let _sameusers = card.users.filter((u) => u.id === user.id);
          if (userShifts.length > 0 && _sameusers.length > 0) {
            userShifts.forEach((userShift) => {
              _sameusers.forEach((user) => {
                user.shifts.forEach((shift) => {
                  if (shift.proposalDate === userShift.proposalDate) {
                    if (shift.from === 'F-M' || shift.from === 'OVA') {
                      shift.from = null;
                      shift.to = null;
                    }
                  }
                });
              });
            });
          }
          return card;
        }

        const updatedUser: ProposalUser = {
          ...user,
          shifts: user.shifts,
        };

        return {
          ...card,
          users: card.users.filter((_, i) => i !== index),
          inactiveUsers: [...card.inactiveUsers, updatedUser],
        };
      }),
    };
  };
}

export function addFromInactive(
  inactiveUser: ProposalUser,
  position: 'Cook' | 'Driver' | 'Pizza' | 'Helper',
  currentCard: ProposalCard,
  opositeCard: ProposalCard,
): PartialStateUpdater<ProposalSlice> {
  return (state) => ({
    schedules: state.schedules.map((card) => {
      if (card.destination !== currentCard.destination) {
        return card;
      }

      const sameUsers = opositeCard.users.filter(
        (u) => u.id === inactiveUser.id,
      );

      const shifts: ProposalShift[] = Array.from(
        { length: currentCard.countOfDays },
        (_, i) => {
          const date = `${i + 1}.${currentCard.monthYear.substring(0, 2)}.${currentCard.monthYear.substring(2, 6)}`;
          const matchingShift = sameUsers
            .flatMap((user) => user.shifts)
            .find(
              (shift) =>
                shift.proposalDate === date &&
                shift.from !== 'F-M' &&
                shift.from !== 'OVA' &&
                shift.from !== null &&
                shift.to !== null,
            );

          return {
            destination: currentCard.destination,
            from: matchingShift ? matchingShift.destination : null,
            to: matchingShift ? matchingShift.to : null,
            id: 0,
            listOrder: currentCard.users.length,
            monthYear: currentCard.monthYear,
            position: inactiveUser.position,
            proposalDate: date,
            userId: inactiveUser.id,
            userName: inactiveUser.name,
            userSurname: inactiveUser.surname,
          };
        },
      );

      const updatedUser: ProposalUser = {
        ...inactiveUser,
        shifts,
      };

      return {
        ...card,
        users: [...card.users, updatedUser],
        inactiveUsers: card.inactiveUsers.filter(
          (user) =>
            !(user.id === inactiveUser.id && user.position === position),
        ),
      };
    }),
  });
}

export function deleteProposal(
  opositeCard?: ProposalCard | null,
): PartialStateUpdater<ProposalSlice> {
  return (state) => {
    const selected = state.selectedProposal;
    if (!selected) {
      return { schedules: state.schedules };
    }

    const matchingShift = (opositeCard?.users ?? [])
      .filter((u) => u.id === selected.userId)
      .flatMap((u) => u.shifts)
      .find(
        (shift) =>
          shift.proposalDate === selected.proposalDate &&
          shift.from !== 'F-M' &&
          shift.from !== 'OVA',
      );

    return {
      schedules: state.schedules.map((card) => {
        if (card.destination !== state.destination) {
          return {
            ...card,
            users: card.users.map((user) => {
              if (user.id !== selected.userId) {
                return user;
              }

              return {
                ...user,
                shifts: user.shifts.map((shift) => {
                  if (shift.proposalDate !== selected.proposalDate) {
                    return shift;
                  }

                  if (shift.from === 'F-M' || shift.from === 'OVA') {
                    return {
                      ...shift,
                      from: null,
                      to: null,
                    };
                  }

                  return shift;
                }),
              };
            }),
          };
        }

        return {
          ...card,
          users: card.users.map((user) => {
            if (
              user.id !== selected.userId ||
              user.position !== selected.position
            ) {
              return user;
            }

            return {
              ...user,
              shifts: user.shifts.map((shift) => {
                if (shift.proposalDate !== selected.proposalDate) {
                  return shift;
                }

                return {
                  ...shift,
                  from: matchingShift ? matchingShift.destination : null,
                  to: matchingShift ? matchingShift.to : null,
                };
              }),
            };
          }),
        };
      }),
    };
  };
}

export function updateProposal(
  inputs: Inputs,
): PartialStateUpdater<ProposalSlice> {
  return (state) => ({
    schedules: state.schedules.map((card) => {
      if (card.destination !== state.destination) {
        const users = card.users.map((user) => {
          if (user.id !== state.selectedProposal!.userId) {
            return user;
          }

          const shifts = user.shifts.map((shift) => {
            if (
              shift.proposalDate === state.selectedProposal!.proposalDate &&
              shift.from === null
            ) {
              return {
                ...shift,
                from: state.destination,
                to: `${inputs.hoursTo}:${inputs.minutesTo}`,
              };
            }

            return shift;
          });

          return {
            ...user,
            shifts,
          };
        });

        return {
          ...card,
          users,
        };
      }

      const users = card.users.map((user) => {
        if (
          user.id !== state.selectedProposal!.userId ||
          user.position !== state.selectedProposal!.position
        ) {
          return user;
        }

        const shifts = user.shifts.map((shift) => {
          if (shift.proposalDate === state.selectedProposal!.proposalDate) {
            return {
              ...shift,
              from: `${inputs.hoursFrom}:${inputs.minutesFrom}`,
              to: `${inputs.hoursTo}:${inputs.minutesTo}`,
            };
          }

          return shift;
        });

        return {
          ...user,
          shifts,
        };
      });

      return {
        ...card,
        users,
      };
    }),
  });
}
