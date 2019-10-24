import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import styled from "styled-components";
import { basicFixture } from "./ConnectedTicketShowModal.fixtures";
import ConnectedTicketShowModal from "./ConnectedTicketShowModal";

import { simpleFixture as ticketFixture } from "../TicketShowModal/TicketShowModal.fixtures";
import { memberAssignFixture } from "../TicketDetails/TicketDetails.fixtures";
import Badge from "../Badge";

const StyledBadge = styled(Badge)`
  cursor: pointer;
  :hover {
    background-color: ${({ theme }) => theme.color.darkYellow};
  }
`;

const fetchTicketsByFilters = () => Promise.resolve(ticketFixture);
const fetchTicketById = () => Promise.resolve(ticketFixture.activeTicket);
const submitCommentByTicketId = () =>
  Promise.resolve(ticketFixture.activeTicket);
const uploadAttachments = () => Promise.resolve(ticketFixture.activeTicket);
const fetchMembers = () =>
  Promise.resolve({ admin_members: memberAssignFixture.members });
const assignTicketToMember = () => Promise.resolve(ticketFixture.activeTicket);
const closeTicket = () => Promise.resolve(ticketFixture.activeTicket);
const cancelTicket = () => Promise.resolve(ticketFixture.activeTicket);
const mockFns = {
  fetchTicketsByFilters,
  fetchTicketById,
  submitCommentByTicketId,
  uploadAttachments,
  fetchMembers,
  assignTicketToMember,
  closeTicket,
  cancelTicket
};

const RenderPropDecorator = () => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: "100px" }}>
      <ConnectedTicketShowModal
        {...basicFixture}
        open={open}
        filters={[
          {
            type: "entity_type",
            value: "purchase_order",
            displayValue: "Purchase Order"
          }
        ]}
        onAction={() => setOpen(false)}
        renderButton={({ isLoading, badgeTitle }) => (
          <StyledBadge status="open" onClick={() => setOpen(true)}>
            {isLoading ? "..." : badgeTitle}
          </StyledBadge>
        )}
      />
    </div>
  );
};

const GoOpsRenderPropDecorator = () => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: "100px" }}>
      <ConnectedTicketShowModal
        {...basicFixture}
        open={open}
        filters={[
          {
            type: "entity_type",
            value: "purchase_order",
            displayValue: "Purchase Order"
          }
        ]}
        onAction={() => setOpen(false)}
        renderButton={({ isLoading, ticketCount, badgeTitle }) =>
          isLoading || ticketCount ? (
            <StyledBadge status="open" onClick={() => setOpen(true)}>
              {isLoading ? "..." : badgeTitle}
            </StyledBadge>
          ) : null
        }
      />
    </div>
  );
};

storiesOf("Organisms | Ticketing", module)
  .add("ConnectedTicketShowModal using api", () => (
    <div style={{ padding: "100px" }}>
      <ConnectedTicketShowModal
        {...basicFixture}
        onAction={args => action("onAction")(args)}
      />
    </div>
  ))
  .add("ConnectedTicketShowModal when open without render prop", () => (
    <div style={{ padding: "100px" }}>
      <ConnectedTicketShowModal
        {...basicFixture}
        open
        onaction={args => action("onAction")(args)}
      />
    </div>
  ))
  .add("ConnectedTicketShowModal with render prop in lead plus", () => (
    <div style={{ padding: "100px" }}>
      <RenderPropDecorator />
    </div>
  ))
  .add(
    "ConnectedTicketShowModal with render prop in go-ops and go-partner",
    () => (
      <div style={{ padding: "100px" }}>
        <GoOpsRenderPropDecorator />
      </div>
    )
  )
  .add("ConnectedTicketShowModal with mockFns", () => (
    <div style={{ padding: "100px" }}>
      <ConnectedTicketShowModal
        {...basicFixture}
        onAction={args => action("onAction")(args)}
        {...mockFns}
      />
    </div>
  ));
