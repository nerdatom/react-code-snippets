import React from "react";
import mount from "../../utils/mount";
import ConnectedTicketShowModal, {
  filterTicketsByText
} from "./ConnectedTicketShowModal";
import { ticketDecorator } from "./ConnectedTicketShowModal.decorators";
import { basicFixture } from "./ConnectedTicketShowModal.fixtures";
// import { RemovePillBtn } from '../Pill';
import { simpleFixture as ticketFixture } from "../TicketShowModal/TicketShowModal.fixtures";
import { memberAssignFixture } from "../TicketDetails/TicketDetails.fixtures";
import * as H from "../specHelpers";

describe("ConnectedTicketShowModal", () => {
  let component;

  const onAction = jest.fn();
  const fetchTicketsByFilters = jest
    .fn()
    .mockImplementation(() => Promise.resolve(ticketFixture));
  const fetchTicketById = jest
    .fn()
    .mockImplementation(() => Promise.resolve(ticketFixture.activeTicket));
  const submitCommentByTicketId = jest
    .fn()
    .mockImplementation(() => Promise.resolve(ticketFixture.activeTicket));
  const uploadAttachments = jest
    .fn()
    .mockImplementation(() => Promise.resolve(ticketFixture.activeTicket));
  const fetchMembers = jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ admin_users: memberAssignFixture.members })
    );
  const assignTicketToMember = jest
    .fn()
    .mockImplementation(() => Promise.resolve(ticketFixture.activeTicket));
  const closeTicket = jest
    .fn()
    .mockImplementation(() => Promise.resolve(ticketFixture.activeTicket));
  const cancelTicket = jest
    .fn()
    .mockImplementation(() => Promise.resolve(ticketFixture.activeTicket));
  const filterTicketsByText = jest
    .fn()
    .mockImplementation(() => [...ticketFixture.tickets]); // eslint-disable-line
  const mockFns = {
    fetchTicketsByFilters,
    fetchTicketById,
    submitCommentByTicketId,
    uploadAttachments,
    fetchMembers,
    assignTicketToMember,
    closeTicket,
    cancelTicket,
    filterTicketsByText
  };

  afterEach(() => component.unmount());
  beforeEach(() => {
    component = mount(
      <ConnectedTicketShowModal
        {...basicFixture}
        onAction={onAction}
        {...mockFns}
      />
    );
  });

  it("should fetchMembers on mount", () => {
    const { userId, userType } = basicFixture;
    const expected = {
      userId,
      userType
    };
    expect(fetchMembers).toHaveBeenCalledWith(expected);
  });

  it("should fetch tickets by with entity filter", () => {
    expect(fetchTicketsByFilters).toHaveBeenCalled();
  });

  // TODO: Fix these specs
  it("should select first ticket in results by default", () => {
    jest.useFakeTimers();
    const firstTicket = component.find(".TicketCard").at(0);
    expect(firstTicket).toHaveProp("isSelected", true);
  });

  it("fetch ticket details on selection from list", () => {
    const ticketCard = component.find("TicketCard").at(1);
    ticketCard.simulate("click");
    const { userId, userType } = basicFixture;
    const expected = { userId, userType, id: ticketFixture.tickets[1].id };
    expect(fetchTicketById).toHaveBeenCalledWith(expected);
  });

  it("removing a filter should fetch tickets with new filters", () => {
    const removeFilterBtn = component.find(RemovePillBtn).at(0);
    removeFilterBtn.simulate("click");
    const received = fetchTicketsByFilters.mock.calls[0][0];
    expect(received.filters).toEqual([]);
  });

  it("should submit comment", () => {
    openModal();
    const commentReplyBtn = component.find("#commentReplyBtn").at(0);
    commentReplyBtn.simulate("click");
    expect(submitCommentByTicketId).toHaveBeenCalled();
  });

  it("calls filterTicketsByText on changing search text", () => {
    openModal();
    const searchfilter = component.find("#searchFilter").at(0);
    const changeEvent = { target: { value: "Batman" } };
    searchfilter.simulate("change", changeEvent);
    const searchText = changeEvent.target.value;
    const expectedFilters = [
      ...ticketFixture.filters,
      H.filterHelper({
        displayValue: searchText,
        value: searchText,
        type: "search",
        label: searchText
      })
    ];
    const { tickets, payload: filters } = filterTicketsByText.mock.calls[0][0];
    expect(tickets).toEqual(ticketFixture.tickets);
    expect(filters).toEqual(expectedFilters);
  });
});

describe("filterTicketsByText", () => {
  it("should filter text in all ticket fields", () => {
    const props = {
      tickets: [...ticketFixture.tickets],
      payload: [H.filterHelper({ value: "Batman" })],
      setIsTextFiltered: jest.fn()
    };
    const filteredTickets = filterTicketsByText(props);
    // expect(props).toEqual({})
    const result = [
      ...ticketFixture.tickets.filter(t => t.subject === "Batman")
    ];
    expect(filteredTickets).toEqual(result);
  });
});

describe("ticketDecorator", () => {
  it("should sort tickets", () => {
    const { comments } = ticketDecorator({
      ticket: ticketFixture.activeTicket,
      userId: 10
    });
    const order = comments.map(c => c.created_at.toISOString());
    const expectedOrder = [
      "2019-02-12T10:44:03.000Z",
      "2019-02-12T20:44:03.000Z",
      "2019-02-13T10:44:03.000Z",
      "2019-02-13T11:44:03.000Z",
      "2019-02-14T10:44:03.000Z"
    ];
    expect(order).toEqual(expectedOrder);
  });

  it("should map self to comments from same user", () => {
    const args = { ticket: ticketFixture.activeTicket, userId: 1 };
    const { comments } = ticketDecorator(args);
    const commentFromSameUser = comments.find(c => {
      return c.creator === args.userId;
    });
    expect(commentFromSameUser).toHaveProperty("self", true);
  });
});
