import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { FiSearch } from 'react-icons/fi';

const Registrations = () => {
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    API.get(`/admin/events/registrations?filter=${filter}`)
      .then((res) => {
        setAllRegistrations(res.data);
        setFilteredRegistrations(res.data);
      })
      .catch((err) => alert("Failed to load registrations"))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    let result = allRegistrations;
    if (searchTerm) {
      result = allRegistrations.filter(
        (reg) =>
          reg.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredRegistrations(result);
    setCurrentPage(1);
  }, [searchTerm, allRegistrations]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRegistrations = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  return (
    <div className="neu-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Event Registrations</h1>
        <p style={{ color: 'var(--neu-text-secondary)', marginTop: '0.5rem' }}>Manage all student registrations</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className={`neu-button small ${filter === "all" ? "primary" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Events
        </button>
        <button
          className={`neu-button small ${filter === "paid" ? "primary" : ""}`}
          onClick={() => setFilter("paid")}
        >
          Paid Events
        </button>
        <button
          className={`neu-button small ${filter === "free" ? "primary" : ""}`}
          onClick={() => setFilter("free")}
        >
          Free Events
        </button>

        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neu-text-secondary)' }} />
          <input
            type="text"
            className="neu-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="neu-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--neu-text-secondary)' }}>Loading registrations...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="neu-card">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>No registrations found</p>
            <p style={{ color: 'var(--neu-text-secondary)' }}>Check back later as students register for events</p>
          </div>
        </div>
      ) : (
        <>
          <div className="neu-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {currentRegistrations.map((reg, idx) => (
                  <tr key={reg.student._id + reg.event._id + idx}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{reg.student.name}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{reg.student.email}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{reg.student.department || "—"}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{reg.student.year || "—"}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="neu-badge info">{reg.event.title}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="neu-button small"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={{ color: 'var(--neu-text-secondary)', fontSize: '0.9rem' }}>
                Page {currentPage} of {totalPages} ({filteredRegistrations.length} total)
              </span>
              <button
                className="neu-button small"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Registrations;