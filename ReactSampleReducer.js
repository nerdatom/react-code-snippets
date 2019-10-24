/* eslint no-shadow: 0 */
import { useLog } from "../hooks";

export const UPDATE_TICKETS = "UPDATE_TICKETS";
export const LOAD_NEXT_PAGE_TICKETS = "LOAD_NEXT_PAGE_TICKETS";
export const ADD_FILTER = "ADD_FILTER";
export const UPDATE_FILTERS = "UPDATE_FILTERS";
export const CLEAR_FILTERS = "CLEAR_FILTERS";
export const ADD_TICKETS = "ADD_TICKETS";
export const RESET_PAGINATION = "RESET_PAGINATION";
export const UPDATE_COUNT = "UPDATE_COUNT";
export const REDUCE_COUNT = "REDUCE_COUNT";
export const INCREASE_COUNT = "INCREASE_COUNT";

export const initialTicketState = {
  tickets: [],
  count: 0,
  hasMore: false,
  pagination: {
    per_page: 10,
    page: 1
  }
};

export const ticketReducer = (state = initialTicketState, action) => {
  const { payload, type } = action;
  const log = useLog();

  log({ type: "reducer", title: type, payload });
  switch (type) {
    case ADD_TICKETS: {
      const { tickets } = payload;
      return {
        ...state,
        tickets: Array.from(new Set([...state.tickets, ...tickets]))
      };
    }
    case UPDATE_TICKETS: {
      const { tickets } = payload;
      return {
        ...state,
        tickets
      };
    }
    case REDUCE_COUNT: {
      const {
        pagination: { page, per_page }
      } = state;
      let { count } = state;
      count -= 1;
      const hasmore = count > page * per_page;
      return {
        ...state,
        hasmore,
        count
      };
    }
    case INCREASE_COUNT: {
      const {
        pagination: { page, per_page }
      } = state;
      let { count } = state;
      count += 1;
      const hasmore = count > page * per_page;
      return {
        ...state,
        hasmore,
        count
      };
    }
    case UPDATE_COUNT: {
      const {
        pagination: { page, per_page }
      } = state;
      const { count } = payload;
      const hasMore = count > page * per_page;
      return {
        ...state,
        hasMore,
        count
      };
    }
    case RESET_PAGINATION: {
      return {
        ...state,
        pagination: Object.assign({}, initialTicketState.pagination)
      };
    }
    case LOAD_NEXT_PAGE_TICKETS: {
      let {
        count, // eslint-disable-line
        pagination: { page, per_page, hasMore } // eslint-disable-line
      } = state;
      page += 1; // Incrememnt page no
      hasMore = count > page * per_page;
      return {
        ...state,
        hasMore,
        pagination: Object.assign({}, state.pagination, {
          page
        })
      };
    }
    default: {
      log({ title: type, type: "implement", payload });
      return state;
    }
  }
};

export const filterReducer = (state, action) => {
  const { payload, type } = action;
  const log = useLog();

  log({ type: "reducer", title: `Reducing ${type}`, payload });
  switch (action.type) {
    case CLEAR_FILTERS: {
      return [];
    }
    case ADD_FILTER: {
      return [...state, payload];
    }
    case UPDATE_FILTERS: {
      return payload;
    }
    default: {
      log({ title: type, type: "implement", payload });
      return state;
    }
  }
};
