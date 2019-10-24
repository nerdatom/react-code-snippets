/* eslint no-shadow: 0 */
import React, { useState, useReducer, useEffect } from "react";
import Proptypes from "prop-types";
import mapActionsToProps from "../../utils/mapActionsToProps";
import TicketShowModal from "../TicketShowModal";
import { useLog } from "../hooks";
import {
  ticketDecorator,
  memberDecorator as decorateMembers,
  assignedMemberDecorator as decorateAssignedMembers
} from "./ConnectedTicketShowModal.decorators";
import {
  filterReducer,
  ticketReducer,
  initialTicketState,
  UPDATE_TICKETS,
  LOAD_NEXT_PAGE_TICKETS,
  ADD_TICKETS,
  UPDATE_FILTERS,
  UPDATE_COUNT,
  REDUCE_COUNT,
  RESET_PAGINATION
} from "./ConnectedTicketShowModal.reducers";
import {
  uploadAttachments,
  fetchTicketsByFilters,
  fetchTicketById,
  submitCommentByTicketId,
  fetchMembers,
  closeTicket,
  cancelTicket,
  assignTicketToMember,
  assignTicketToWatchers,
  removeWatcher
} from "../../actions/ticketing";

const ReactSampleCode = ({
  userId,
  userType,
  open: openProp = false,
  filterProps,
  renderButton,
  fetchTicketById,
  submitCommentByTicketId,
  fetchTicketsByFilters,
  fetchMembers,
  uploadAttachments,
  assignTicketToMember,
  closeTicket,
  cancelTicket,
  filterTicketsByText,
  onAction,
  openCreateTicketModal
}) => {
  const [filters, dispatchFilterAction] = useReducer(filterReducer);
  const [
    { tickets, pagination, hasMore, count: ticketCount },
    dispatchTicketAction
  ] = useReducer(ticketReducer, initialTicketState);
  const [files, setFiles] = useState([]);
  const [loadingKey, setLoadingKey] = useState("none");
  const initialBadgeTitle = ticketCount === 0 ? "No Tickets Found" : "...";
  const [badgeTitle, setBadgeTitle] = useState(initialBadgeTitle);
  const [ticketCountText, setTicketCountText] = useState("");
  const [activeTicket, setActiveTicket] = useState({});
  const [isTextFiltered, setIsTextFiltered] = useState(false);
  const [textFilteredTickets, setTextFilteredTickets] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [assignedWatchers, setAssignedWatchers] = useState([]);
  const [error, setError] = useState([]);
  const [open, setOpen] = useState(false);
  const log = useLog();

  const handleError = e => {
    setError(e);
  };

  const onModalAction = (actionType, payload) => {
    log({
      type: "action",
      title: actionType,
      payload: { payload, loadingKey }
    });
    switch (actionType) {
      case "selectTicket": {
        const { id } = payload;
        setLoadingKey("ticketShow");
        fetchTicketById({ id, userId, userType })
          .then(ticket => ticketDecorator({ ticket, userId }))
          .then(setActiveTicket)
          .then(() => setLoadingKey("none"))
          .catch(handleError);
        break;
      }
      case "submitComment": {
        const { id: ticketId } = activeTicket;
        const comment = { ...payload, creator_type: userType, creator: userId };
        submitCommentByTicketId({ ticketId, comment, userId, userType })
          .then(() => setFiles([]))
          .then(() => fetchTicketById({ id: ticketId, userId, userType }))
          .then(ticket => ticketDecorator({ ticket, userId }))
          .then(setActiveTicket)
          .catch(handleError);
        break;
      }
      case "clearFilters": {
        dispatchFilterAction({ type: UPDATE_FILTERS, payload: [] });
        break;
      }
      case "removeFilter": {
        const filtered = filters.filter(f => f.type !== payload.type);
        dispatchFilterAction({ type: UPDATE_FILTERS, payload: filtered });
        break;
      }
      case "filterSearch": {
        dispatchFilterAction({ type: UPDATE_FILTERS, payload });
        break;
      }
      case "loadNextPageTickets": {
        if (loadingKey !== "paginationChange") {
          dispatchTicketAction({ type: LOAD_NEXT_PAGE_TICKETS });
        }
        break;
      }
      case "filterCreatedAt":
      case "filterAssigneeId":
      case "filterStatus": {
        /* setLoadingKey("ticketIndex");
        const pagination = { per_page: 10, page: 1 };
        dispatchTicketAction({ type: RESET_PAGINATION }); */
        dispatchFilterAction({ type: UPDATE_FILTERS, payload });
        /* fetchTicketsByFilters({
          userId,
          userType,
          filters: payload,
          pagination
        })
          .then(payload => {
            if (!payload) return;
            dispatchTicketAction({ type: "UPDATE_TICKETS", payload });
          })
          .then(() => setLoadingKey("none"))
          .catch(handleError); */
        break;
      }
      case "uploadAttachment": {
        const {
          target: { files: targetFiles }
        } = payload;
        setLoadingKey("attachment");
        uploadAttachments({ userId, userType, files: targetFiles })
          .then(res => {
            setFiles([...files, ...res]);
            setLoadingKey("none");
          })
          .catch(handleError);
        break;
      }
      case "assignMember": {
        assignTicketToMember({
          userId,
          userType,
          assignee_id: payload.id,
          ticketId: activeTicket.id
        })
          .then(({ assignee_id: assigneeId }) =>
            decorateAssignedMembers({
              members,
              assigneeId,
              creator: activeTicket.creator
            })
          )
          .then(setAssignedMembers)
          .catch(handleError);
        break;
      }
      case "assignWatcherMember": {
        assignTicketToWatchers({
          userId,
          userType,
          assignee_id: payload.id,
          ticketId: activeTicket.id
        })
          .then(({ id, name }) => {
            const watchersList = [...assignedWatchers];
            const assignee = {
              id,
              label: name
            };
            if (
              !watchersList.filter(
                val => JSON.stringify(val) === JSON.stringify(assignee)
              ).length
            )
              watchersList.push(assignee);
            return watchersList;
          })
          .then(setAssignedWatchers)
          .catch(handleError);
        break;
      }
      case "removeAttachment": {
        const newFiles = files.filter(file => file.id !== payload);
        setFiles(newFiles);
        break;
      }
      case "confirmCloseTicket": {
        closeTicket({
          userId,
          userType,
          ticketId: activeTicket.id,
          resolution_remark: payload
        })
          .then(({ status }) => {
            setActiveTicket({ ...activeTicket, status });
            const updatedTickets = tickets.map(ticket => {
              const t = { ...ticket };
              if (t.id === activeTicket.id) {
                t.status = status;
              }
              return t;
            });
            dispatchTicketAction({
              type: UPDATE_TICKETS,
              payload: { tickets: updatedTickets }
            });
            dispatchTicketAction({ type: REDUCE_COUNT });
          })
          .catch(handleError);
        break;
      }
      case "confirmCancelTicket": {
        cancelTicket({ userId, userType, ticketId: activeTicket.id })
          .then(({ status }) => {
            setActiveTicket({ ...activeTicket, status });
            const updatedTickets = tickets.map(ticket => {
              const t = { ...ticket };
              if (t.id === activeTicket.id) {
                t.status = status;
              }
              return t;
            });
            dispatchTicketAction({
              type: UPDATE_TICKETS,
              payload: { tickets: updatedTickets }
            });
            dispatchTicketAction({ type: REDUCE_COUNT });
          })
          .catch(handleError);
        break;
      }
      case "closeModal": {
        setOpen(false);
        onAction("closeModal");
        break;
      }
      case "removeWatcher": {
        log({
          type: "action",
          title: actionType,
          payload: { payload, loadingKey }
        });
        removeWatcher({ ...payload, userId, userType })
          .then(({ id, name }) => {
            const assignee = {
              id,
              label: name
            };
            const watchersList = assignedWatchers.filter(
              val => JSON.stringify(val) !== JSON.stringify(assignee)
            );
            return watchersList;
          })
          .then(setAssignedWatchers)
          .catch(handleError);
        break;
      }
      default: {
        log({ type: "implement", title: actionType, payload });
        onAction(actionType, payload);
        break;
      }
    }
  };

  useEffect(() => {
    setOpen(openProp);
  }, [openProp]);

  useEffect(() => {
    if (open) {
      fetchMembers({ userId, userType })
        .then(decorateMembers)
        .then(setMembers);
    }
  }, [open]);

  useEffect(() => {
    log({
      payload: {
        filters,
        filterProps,
        c: JSON.stringify(filterProps) !== JSON.stringify(filters),
        C:
          filters &&
          filterProps &&
          JSON.stringify(filterProps) !== JSON.stringify(filters)
      }
    });
    if (!open && JSON.stringify(filterProps) !== JSON.stringify(filters)) {
      dispatchFilterAction({
        type: UPDATE_FILTERS,
        payload: filterProps
      });
    }
  }, [filterProps]);

  // initial loading filterprops are defined and different from filter state
  // change filter state filterprops are different from filters

  /**
   * Update tickets whenever filters change
   */
  useEffect(() => {
    log({ type: "effect", title: "filters", payload: filters });

    /**
     * reset pagination on changing filters.
     */

    const filtersAreDefined = !!filterProps && !!filters;
    const filtersAreEmpty = filters === {};
    const isSearchFilter =
      filtersAreDefined &&
      !filtersAreEmpty &&
      filters.some(payload => payload.type === "search");
    const abort = !filtersAreDefined || filtersAreEmpty;
    if (abort) return;
    const abortController = new AbortController(); // eslint-disable-line
    setLoadingKey("ticketIndex");
    const pagination = { per_page: 10, page: 1 };
    dispatchTicketAction({ type: RESET_PAGINATION });

    const { signal } = abortController;

    fetchTicketsByFilters({ userId, userType, filters, pagination, signal })
      .then(payload => {
        if (!payload) return;
        dispatchTicketAction({ type: UPDATE_TICKETS, payload });
        dispatchTicketAction({ type: UPDATE_COUNT, payload });
        if (isSearchFilter) {
          const { tickets } = payload;
          const filteredTickets = filterTicketsByText({
            tickets,
            payload: filters,
            setIsTextFiltered
          });
          setTextFilteredTickets(filteredTickets);
          const resPayload = {
            tickets: filteredTickets,
            count: filteredTickets.length
          };
          dispatchTicketAction({ type: UPDATE_TICKETS, payload: resPayload });
          dispatchTicketAction({ type: UPDATE_COUNT, payload: resPayload });
        }
      })
      .then(() => setLoadingKey("none"))
      .catch(e => log({ type: "error", payload: e })); // eslint-disable-line
    return () => {
      // eslint-disable-line
      abortController.abort();
    };
  }, [filters]);

  /**
   * selects first ticket and title whenever tickets change
   */
  useEffect(() => {
    log({ type: "effect", title: "tickets", payload: tickets });
    if ([null, undefined].includes(tickets) || !tickets || !tickets.length)
      return;
    const isFirstTicketAlreadySelected =
      activeTicket && activeTicket.id && tickets[0].id === activeTicket.id;
    if (isFirstTicketAlreadySelected) return;
    fetchTicketById({ id: tickets[0].id, userId, userType })
      .then(ticket => ticketDecorator({ ticket, userId }))
      .then(setActiveTicket)
      .catch(handleError);
  }, [tickets]);

  /**
   * Change modal and badge titles on changing ticket count
   */
  const textMoreThanOne = ({ count, str }) => {
    const plural = count > 1 ? `${str}s` : str;
    return plural;
  };
  useEffect(() => {
    log({ type: "effect", title: "ticketCount", payload: ticketCount });
    if (!filters || filters === {}) return;
    const ticketCountText =
      ticketCount === 0
        ? "No Tickets Found"
        : `${ticketCount} ${textMoreThanOne({
            count: ticketCount,
            str: "ticket"
          })} found`;
    setTicketCountText(ticketCountText);
    /**
     * Check if tickets are for same purchase order on po show page. If not dont set badge title.
     */
    const entityIdFilter = filters.find(f => f.type === "entity_id");
    const areTicketsForBadgePO = filters.some(
      f => f.type === "entity_id" && f.value === entityIdFilter.value
    );
    const badgeTitle =
      ticketCount === 0 ? "No Open Tickets" : `${ticketCount} Total Tickets`;
    if (areTicketsForBadgePO) setBadgeTitle(badgeTitle);
  }, [ticketCount]);

  /**
   * Loads new tickets for infinite scroll
   */
  useEffect(() => {
    log({ type: "effect", title: "pagination", payload: pagination });
    if (pagination && pagination.page === 1) return; // ignore first page load as it is fetched by fetchTicketsByFilters on load
    const abortController = new AbortController(); // eslint-disable-line
    const { signal } = abortController;
    setLoadingKey("paginationChange");
    fetchTicketsByFilters({ userId, userType, filters, pagination, signal })
      .then(payload => {
        if (payload && loadingKey !== "ticketIndex") {
          dispatchTicketAction({ type: ADD_TICKETS, payload });
        }
      })
      .then(() => setLoadingKey("none"))
      .catch(e => log({ type: "error", payload: e })); // eslint-disable-line
    return () => {
      // eslint-disable-line
      abortController.abort();
    };
  }, [pagination]);

  /**
   * set assigned members whenever activeTicket changes
   */
  useEffect(() => {
    log({ type: "effect", title: "activeTicket", payload: activeTicket });
    if (
      [null, undefined].includes(activeTicket) ||
      Object.keys(activeTicket).length === 0
    )
      return;
    const assignees = decorateAssignedMembers({
      members,
      assigneeId: activeTicket.assignee_id
    });
    setAssignedMembers(assignees);
  }, [activeTicket, members]);

  useEffect(() => {
    log({ type: "effect", title: "activeTicket", payload: activeTicket });
    log({ type: "effect", title: "Ticket", payload: tickets });
    if (
      [null, undefined].includes(activeTicket) ||
      Object.keys(activeTicket).length === 0
    )
      return;
    if (tickets.length) {
      const { watchers } = tickets.filter(
        ticket => ticket.id === activeTicket.id
      )[0];
      const assigned = [];
      watchers.forEach(watcher => {
        const { name, id } = watcher;
        const assignee = {
          id,
          label: name
        };
        assigned.push(assignee);
      });
      setAssignedWatchers(assigned);
    }
  }, [activeTicket, members]);
  return (
    <React.Fragment>
      {renderButton &&
        renderButton({
          badgeTitle,
          isLoading: loadingKey === "ticketIndex",
          ticketCount
        })}
      <TicketShowModal
        title={loadingKey === "ticketIndex" ? "..." : "My assigned tickets"}
        filters={filters}
        loadingKey={loadingKey}
        open={open}
        activeTicket={activeTicket}
        members={members}
        assignedMembers={assignedMembers}
        assignedWatchers={assignedWatchers}
        error={error}
        tickets={tickets}
        files={files}
        hasMore={hasMore}
        onAction={onModalAction}
        isBulkTitle
        openCreateTicketModal={openCreateTicketModal}
        userId={userId}
        ticketCountText={ticketCountText}
      />
    </React.Fragment>
  );
};

export const filterTicketsByText = ({
  tickets,
  payload,
  setIsTextFiltered
}) => {
  const searchFilterIndex = payload.findIndex(f => f.type === "search");
  const hasSearchFilter = searchFilterIndex !== -1;
  if (!hasSearchFilter) return setIsTextFiltered(false);
  const searchString = payload[searchFilterIndex].value;
  /**
   * Searches searchString in all the keys below
   */
  const checkSearchString = (t, string) =>
    [
      String(t.reference_number),
      t.created_by,
      t.subject,
      t.ticket_category.category,
      t.ticket_category.sub_category,
      t.ticket_category.sub_sub_category,
      String(t.entity_id)
    ].some(val => {
      const isValidString =
        val && typeof val === "string" && ![undefined, null].includes(val);
      const isMatch = isValidString && val.toLowerCase().indexOf(string) !== -1;
      return isMatch;
    });
  setIsTextFiltered(true);
  return tickets.filter(t =>
    checkSearchString(t, String(searchString).toLowerCase())
  );
};

ConnectedTicketShowModal.defaultProps = {
  filterProps: [],
  renderButton: () => {},
  onAction: () => {},
  openCreateTicketModal: () => {}
};

ConnectedTicketShowModal.propTypes = {
  userId: Proptypes.number.isRequired,
  userType: Proptypes.string.isRequired,
  onAction: Proptypes.func.isRequired,
  open: Proptypes.bool.isRequired,
  fetchTicketsByFilters: Proptypes.func.isRequired,
  fetchTicketById: Proptypes.func.isRequired,
  submitCommentByTicketId: Proptypes.func.isRequired,
  uploadAttachments: Proptypes.func.isRequired,
  fetchMembers: Proptypes.func.isRequired,
  assignTicketToMember: Proptypes.func.isRequired,
  closeTicket: Proptypes.func.isRequired,
  cancelTicket: Proptypes.func.isRequired,
  renderButton: Proptypes.func,
  filterProps: Proptypes.arrayOf(
    Proptypes.shape({
      value: Proptypes.any.isRequired,
      label: Proptypes.string.isRequired,
      displayValue: Proptypes.string.isRequired
    })
  ).isRequired,
  filterTicketsByText: Proptypes.func.isRequired,
  openCreateTicketModal: Proptypes.func.isRequired
};

export default mapActionsToProps({
  fetchTicketsByFilters,
  fetchTicketById,
  submitCommentByTicketId,
  uploadAttachments,
  fetchMembers,
  assignTicketToMember,
  closeTicket,
  cancelTicket,
  filterTicketsByText
})(ReactSampleCode);
