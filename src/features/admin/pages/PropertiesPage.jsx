import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Search, ChevronDown, Plus, MoreHorizontal } from "lucide-react";
import useProperties from "../hooks/useProperties";
import PropertyActionsMenu from "../components/PropertyActionsMenu";
import PropertyDetailPage from "../components/PropertyDetailPage";
import AddPropertyPage from "./AddPropertyPage";
import EditPropertyModal from "../components/EditPropertyModal";

const BedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2M2 20h20M7 8v4" />
  </svg>
);

const BathIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    <line x1="10" y1="5" x2="8" y2="7" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const AreaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const PhotoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const DocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function StatusBadge({ status }) {
  const map = {
    Active: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
    Draft: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
    Archived: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
  };

  const style = map[status] ?? map.Draft;

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 99,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function ComplianceBadge({ value }) {
  if (value === "Compliant") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 99,
          background: "#dcfce7",
          color: "#15803d",
          border: "1px solid #bbf7d0",
          whiteSpace: "nowrap",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Compliant
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 99,
        background: "#fef9c3",
        color: "#a16207",
        border: "1px solid #fde68a",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      {value}
    </span>
  );
}


const TABS = ["All", "Draft", "Active", "Archived"];
const columnHelper = createColumnHelper();

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const { data: properties = [], isLoading } = useProperties();

  const [activeTab, setActiveTab] = useState("All");
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [compFilter, setCompFilter] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const tabCounts = useMemo(
    () =>
      TABS.reduce((acc, tab) => {
        acc[tab] =
          tab === "All"
            ? properties.length
            : properties.filter((property) => property.status === tab).length;
        return acc;
      }, {}),
    [properties],
  );

  const typeOptions = useMemo(
    () =>
      Array.from(new Set(properties.map((property) => property.type).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [properties],
  );


  const filteredData = useMemo(() => {
    let data = properties;

    if (activeTab !== "All") {
      data = data.filter((property) => property.status === activeTab);
    }

    if (typeFilter) {
      data = data.filter((property) => property.type === typeFilter);
    }


    if (compFilter === "Compliant") {
      data = data.filter((property) => property.compliance === "Compliant");
    } else if (compFilter === "Issues") {
      data = data.filter((property) => property.compliance !== "Compliant");
    }

    if (globalFilter) {
      const query = globalFilter.toLowerCase();
      data = data.filter(
        (property) =>
          property.title?.toLowerCase().includes(query) ||
          property.location?.toLowerCase().includes(query),
      );
    }

    return data;
  }, [
    properties,
    activeTab,
    typeFilter,
    compFilter,
    globalFilter,
  ]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Property",
        cell: (info) => {
          const property = info.row.original;
          return (
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {property.title}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 11,
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <PinIcon /> {property.location}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("beds", {
        header: "Details",
        cell: (info) => {
          const property = info.row.original;
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
                color: "#475569",
              }}
            >
              {property.beds ? (
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <BedIcon /> {property.beds}
                </span>
              ) : null}
              {property.baths ? (
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <BathIcon /> {property.baths}
                </span>
              ) : null}
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <AreaIcon /> {property.area} sqm
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("media", {
        header: "Media",
        cell: (info) => {
          const media = info.getValue();
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#475569",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <PhotoIcon /> {media?.photos ?? 0}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <DocIcon /> {media?.docs ?? 0}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("compliance", {
        header: "Compliance",
        cell: (info) => <ComplianceBadge value={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProperty(row.original);
            }}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <MoreHorizontal size={16} />
          </button>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (selectedProperty) {
    return (
      <>
        <PropertyDetailPage
          propertyId={selectedProperty.id}
          property={selectedProperty}
          onBack={() => setSelectedProperty(null)}
          onEditProperty={setEditingProperty}
        />
        {editingProperty && (
          <EditPropertyModal
            property={editingProperty}
            onClose={() => setEditingProperty(null)}
          />
        )}
      </>
    );
  }

  if (showAddPage) {
    return <AddPropertyPage onBack={() => setShowAddPage(false)} />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 32 }}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            style={{
              height: 56,
              background: "#f1f5f9",
              borderRadius: 10,
              marginBottom: 10,
            }}
          />
        ))}
      </div>
    );
  }

  const agentsErrorMessage = "";

  return (
    <div
      style={{
        padding: "28px 24px",
        minHeight: "100%",
        background: "#f8fafc",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <div style={{ marginBottom: 20, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
            Properties
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Manage property listings and compliance
          </p>
        </div>
        <button
          onClick={() => setShowAddPage(true)}
          style={{
            display:"flex", alignItems:"center", gap:7,
            padding:"9px 18px", borderRadius:9, border:"1px solid #1e293b",
            background:"#1e293b", color:"#fff", fontSize:13, fontWeight:700,
            cursor:"pointer",
          }}
        >
          <Plus size={15} /> Add Property
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          padding: "14px 16px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search by title or location..."
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              border: "1px solid #e2e8f0",
              borderRadius: 9,
              fontSize: 13,
              color: "#334155",
              outline: "none",
              boxSizing: "border-box",
              background: "#fafafa",
            }}
          />
        </div>

        {[
          {
            value: typeFilter,
            setValue: setTypeFilter,
            label: "Type",
            options: typeOptions,
          },
          {
            value: compFilter,
            setValue: setCompFilter,
            label: "Compliance",
            options: ["Compliant", "Issues"],
          },
        ].map(({ value, setValue, label, options }) => (
          <div key={label} style={{ position: "relative" }}>
            <select
              value={value}
              onChange={(event) => setValue(event.target.value)}
              style={{
                appearance: "none",
                paddingLeft: 12,
                paddingRight: 28,
                paddingTop: 9,
                paddingBottom: 9,
                border: "1px solid #e2e8f0",
                borderRadius: 9,
                fontSize: 13,
                color: value ? "#1e293b" : "#64748b",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
                minWidth: 130,
              }}
            >
              <option value="">{label}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              style={{
                position: "absolute",
                right: 9,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid #f1f5f9",
            gap: 4,
          }}
        >
          {TABS.map((tab) => {
            const count = tabCounts[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: isActive ? "#f1f5f9" : "transparent",
                  color: isActive ? "#0f172a" : "#64748b",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab}
                {count > 0 ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 99,
                      background: isActive ? "#1e293b" : "#e2e8f0",
                      color: isActive ? "#fff" : "#64748b",
                    }}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "48px 0",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  No properties found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedProperty(row.original)}
                  style={{
                    borderBottom:
                      index < table.getRowModel().rows.length - 1
                        ? "1px solid #f8fafc"
                        : "none",
                    background: "#fff",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(event) =>
                    (event.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(event) =>
                    (event.currentTarget.style.background = "#fff")
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ padding: "14px 16px", verticalAlign: "middle" }}
                      onClick={(e) => {
                        if (cell.column.id === "actions") {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Showing <strong style={{ color: "#475569" }}>{filteredData.length}</strong> of{" "}
            <strong style={{ color: "#475569" }}>{properties.length}</strong> properties
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{
                padding: "5px 14px",
                border: "1px solid #e2e8f0",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 500,
                color: "#475569",
                background: "#fff",
                cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
                opacity: table.getCanPreviousPage() ? 1 : 0.4,
              }}
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{
                padding: "5px 14px",
                border: "1px solid #e2e8f0",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                background: "#1e293b",
                cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
                opacity: table.getCanNextPage() ? 1 : 0.4,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
