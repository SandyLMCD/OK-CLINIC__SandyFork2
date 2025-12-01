// src/components/admin/AdminTabs.js
import React from "react";

/* ========== DASHBOARD ========== */

export function DashboardTab({
  totalRevenue,
  pendingRevenue,
  todayAppointments,
  activeUsers,
  totalPets,
  invoices,
  appointments,
  users,
  pets,
  getStatusColor,
  getOwnerName,
}) {
  return (
    <div className="dashboard-space">
      <div>
        <h2 className="dashboard-section-title">Dashboard Overview</h2>
        <p className="dashboard-muted">Quick stats and insights</p>
      </div>

      <div className="dashboard-card-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-muted">Total Revenue</span>
            <span className="dashboard-metric-icon" title="Total Revenue">
              $
            </span>
          </div>
          <div className="dashboard-card-content">
            ${Number(totalRevenue || 0).toFixed(2)}
          </div>
          <div className="dashboard-muted">+12.5% from last month</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-muted">Pending Revenue</span>
            <span className="dashboard-metric-icon" title="Pending Revenue">
              🕒
            </span>
          </div>
          <div className="dashboard-card-content">
            ${Number(pendingRevenue || 0).toFixed(2)}
          </div>
          <div className="dashboard-muted">
            {invoices.filter((i) => i.status !== "paid").length} unpaid invoices
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-muted">Today's Appointments</span>
            <span className="dashboard-metric-icon" title="Today's Appointments">
              📅
            </span>
          </div>
          <div className="dashboard-card-content">
            {todayAppointments || 0}
          </div>
          <div className="dashboard-muted">
            {appointments.filter((a) => a.status === "scheduled").length} scheduled total
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-muted">Active Clients</span>
            <span className="dashboard-metric-icon" title="Active Clients">
              👥
            </span>
          </div>
          <div className="dashboard-card-content">{activeUsers || 0}</div>
          <div className="dashboard-muted">{users.length} total clients</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-muted">Pet Patients</span>
            <span className="dashboard-metric-icon" title="Pet Patients">
              🐾
            </span>
          </div>
          <div className="dashboard-card-content">{totalPets || 0}</div>
          <div className="dashboard-muted">{pets.length} total pets</div>
        </div>
      </div>

      <div className="dashboard-list-grid">
        <div className="dashboard-list-card">
          <div className="dashboard-card-header">
            <div>
              <div className="dashboard-section-title">Recent Appointments</div>
              <div className="dashboard-muted">Latest scheduled appointments</div>
            </div>
          </div>
          <div className="dashboard-list-content">
            {appointments.length === 0 && (
              <div className="dashboard-muted">No recent appointments.</div>
            )}
            <ul className="dashboard-list">
              {appointments.slice(0, 5).map((apt) => (
                <li key={apt.id || apt._id} className="dashboard-list-item">
                  <div>
                    <div>
                      {apt.clientName} - {apt.petName}
                    </div>
                    <div className="dashboard-muted">{apt.service}</div>
                    <div className="dashboard-muted">
                      {apt.date} at {apt.time}
                    </div>
                  </div>
                  <span className={getStatusColor(apt.status)}>
                    {apt.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="dashboard-list-card">
          <div className="dashboard-card-header">
            <div>
              <div className="dashboard-section-title">Recent Pet Visits</div>
              <div className="dashboard-muted">Latest pet patient visits</div>
            </div>
          </div>
          <div className="dashboard-list-content">
            {pets.length === 0 && (
              <div className="dashboard-muted">No pet visits yet.</div>
            )}
            <ul className="dashboard-list">
              {pets.slice(0, 5).map((pet) => (
                <li key={pet._id} className="dashboard-list-item">
                  <div>
                    <div>
                      {pet.name} - {pet.species}
                    </div>
                    <div className="dashboard-muted">
                      Owner: {getOwnerName(pet)}
                    </div>
                  </div>
                  <span className={getStatusColor(pet.status || "active")}>
                    {pet.status || "active"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== APPOINTMENTS ========== */

export function AppointmentsTab({
  appointments,
  services,
  users,
  searchTerm,
  setSearchTerm,
  appointmentFilter,
  setAppointmentFilter,
  getFilteredAppointments,
  updateAppointmentStatus,
  openAppointmentDialog,
  setDeleteItem,
  setDeleteDialogOpen,
}) {
  return (
    <div className="appointments-space">
      <div className="appointments-header-row">
        <div>
          <h2 className="appointments-title">Appointments Management</h2>
          <p className="appointments-muted">
            View and manage all appointments
          </p>
        </div>
        <button
          className="appointments-btn add"
          onClick={() => openAppointmentDialog()}
        >
          <span className="appointments-btn-icon">📅</span>
          New Appointment
        </button>
      </div>

      <div className="appointments-controls">
        <div className="appointments-search-wrap">
          <span className="appointments-search-icon">&#128269;</span>
          <input
            className="appointments-search"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="appointments-filter"
          value={appointmentFilter}
          onChange={(e) => setAppointmentFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
        <button
          className="appointments-btn outline"
          onClick={() => {
            window.alert("TODO: Implement export to CSV");
          }}
        >
          <span className="appointments-btn-icon">⬇️</span>
          Export
        </button>
      </div>

      <div className="appointments-table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Pet</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAppointments().map((apt) => (
              <tr key={apt.id}>
                <td>{apt.clientName}</td>
                <td>{apt.petName}</td>
                <td>{apt.service}</td>
                <td>
                  {apt.date} {apt.time}
                </td>
                <td>${Number(apt.amount || 0).toFixed(2)}</td>
                <td>
                  <select
                    className={`appointments-status-select appointments-status-${apt.status}`}
                    value={apt.status}
                    onChange={(e) =>
                      updateAppointmentStatus(apt.id, e.target.value)
                    }
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <button
                      className="appointments-btn ghost"
                      onClick={() => openAppointmentDialog(apt)}
                      title="Edit"
                    >
                      🖉
                    </button>
                    <button
                      className="appointments-btn ghost"
                      onClick={() => {
                        setDeleteItem({
                          id: apt.id,
                          name: `${apt.clientName} - ${apt.petName}`,
                          type: "appointment",
                        });
                        setDeleteDialogOpen(true);
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {getFilteredAppointments().length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    padding: "1em 0",
                  }}
                >
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== PETS ========== */

export function PetsTab({
  pets,
  getOwnerName,
  getFilteredPets,
  petSearchTerm,
  setPetSearchTerm,
  petFilter,
  setPetFilter,
  openPetDialog,
  handleEditPet,
  requestDeletePet,
  updatePetStatus, // make sure AdminDashboard passes this
}) {
  return (
    <div className="pets-space">
      <div className="pets-header-row">
        <div>
          <h2 className="pets-title">Pet Patients Management</h2>
          <p className="pets-muted">View and manage all pet patients</p>
        </div>
        <button className="pets-btn add" onClick={openPetDialog}>
          <span className="pets-btn-icon" role="img" aria-label="paw">
            &#128062;
          </span>
          Add Pet
        </button>
      </div>

      <div className="pets-controls">
        <div className="pets-search-wrap">
          <span className="pets-search-icon">&#128269;</span>
          <input
            className="pets-search"
            placeholder="Search pets..."
            value={petSearchTerm}
            onChange={(e) => setPetSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="pets-filter"
          value={petFilter}
          onChange={(e) => setPetFilter(e.target.value)}
        >
          <option value="all">All Species</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="rabbit">Rabbit</option>
        </select>
        <button
          className="pets-btn outline"
          onClick={() => window.alert("TODO: Export pets to CSV")}
        >
          <span className="pets-btn-icon">⬇️</span>
          Export
        </button>
      </div>

      <div className="pets-table-wrapper">
        <table className="pets-table">
          <thead>
            <tr>
              <th>Pet Name</th>
              <th>Species</th>
              <th>Breed</th>
              <th>Age</th>
              <th>Weight (lbs)</th>
              <th>Owner</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredPets().map((pet) => (
              <tr key={pet._id}>
                <td>{pet.name}</td>
                <td>{pet.species}</td>
                <td>{pet.breed}</td>
                <td>{pet.age} yrs</td>
                <td>{pet.weight || "-"}</td>
                <td>{getOwnerName(pet)}</td>
                <td>
                  <select
                    className={`pet-status-select pet-status-${pet.status || "active"}`}
                    value={pet.status || "active"}
                    onChange={(e) => updatePetStatus(pet._id, e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <button
                      className="pets-btn ghost"
                      onClick={() => handleEditPet(pet)}
                      title="Edit"
                    >
                      🖉
                    </button>
                    <button
                      className="pets-btn ghost"
                      onClick={() => requestDeletePet(pet)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {getFilteredPets().length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    padding: "1em 0",
                  }}
                >
                  No pets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== CLIENTS ========== */

export function ClientsTab({
  clients,
  clientSearchTerm,
  setClientSearchTerm,
  clientFilter,
  setClientFilter,
  getFilteredClients,
  handleEditClient,
  setClientDialogOpen,
  setClientForm,
  requestDeleteClient,
  updateClientStatus, // AdminDashboard must pass this
}) {
  return (
    <div className="clients-space">
      <div className="clients-header-row">
        <div>
          <h2 className="clients-title">Client Management</h2>
          <p className="clients-muted">View and manage all clients</p>
        </div>
        <button
          className="clients-btn add"
          onClick={() => {
            setClientForm({
              name: "",
              email: "",
              phone: "",
              status: "active",
            });
            setClientDialogOpen(true);
          }}
        >
          <span className="clients-btn-icon" role="img" aria-label="users">
            👥
          </span>
          Add Client
        </button>
      </div>

      <div className="clients-controls">
        <div className="clients-search-wrap">
          <span className="clients-search-icon">&#128269;</span>
          <input
            className="clients-search"
            placeholder="Search clients..."
            value={clientSearchTerm}
            onChange={(e) => setClientSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="clients-filter"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          className="clients-btn outline"
          onClick={() => window.alert("TODO: Export clients to CSV")}
        >
          <span className="clients-btn-icon">⬇️</span>
          Export
        </button>
      </div>

      <div className="clients-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Spent</th>
              <th>Join Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredClients().map((user) => {
              const totalSpent = Number(user.totalSpent || 0);
              const status = user.status || "active";
              return (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>${totalSpent.toFixed(2)}</td>
                  <td>
                    {user.joinDate
                      ? new Date(user.joinDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td>
                    <select
                      className={`client-status-select client-status-${status}`}
                      value={status}
                      onChange={(e) =>
                        updateClientStatus(user._id, e.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <button
                        className="clients-btn ghost"
                        onClick={() => handleEditClient(user)}
                        title="Edit"
                      >
                        🖉
                      </button>
                      <button
                        className="clients-btn ghost"
                        onClick={() => requestDeleteClient(user)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {getFilteredClients().length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    padding: "1em 0",
                  }}
                >
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== INVOICES ========== */

export function InvoicesTab({
  invoices,
  invoiceSearchTerm,
  setInvoiceSearchTerm,
  invoiceFilter,
  setInvoiceFilter,
  getFilteredInvoices,
  handleEditInvoice,
  requestDeleteInvoice,
  updateInvoiceStatus, // AdminDashboard must pass
  setInvoiceDialogOpen,
  setInvoiceForm,
  users,
}) {
  return (
    <div className="invoices-space">
      <div className="invoices-header-row">
        <div>
          <h2 className="invoices-title">Invoice Management</h2>
          <p className="invoices-muted">View and manage all invoices</p>
        </div>
        <button
          className="invoices-btn add"
          onClick={() => {
            setInvoiceForm({
              clientId: "",
              amount: "",
              status: "pending",
              date: "",
              dueDate: "",
            });
            setInvoiceDialogOpen(true);
          }}
        >
          <span className="invoices-btn-icon" role="img" aria-label="file">
            📄
          </span>
          Create Invoice
        </button>
      </div>

      <div className="invoices-controls">
        <div className="invoices-search-wrap">
          <span className="invoices-search-icon">&#128269;</span>
          <input
            className="invoices-search"
            placeholder="Search invoices..."
            value={invoiceSearchTerm}
            onChange={(e) => setInvoiceSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="invoices-filter"
          value={invoiceFilter}
          onChange={(e) => setInvoiceFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <button
          className="invoices-btn outline"
          onClick={() => window.alert("TODO: Export invoices to CSV")}
        >
          <span className="invoices-btn-icon">⬇️</span>
          Export
        </button>
      </div>

      <div className="invoices-table-wrapper">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredInvoices().map((inv) => {
              const amount = Number(inv.total || inv.amount || 0);
              const status = inv.status || "pending";
              const clientName =
                inv.customer?.name || inv.clientName || "Unknown";
              return (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber || inv._id}</td>
                  <td>{clientName}</td>
                  <td>
                    {inv.date ? new Date(inv.date).toLocaleDateString() : ""}
                  </td>
                  <td>
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td>${amount.toFixed(2)}</td>
                  <td>
                    <select
                      className={`invoice-status-select invoice-status-${status}`}
                      value={status}
                      onChange={(e) =>
                        updateInvoiceStatus(inv._id, e.target.value)
                      }
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <button
                        className="invoices-btn ghost"
                        onClick={() => handleEditInvoice(inv)}
                        title="Edit"
                      >
                        🖉
                      </button>
                      <button
                        className="invoices-btn ghost"
                        onClick={() => requestDeleteInvoice(inv)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {getFilteredInvoices().length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    padding: "1em 0",
                  }}
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== SERVICES ========== */

export function ServicesTab({
  services,
  serviceSearchTerm,
  setServiceSearchTerm,
  serviceFilter,
  setServiceFilter,
  getFilteredServices,
  handleEditService,
  requestDeleteService,
  updateServiceStatus, // AdminDashboard must pass
  setServiceDialogOpen,
  setServiceForm,
}) {
  return (
    <div className="services-space">
      <div className="services-header-row">
        <div>
          <h2 className="services-title">Services Management</h2>
          <p className="services-muted">
            Manage available services and pricing
          </p>
        </div>
        <button
          className="services-btn add"
          onClick={() => {
            setServiceForm({
              name: "",
              category: "",
              price: "",
              duration: "",
              status: "active",
            });
            setServiceDialogOpen(true);
          }}
        >
          <span className="services-btn-icon" role="img" aria-label="heart">
            💙
          </span>
          Add Service
        </button>
      </div>

      <div className="services-controls">
        <div className="services-search-wrap">
          <span className="services-search-icon">&#128269;</span>
          <input
            className="services-search"
            placeholder="Search services..."
            value={serviceSearchTerm}
            onChange={(e) => setServiceSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="services-filter"
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="wellness">Wellness</option>
          <option value="dental">Dental</option>
          <option value="grooming">Grooming</option>
          <option value="diagnostic">Diagnostic</option>
          <option value="surgery">Surgery</option>
        </select>
      </div>

      <div className="services-table-wrapper">
        <table className="services-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration (min)</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredServices().map((service) => {
              const price = Number(service.price || 0);
              return (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>
                    {service.category
                      ? service.category.charAt(0).toUpperCase() +
                        service.category.slice(1)
                      : ""}
                  </td>
                  <td>${price.toFixed(2)}</td>
                  <td>{service.duration}</td>
                  <td>
                    <select
                      className={`service-status-select service-status-${service.status}`}
                      value={service.status}
                      onChange={(e) =>
                        updateServiceStatus(service.id, e.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <button
                        className="services-btn ghost"
                        onClick={() => handleEditService(service)}
                        title="Edit"
                      >
                        🖉
                      </button>
                      <button
                        className="services-btn ghost"
                        onClick={() => requestDeleteService(service)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {getFilteredServices().length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    padding: "1em 0",
                  }}
                >
                  No services found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========== FEEDBACK ========== */

export function FeedbackTab({
  feedbacks,
  feedbackSearchTerm,
  setFeedbackSearchTerm,
  feedbackFilter,
  setFeedbackFilter,
  getFilteredFeedbacks,
  requestDeleteFeedback,
}) {
  return (
    <div className="feedback-space">
      <div className="feedback-header-row">
        <div>
          <h2 className="feedback-title">Customer Feedback</h2>
          <p className="feedback-muted">
            View and manage customer feedback and reviews
          </p>
        </div>
      </div>

      <div className="feedback-controls">
        <div className="feedback-search-wrap">
          <span className="feedback-search-icon">&#128269;</span>
          <input
            className="feedback-search"
            placeholder="Search feedback..."
            value={feedbackSearchTerm}
            onChange={(e) => setFeedbackSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="feedback-filter"
          value={feedbackFilter}
          onChange={(e) => setFeedbackFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
        <button
          className="feedback-btn outline"
          onClick={() => window.alert("TODO: Export feedback to CSV")}
        >
          <span className="feedback-btn-icon">⬇️</span>
          Export
        </button>
      </div>

      <div className="feedback-table-wrapper">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Category</th>
              <th>Subject</th>
              <th>Rating</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredFeedbacks().map((feedback) => (
              <tr key={feedback._id}>
                <td>
                  <div>
                    <p>{feedback.userName}</p>
                    <p className="feedback-muted">{feedback.userEmail}</p>
                  </div>
                </td>
                <td style={{ textTransform: "capitalize" }}>
                  {feedback.category?.replace("-", " ")}
                </td>
                <td>{feedback.subject}</td>
                <td>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {Array.from({ length: feedback.rating || 0 }).map((_, i) => (
                      <span key={i} className="star">
                        &#9733;
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {feedback.submittedAt
                    ? new Date(feedback.submittedAt).toLocaleDateString()
                    : ""}
                </td>
                <td style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <button
                      className="feedback-btn ghost"
                      onClick={() =>
                        window.alert(`Message: ${feedback.message}`)
                      }
                      title="View"
                    >
                      View
                    </button>
                    <button
                      className="feedback-btn ghost"
                      onClick={() => requestDeleteFeedback(feedback)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {getFilteredFeedbacks().length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    padding: "1em 0",
                  }}
                >
                  No feedback found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
