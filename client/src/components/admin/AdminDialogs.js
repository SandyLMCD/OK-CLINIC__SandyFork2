// src/components/admin/AdminDialogs.js
import React from "react";

/* ========== APPOINTMENT DIALOG ========== */

export function AppointmentDialog({
  open,
  setOpen,
  appointmentForm,
  setAppointmentForm,
  editingAppointment,
  services,
  appointments,
  getActiveClients,
  getClientPets,
  handleServiceToggle,
  onSubmit,
}) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog-content">
        <form onSubmit={onSubmit}>
          <div className="dialog-header">
            <h3>
              {editingAppointment ? "Edit Appointment" : "New Appointment"}
            </h3>
            <p>
              {editingAppointment
                ? "Update appointment details below"
                : "Create a new appointment for a client"}
            </p>
          </div>

          <div className="dialog-body">
            {/* Client */}
            <div className="dialog-field">
              <label>Select Client</label>
              <select
                value={appointmentForm.clientId}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    clientId: e.target.value,
                    petId: "",
                  })
                }
              >
                <option value="">Choose a client</option>
                {getActiveClients().map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} - {c.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Pet */}
            {appointmentForm.clientId && (
              <div className="dialog-field">
                <label>Select Pet</label>
                <select
                  value={appointmentForm.petId}
                  onChange={(e) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      petId: e.target.value,
                    })
                  }
                >
                  <option value="">Choose a pet</option>
                  {getClientPets(appointmentForm.clientId).map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.name} - {pet.species} ({pet.breed})
                    </option>
                  ))}
                </select>
                {getClientPets(appointmentForm.clientId).length === 0 && (
                  <p className="appointments-muted">
                    No pets registered for this client
                  </p>
                )}
              </div>
            )}

            {/* Services */}
            <div className="dialog-field">
              <label>Services</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {services.map((service) => (
                  <label key={service.id} style={{ fontWeight: "normal" }}>
                    <input
                      type="checkbox"
                      checked={appointmentForm.selectedServiceIds?.includes(
                        service.id
                      )}
                      onChange={() => handleServiceToggle(service.id)}
                      style={{
                        marginRight: "6px",
                        verticalAlign: "middle",
                      }}
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="dialog-row">
              <div className="dialog-field">
                <label>Date</label>
                <input
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="dialog-field">
                <label>Time</label>
                <input
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Availability hint */}
            {appointmentForm.date &&
              appointmentForm.time &&
              (() => {
                const isSlotTaken = appointments.some(
                  (apt) =>
                    apt.date === appointmentForm.date &&
                    apt.time === appointmentForm.time &&
                    apt.status !== "cancelled" &&
                    apt.status !== "no-show" &&
                    (!editingAppointment || apt.id !== editingAppointment.id)
                );
                const appointmentsOnDate = appointments.filter(
                  (apt) =>
                    apt.date === appointmentForm.date &&
                    apt.status !== "cancelled" &&
                    apt.status !== "no-show"
                ).length;
                return (
                  <div className="dialog-avail">
                    {isSlotTaken ? (
                      <div className="dialog-avail-blocked">
                        <span className="dialog-dot blocked"></span>
                        This time slot is already booked
                      </div>
                    ) : (
                      <div className="dialog-avail-open">
                        <span className="dialog-dot open"></span>
                        This time slot is available
                      </div>
                    )}
                    <div
                      className="appointments-muted"
                      style={{ fontSize: 13 }}
                    >
                      {appointmentsOnDate} appointment(s) scheduled for this
                      date
                    </div>
                  </div>
                );
              })()}

            {/* Amount & Status */}
            <div className="dialog-field">
              <label>Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={appointmentForm.amount}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    amount: e.target.value,
                  })
                }
              />
            </div>
            <div className="dialog-field">
              <label>Status</label>
              <select
                value={appointmentForm.status}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    status: e.target.value,
                  })
                }
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="appointments-btn outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="appointments-btn add">
              {editingAppointment ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== PET DIALOG ========== */

export function PetDialog({
  open,
  setOpen,
  petForm,
  setPetForm,
  editingPet,
  users,
  onSubmit,
}) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog-content">
        <form onSubmit={onSubmit}>
          <div className="dialog-header">
            <h3>{editingPet ? "Edit Pet" : "Add Pet"}</h3>
            <p>
              {editingPet
                ? "Update pet details below"
                : "Register a new pet patient"}
            </p>
          </div>

          <div className="dialog-body">
            <div className="dialog-field">
              <label>Pet Name*</label>
              <input
                value={petForm.name}
                onChange={(e) =>
                  setPetForm({ ...petForm, name: e.target.value })
                }
                required
              />
            </div>

            <div className="dialog-field">
              <label>Species*</label>
              <select
                value={petForm.species}
                onChange={(e) =>
                  setPetForm({ ...petForm, species: e.target.value })
                }
                required
              >
                <option value="">Select species</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
              </select>
            </div>

            <div className="dialog-field">
              <label>Breed</label>
              <input
                value={petForm.breed}
                onChange={(e) =>
                  setPetForm({ ...petForm, breed: e.target.value })
                }
              />
            </div>

            <div className="dialog-row">
              <div className="dialog-field">
                <label>Age</label>
                <input
                  type="number"
                  min="0"
                  value={petForm.age}
                  onChange={(e) =>
                    setPetForm({ ...petForm, age: e.target.value })
                  }
                />
              </div>
              <div className="dialog-field">
                <label>Weight (lbs)</label>
                <input
                  type="number"
                  min="0"
                  value={petForm.weight || ""}
                  onChange={(e) =>
                    setPetForm({ ...petForm, weight: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="dialog-field">
              <label>Owner*</label>
              <select
                value={petForm.ownerId}
                onChange={(e) =>
                  setPetForm({ ...petForm, ownerId: e.target.value })
                }
                required
              >
                <option value="">Select owner</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} - {u.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="dialog-field">
              <label>Medical Notes</label>
              <textarea
                value={petForm.medicalNotes || ""}
                onChange={(e) =>
                  setPetForm({ ...petForm, medicalNotes: e.target.value })
                }
              ></textarea>
            </div>

            <div className="dialog-field">
              <label>Status</label>
              <select
                value={petForm.status || "active"}
                onChange={(e) =>
                  setPetForm({ ...petForm, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="pets-btn outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="pets-btn add">
              {editingPet ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== CLIENT DIALOG ========== */

export function ClientDialog({
  open,
  setOpen,
  clientForm,
  setClientForm,
  editingClient,
  onSubmit,
}) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog-content">
        <form onSubmit={onSubmit}>
          <div className="dialog-header">
            <h3>{editingClient ? "Edit Client" : "Add Client"}</h3>
            <p>
              {editingClient
                ? "Update client details below"
                : "Register a new client"}
            </p>
          </div>

          <div className="dialog-body">
            <div className="dialog-field">
              <label>Name*</label>
              <input
                value={clientForm.name}
                onChange={(e) =>
                  setClientForm({ ...clientForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="dialog-field">
              <label>Email*</label>
              <input
                type="email"
                value={clientForm.email}
                onChange={(e) =>
                  setClientForm({ ...clientForm, email: e.target.value })
                }
                required
              />
            </div>
            <div className="dialog-field">
              <label>Phone*</label>
              <input
                value={clientForm.phone}
                onChange={(e) =>
                  setClientForm({ ...clientForm, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="dialog-field">
              <label>Status</label>
              <select
                value={clientForm.status || "active"}
                onChange={(e) =>
                  setClientForm({ ...clientForm, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="clients-btn outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="clients-btn add">
              {editingClient ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== INVOICE DIALOG ========== */

export function InvoiceDialog({
  open,
  setOpen,
  invoiceForm,
  setInvoiceForm,
  editingInvoice,
  users,
  onSubmit,
}) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog-content">
        <form onSubmit={onSubmit}>
          <div className="dialog-header">
            <h3>{editingInvoice ? "Edit Invoice" : "Create Invoice"}</h3>
            <p>
              {editingInvoice
                ? "Update invoice details below"
                : "Create a new client invoice"}
            </p>
          </div>

          <div className="dialog-body">
            <div className="dialog-field">
              <label>Client*</label>
              <select
                value={invoiceForm.clientId}
                onChange={(e) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    clientId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select client</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} - {u.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="dialog-row">
              <div className="dialog-field">
                <label>Amount*</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceForm.total}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      total: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="dialog-field">
                <label>Date*</label>
                <input
                  type="date"
                  value={invoiceForm.date || ""}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="dialog-field">
                <label>Due Date*</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate || ""}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      dueDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="dialog-field">
              <label>Status</label>
              <select
                value={invoiceForm.status}
                onChange={(e) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    status: e.target.value,
                  })
                }
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="invoices-btn outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="invoices-btn add">
              {editingInvoice ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== SERVICE DIALOG ========== */

export function ServiceDialog({
  open,
  setOpen,
  serviceForm,
  setServiceForm,
  editingService,
  onSubmit,
}) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog-content">
        <form onSubmit={onSubmit}>
          <div className="dialog-header">
            <h3>{editingService ? "Edit Service" : "Add Service"}</h3>
            <p>
              {editingService
                ? "Update service details below"
                : "Register a new service"}
            </p>
          </div>

          <div className="dialog-body">
            <div className="dialog-field">
              <label>Service Name*</label>
              <input
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="dialog-field">
              <label>Category*</label>
              <select
                value={serviceForm.category}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    category: e.target.value,
                  })
                }
                required
              >
                <option value="">Select category</option>
                <option value="wellness">Wellness</option>
                <option value="dental">Dental</option>
                <option value="grooming">Grooming</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="surgery">Surgery</option>
              </select>
            </div>
            <div className="dialog-row">
              <div className="dialog-field">
                <label>Price*</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={serviceForm.price}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      price: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="dialog-field">
                <label>Duration (min)*</label>
                <input
                  type="number"
                  min="0"
                  value={serviceForm.duration}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      duration: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="dialog-field">
              <label>Status</label>
              <select
                value={serviceForm.status}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    status: e.target.value,
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="services-btn outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="services-btn add">
              {editingService ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== DELETE DIALOG ========== */

export function DeleteDialog({ open, item, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog-content">
        <div className="dialog-header">
          <h3>Confirm Deletion</h3>
          <p>
            Are you sure you want to delete{" "}
            <span className="dialog-item-name">{item?.name}</span>? This action
            cannot be undone.
          </p>
        </div>
        <div className="dialog-footer">
          <button
            type="button"
            className="appointments-btn outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="appointments-btn destructive"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
