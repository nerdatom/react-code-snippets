/**
 * This file helps in maintaining proptypes easy and results in less console warnings in general.
 * It does this by maintaining shared proptype structure in betwen nested components. Also betwen connected and dumb components.
 * Exports default Proptypes from 'prop-types'
 *
 * Usage:
 *
 * // import Proptypes from 'prop-types';
 * import Proptypes, { customProptypes } from '../proptypes';
 *
 * component.proptypes = {
 *   ...customProptypes,
 *   yourSpecialProp: Proptypes.string.isRequired,
 * };
 */

import Proptypes from "prop-types";

export default Proptypes;
export setType from "es6-set-proptypes";
export urlType from "url-prop-type";

export const buttonKinds = Proptypes.oneOf([
  "primary",
  "info",
  "secondary",
  "danger",
  "warning",
  "dark",
  "light",
  "success",
  "icon"
]);

export const listItemDataTypes = {
  title: Proptypes.string.isRequired,
  desc: Proptypes.string.isRequired,
  meta: Proptypes.arrayOf(
    Proptypes.shape({
      icon: Proptypes.string,
      text: Proptypes.string
    })
  ).isRequired
};

const ticketStatus = Proptypes.oneOf(["open", "cancelled", "closed"]);
const className = Proptypes.string;
const onAction = Proptypes.func;
const errorProptypes = Proptypes.arrayOf(
  Proptypes.shape({
    message: Proptypes.string.isRequired,
    messages: Proptypes.arrayOf(Proptypes.string).isRequired
  })
);

export const fileProptypes = Proptypes.arrayOf(
  Proptypes.shape({
    id: Proptypes.string.isRequired,
    name: Proptypes.string.isRequired,
    type: Proptypes.string.isRequired,
    size: Proptypes.string.isRequired,
    file_url: Proptypes.string.isRequired
  })
);

export const commentProptypes = {
  content: Proptypes.string.isRequired,
  creator_name: Proptypes.string.isRequired,
  creator: Proptypes.number.isRequired,
  isPrivate: Proptypes.bool,
  self: Proptypes.bool,
  created_at: Proptypes.string.isRequired
};

export const ticketCommentsProptypes = {
  status: ticketStatus.isRequired,
  className: Proptypes.string,
  reference_number: Proptypes.string.isRequired,
  comments: Proptypes.arrayOf(Proptypes.shape(commentProptypes)).isRequired,
  created_at: Proptypes.string.isRequired,
  subject: Proptypes.string.isRequired,
  onAction: Proptypes.func.isRequired,
  loading: Proptypes.bool.isRequired,
  files: fileProptypes.isRequired,
  estimated_tat: Proptypes.string
};

export const commentItemProptypes = {
  items: Proptypes.arrayOf(Proptypes.shape(commentProptypes)).isRequired
};

const ticketCategoryProptypes = Proptypes.shape({
  category: Proptypes.string,
  sub_category: Proptypes.string,
  sub_sub_category: Proptypes.string
});

export const ticketCardProptypes = {
  reference_number: Proptypes.string.isRequired,
  status: ticketStatus.isRequired,
  isSelected: Proptypes.bool,
  creator: Proptypes.shape({
    id: Proptypes.number.isRequired,
    creator_name: Proptypes.string.isRequired
  }).isRequired,
  created_at: Proptypes.string.isRequired,
  subject: Proptypes.string.isRequired,
  className: Proptypes.string,
  ticket_category: ticketCategoryProptypes.isRequired,
  onAction: Proptypes.func.isRequired,
  estimated_tat: Proptypes.string
};

export const memberProptypes = Proptypes.arrayOf(
  Proptypes.shape({
    label: Proptypes.string.isRequired,
    value: Proptypes.string.isRequired
  })
);

export const ticketFiltersProptypes = {
  className: Proptypes.string,
  members: memberProptypes.isRequired,
  filters: Proptypes.arrayOf(
    Proptypes.shape({
      type: Proptypes.string.isRequired,
      value: Proptypes.oneOfType([Proptypes.string, Proptypes.number])
        .isRequired,
      displayValue: Proptypes.string.isRequired
    })
  ),
  onAction: Proptypes.func.isRequired
};

const creatorProptypes = {
  id: Proptypes.string,
  creator_type: Proptypes.string,
  creator_name: Proptypes.string
};

const activeTicketProptypes = Proptypes.shape({
  id: Proptypes.number.isRequired,
  reference_number: Proptypes.string.isRequired,
  subject: Proptypes.string.isRequired,
  estimated_tat: Proptypes.string.isRequired,
  entity_id: Proptypes.number.isRequired,
  entity_type: Proptypes.string.isRequired,
  created_at: Proptypes.string.isRequired,
  updated_at: Proptypes.string.isRequired,
  status: ticketStatus.isRequired,
  description: Proptypes.string.isRequired,
  creator: creatorProptypes.isRequired,
  source: Proptypes.oneOf(["lead_plus"]).isRequired,
  ticket_category: ticketCategoryProptypes.isRequired,
  comments: Proptypes.arrayOf(commentProptypes).isRequired,
  attachments: fileProptypes.isRequired
});

export const ticketShowModalProptypes = {
  title: Proptypes.string.isRequired,
  open: Proptypes.bool.isRequired,
  filters: ticketFiltersProptypes.filters, // eslint-disable-line
  tickets: Proptypes.arrayOf(ticketCardProptypes).isRequired,
  activeTicket: activeTicketProptypes, // eslint-disable-line
  onAction: Proptypes.func.isRequired,
  error: Proptypes.string.isRequired,
  hasMore: Proptypes.bool.isRequired,
  loadingKey: Proptypes.oneOf([
    "none",
    "title",
    "ticketIndex",
    "attachment",
    "ticketShow"
  ]).isRequired,
  files: Proptypes.arrayOf(
    Proptypes.shape({
      id: Proptypes.string.isRequired,
      name: Proptypes.string.isRequired,
      type: Proptypes.string.isRequired,
      size: Proptypes.string.isRequired,
      file_url: Proptypes.string.isRequired
    })
  ).isRequired,
  assignedMembers: Proptypes.arrayOf(
    Proptypes.shape({
      label: Proptypes.string.isRequired,
      value: Proptypes.string.isRequired,
      termLabel: Proptypes.string.isRequired
    })
  ).isRequired,
  members: memberProptypes.isRequired,
  createTicketButton: Proptypes.elementType
};

export const ticketResolutionProptypes = {
  onAction: onAction.isRequired,
  status: ticketStatus.isRequired,
  className: className.isRequired
};

const categoryProptypes = {
  childs: Proptypes.shape({
    [Proptypes.string]: Proptypes.arrayOf(Proptypes.string)
  }).isRequired,
  list: Proptypes.arrayOf(
    Proptypes.shape({
      slug: Proptypes.string.isRequired,
      name: Proptypes.string.isRequired
    })
  ).isRequired
};

export const createTicketFormProptypes = {
  visible: Proptypes.bool,
  title: Proptypes.string,
  ticketId: Proptypes.string,
  isUploadingFiles: Proptypes.bool,
  associatedDocument: Proptypes.string.isRequired,
  ticketCreationStatus: Proptypes.oneOf(["success", "error", "none"]),
  categories: Proptypes.shape({
    categories: Proptypes.shape(categoryProptypes),
    sub_categories: Proptypes.shape(categoryProptypes),
    sub_sub_categories: Proptypes.shape(categoryProptypes)
  }),
  errors: errorProptypes,
  onAction: Proptypes.func.isRequired,
  files: fileProptypes
};
