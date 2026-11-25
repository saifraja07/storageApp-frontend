import { memo } from "react";
import ReloadButton from "../../ReloadButton";
import SearchInput from "../../SearchInput";

const PlansSearchBar = memo(function PlansSearchBar({
  searchQ,
  setSearchQ,
  filteredCount,
  totalCount,
  onRefresh,
  refreshing,
  loading,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
        flexWrap: "wrap",
        minWidth: 0,
      }}
    >
      <SearchInput
        value={searchQ}
        onChange={setSearchQ}
        placeholder="Search by name or email…"
        ariaLabel="Search premium users by name or email"
      />
      <div
        style={{
          fontSize: 12,
          color: "var(--muted)",
          whiteSpace: "nowrap",
          marginLeft: "auto",
          flexShrink: 0,
        }}
      >
        {filteredCount} of {totalCount} premium users
      </div>
      <ReloadButton
        onClick={onRefresh}
        loading={refreshing}
        disabled={loading}
        label="Refresh plan data"
      />
    </div>
  );
});

export default PlansSearchBar;
