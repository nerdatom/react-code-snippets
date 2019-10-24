/* global btoa: true */
/*  eslint react/destructuring-assignment: 0 */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { format } from "date-fns";
import {
  upperCaseFirst,
  sentenceCase,
  titleCase,
  camelCase
} from "change-case";
import { ticketFiltersProptypes } from "../proptypes";
import SelectDropdownComp from "../SelectDropdown";
import PillComp from "../Pill";
import ReactSelect from "../ReactSelect";
import TextInput from "../TextInput";
import Link from "../Link";
import "react-day-picker/lib/style.css";
import "./datepicker.custom.css";
import { useLog } from "../hooks";

export { TextInput };

export const ClearFiltersLink = styled(Link)`
  display: ${props => (props.visible ? "inline-block" : "none")};
  margin-left: 4px;
`;
export const FilterWrap = styled.div`
  display: flex;
  align-items: center;
  > .DayPickerInput {
    flex: 0 1 200px;
  }
`;
export const Pill = styled(PillComp)`
  margin-right: 8px;
`;
export const StyledTextInput = styled(TextInput)`
  width: 200px;
`;
export const InputText = styled(TextInput)`
  flex: 0 1 300px;
  margin: 0 8px;
`;
export const PillWrap = styled.div`
  margin: 16px 8px;
  height: 24px;
`;
export const SelectDropdown = styled(SelectDropdownComp)`
  margin: 0 8px;
  flex: 0 1 200px;
`;
export const Container = styled.div`
  flex: 0 0 auto;
  padding-top: 16px;
  border-top: 2px solid #e2e7f4;
`;
export const Select = styled(ReactSelect)`
  margin: 0 8px;
  flex: 0 1 200px;
`;

const statusOptions = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Cancelled", value: "cancelled" }
];

const TicketFilters = ({ className, onAction, members, filters }) => {
  const props = useDerivedFiltersFromProps(filters);
  const [status, setStatus] = useState(props.status);
  const [search, setSearch] = useState(props.search); // eslint-disable-line
  const [createdAt, setCreatedAt] = useState(props.createdAt);
  const [assigneeId, setAssigneeId] = useState(props.assigneeId);
  const log = useLog();
  const removeFilter = type => {
    const payload = filters.find(f => f.type === type) || {};
    onAction("removeFilter", payload);
  };

  const useDerivedFilter = key => {
    const hasFilter = type => filters.findIndex(f => f.type === type) !== -1;
    const useFilter = type => filters.find(f => f.type === type);
    return hasFilter(key) ? useFilter(key) : "";
  };

  useEffect(() => {
    setStatus(useDerivedFilter("status"));
    setSearch(useDerivedFilter("search"));
    setCreatedAt(useDerivedFilter("created_at"));
    setAssigneeId(useDerivedFilter("assignee_id"));
  }, [filters]);

  const onFilterChange = (type, payload) => {
    log({ type: "action", title: `Filter Changed: ${type}`, payload });
    switch (type) {
      case "search": {
        if (!payload) {
          removeFilter(type);
          break;
        }
        const computedFilters = useComputedFilters({
          filters,
          payload: {
            ...payload,
            type,
            label: payload.value,
            displayValue: payload.value
          }
        });
        onAction(`filter${upperCaseFirst(camelCase(type))}`, computedFilters);
        break;
      }
      case "status": {
        if (!payload) {
          removeFilter(type);
          break;
        }
        const displayValue = `${titleCase(sentenceCase(payload.value))}`;
        const label = `${titleCase(sentenceCase(payload.value))}`;
        const computedFilters = useComputedFilters({
          filters,
          payload: { ...payload, type, label, displayValue }
        });
        onAction(`filter${upperCaseFirst(camelCase(type))}`, computedFilters);
        break;
      }
      case "assignee_id": {
        if (!payload) {
          removeFilter(type);
          break;
        }
        const displayValue = `${titleCase(sentenceCase(payload.value))}`;
        const label = `${titleCase(sentenceCase(payload.value))}`;
        const computedFilters = useComputedFilters({
          filters,
          payload: {
            ...payload,
            type,
            label,
            displayValue,
            value: payload.id
          }
        });
        onAction(`filter${upperCaseFirst(camelCase(type))}`, computedFilters);
        break;
      }
      case "onPillClose": {
        removeFilter(payload.filterType);
        break;
      }
      case "created_at": {
        let { value } = payload;
        let displayDate = value;

        // if (value && !Array.isArray(value)) {
        value = {
          start_date: format(value, "YYYY-MM-DD"),
          end_date: format(value, "YYYY-MM-DD")
        };
        displayDate = value && value.start_date;
        // }

        const computedFilters = useComputedFilters({
          filters,
          payload: {
            value,
            type: "created_at",
            label: displayDate,
            displayValue: `Created on ${format(displayDate, "YYYY/MM/DD")}`
          }
        });

        onAction("filterCreatedAt", computedFilters);
        break;
      }
      default:
        log({ title: type, type: "implement", payload });
        break;
    }
  };

  return (
    <Container className={className}>
      <FilterWrap>
        <InputText
          id="searchFilter"
          defaultValue=""
          value={search && search.value}
          placeholder="Ticket No / Entity Id / Category"
          onChange={({ target: { value } }) =>
            onFilterChange("search", { value })
          }
          rightIcon="search"
        />

        <Select
          value={status}
          isClearable
          id="statusFilter"
          placeholder="Status"
          options={statusOptions}
          onChange={target => onFilterChange("status", target)}
        />
        <Select
          value={assigneeId}
          isClearable
          placeholder="Assignee"
          options={members}
          onChange={target => onFilterChange("assignee_id", target)}
        />
        <DayPickerInput
          onDayChange={value => onFilterChange("created_at", { value })}
          value={createdAt && createdAt.value && createdAt.value.start_date}
          component={renderProps => (
            <StyledTextInput
              id="datePicker"
              {...renderProps}
              value={createdAt && createdAt.value && createdAt.value.start_date}
              autoComplete="off"
              rightIcon="date_range"
              placeholder="Created on"
            />
          )}
        />
      </FilterWrap>
      <PillWrap>
        {filters.map(filter => (
          <Pill
            key={btoa(filter.displayValue)}
            onAction={(action, payload) =>
              onFilterChange(action, { ...payload, filterType: filter.type })
            }
            text={filter.displayValue}
          />
        ))}
        <ClearFiltersLink
          visible={filters.length >= 2}
          onClick={() => onAction("clearFilters")}
        >
          Clear Filters
        </ClearFiltersLink>
      </PillWrap>
    </Container>
  );
};

const useDerivedFiltersFromProps = (filters = []) => {
  const hasFilter = type => filters.findIndex(f => f.type === type) !== -1;
  const useFilter = type => filters.find(f => f.type === type);
  const search = hasFilter("search") ? useFilter("search") : null;
  const createdAt = hasFilter("created_at")
    ? useFilter("created_at").start_date
    : null;
  const assignee = hasFilter("assignee") ? useFilter("assignee") : null;
  const status = hasFilter("status") ? useFilter("status") : null;

  return {
    search,
    createdAt,
    assignee,
    status
  };
};

const useComputedFilters = ({
  payload: { type, value, label, displayValue },
  filters: filterParams
}) => {
  const filters = [...filterParams];
  const filterIndex = filters.findIndex(f => f.type === type);
  const hasFilter = filterIndex !== -1;
  // const value = (newValue && newValue.start_date && newValue.start_date.split('-').join('/')) || newValue; // TODO: find better way to handle created_at value
  if (!hasFilter) {
    const newFilter = { type, value, label, displayValue };
    return [...filters, newFilter];
  }
  /**
   * Remove filter if value is invalid
   */
  const isInvalidValue = ["", null, undefined].includes(value);
  if (isInvalidValue) {
    return filters.filter(f => f.type !== type);
  }

  filters[filterIndex] = {
    type,
    label,
    value,
    displayValue
  };

  return filters;
};

TicketFilters.defaultProps = {
  className: "",
  filters: []
};

TicketFilters.propTypes = ticketFiltersProptypes;

export default TicketFilters;
