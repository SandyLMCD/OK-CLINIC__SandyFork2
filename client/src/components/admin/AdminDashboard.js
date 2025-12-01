// src/components/admin/AdminDashboard.js
import React, { useEffect, useState } from "react";
import {
  DashboardTab,
  AppointmentsTab,
  PetsTab,
  ClientsTab,
  InvoicesTab,
  ServicesTab,
  FeedbackTab,
} from "./AdminTabs";
import {
  AppointmentDialog,
  PetDialog,
  ClientDialog,
  InvoiceDialog,
  ServiceDialog,
  DeleteDialog,
} from "./AdminDialogs";

export function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  // core collections from DB
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // local-only collections
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);

  // metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalPets, setTotalPets] = useState(0);

  // global delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Appointments UI/filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    clientId: "",
    petId: "",
    service: "",
    serviceIds: [],
    selectedServiceIds: [],
    date: "",
    time: "",
    amount: "",
    status: "scheduled",
  });

  // Pets
  const [petSearchTerm, setPetSearchTerm] = useState("");
  const [petFilter, setPetFilter] = useState("all");
  const [petDialogOpen, setPetDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petForm, setPetForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    ownerId: "",
  });

  // Clients
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
  });
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");

  // Invoices
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    status: "pending",
    total: "",
    paymentMethod: "",
    paidDate: "",
  });
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("all");

  // Services (front-end only)
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "",
    price: "",
    duration: "",
    status: "active",
  });
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Feedback
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("all");

  /* ===== API helper ===== */

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: user?.token ? `Bearer ${user.token}` : undefined,
      },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  };

  /* ===== load initial data ===== */

 // load initial data
useEffect(() => {
  if (!user?.token) return;

  (async () => {
    try {
      const [
        usersData,
        petsData,
        invoicesData,
        feedbacksData,
        servicesData,
      ] = await Promise.all([
        apiFetch("http://localhost:5000/api/admin/users"),
        apiFetch("http://localhost:5000/api/admin/pets"),
        apiFetch("http://localhost:5000/api/admin/invoices"),
        apiFetch("http://localhost:5000/api/admin/feedbacks"),
        apiFetch("http://localhost:5000/api/admin/services"),
      ]);

      setUsers(usersData);
      setPets(petsData);
      setInvoices(invoicesData);
      setFeedbacks(feedbacksData);
      setServices(servicesData);

      setTotalPets(petsData.length);
      setActiveUsers(usersData.length);
      setPendingRevenue(
        invoicesData
          .filter((inv) => inv.status !== "paid")
          .reduce((sum, inv) => sum + (inv.total || 0), 0)
      );
      setTotalRevenue(
        invoicesData
          .filter((inv) => inv.status === "paid")
          .reduce((sum, inv) => sum + (inv.total || 0), 0)
      );
    } catch (err) {
      console.error("Admin data load error:", err);
      alert(`Failed to load admin data: ${err.message || "Unknown error"}`);
    }
  })();
}, [user]);


  /* ===== COMMON HELPERS ===== */

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "dashboard-badge-paid";
      case "scheduled":
      case "active":
      case "new":
        return "dashboard-badge-active";
      case "pending":
        return "dashboard-badge-pending";
      case "cancelled":
      case "inactive":
        return "dashboard-badge-inactive";
      default:
        return "dashboard-badge-unknown";
    }
  };

  const getOwnerName = (pet) => pet?.owner?.name || "";
  const getActiveClients = () => users;

  /* ===== APPOINTMENTS (front-end only) ===== */

  const calculateTotalAmount = (serviceIds) =>
    serviceIds
      .map((id) => {
        const s = services.find((x) => x.id === id);
        return s ? Number(s.price || 0) : 0;
      })
      .reduce((sum, n) => sum + n, 0);

  const handleServiceToggle = (serviceId) => {
    const current = appointmentForm.selectedServiceIds || [];
    const updated = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId];

    const totalAmount = calculateTotalAmount(updated);
    const serviceNames = updated
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    setAppointmentForm({
      ...appointmentForm,
      selectedServiceIds: updated,
      serviceIds: updated,
      service: serviceNames,
      amount: totalAmount.toString(),
    });
  };

  const openAppointmentDialog = (appointment = null) => {
    setEditingAppointment(appointment);
    if (appointment) {
      setAppointmentForm({
        ...appointment,
        amount: appointment.amount.toString(),
        selectedServiceIds: appointment.serviceIds || [],
      });
    } else {
      setAppointmentForm({
        clientId: "",
        clientName: "",
        petId: "",
        petName: "",
        service: "",
        serviceIds: [],
        date: "",
        time: "",
        status: "scheduled",
        amount: "",
      });
    }
    setAppointmentDialogOpen(true);
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    if (
      !appointmentForm.clientId ||
      !appointmentForm.petId ||
      !appointmentForm.date ||
      !appointmentForm.time
    ) {
      alert("Please fill out all fields.");
      return;
    }
    const client =
      users.find((u) => u._id === appointmentForm.clientId) || {};
    const pet = pets.find((p) => p._id === appointmentForm.petId) || {};
    const newAppointment = {
      id: editingAppointment ? editingAppointment.id : Date.now().toString(),
      clientId: appointmentForm.clientId,
      clientName: client.name || "",
      petId: appointmentForm.petId,
      petName: pet.name || "",
      service: appointmentForm.service,
      serviceIds: Array.isArray(appointmentForm.serviceIds)
        ? appointmentForm.serviceIds
        : [],
      date: appointmentForm.date,
      time: appointmentForm.time,
      status: appointmentForm.status,
      amount: parseFloat(appointmentForm.amount) || 0,
    };
    if (editingAppointment) {
      setAppointments((old) =>
        old.map((apt) =>
          apt.id === editingAppointment.id ? newAppointment : apt
        )
      );
    } else {
      setAppointments((old) => [...old, newAppointment]);
    }
    setAppointmentDialogOpen(false);
    setEditingAppointment(null);
  };

  const getFilteredAppointments = () =>
    appointments.filter((apt) => {
      const statusMatch =
        appointmentFilter === "all" || apt.status === appointmentFilter;
      const searchMatch =
        searchTerm === "" ||
        [apt.clientName, apt.petName, apt.service, apt.date]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });

  const updateAppointmentStatus = (id, status) => {
    setAppointments((apps) =>
      apps.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  /* ===== PETS ===== */

  const getFilteredPets = () =>
    pets.filter((pet) => {
      const filterMatch =
        petFilter === "all" ||
        (pet.species || "").toLowerCase() === petFilter;
      const ownerName = getOwnerName(pet);
      const searchMatch =
        petSearchTerm === "" ||
        [pet.name, pet.breed, pet.species, ownerName]
          .join(" ")
          .toLowerCase()
          .includes(petSearchTerm.toLowerCase());
      return filterMatch && searchMatch;
    });

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setPetForm({
      name: pet.name || "",
      species: pet.species || "",
      breed: pet.breed || "",
      age: pet.age || "",
      ownerId: pet.owner?._id || "",
    });
    setPetDialogOpen(true);
  };


  const handleEditService = (service) => {
  setEditingService(service);
  setServiceForm({
    name: service.name,
    category: service.category,
    price: service.price.toString(),
    duration: service.duration,
    status: service.status || "active",
  });
  setServiceDialogOpen(true);
};


  const openPetDialog = () => {
    setEditingPet(null);
    setPetForm({
      name: "",
      species: "",
      breed: "",
      age: "",
      ownerId: "",
    });
    setPetDialogOpen(true);
  };

  const handlePetFormSubmit = async (e) => {
    e.preventDefault();
    if (!petForm.name || !petForm.species) {
      alert("Please fill out required fields.");
      return;
    }

    const payload = {
      name: petForm.name,
      species: petForm.species,
      breed: petForm.breed,
      age: petForm.age,
    };

    try {
      if (editingPet) {
        const updated = await apiFetch(
          `http://localhost:5000/api/admin/pets/${editingPet._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        setPets((current) =>
          current.map((p) => (p._id === editingPet._id ? updated : p))
        );
      } else {
        alert("No POST /api/admin/pets route defined yet.");
      }
      setPetDialogOpen(false);
      setEditingPet(null);
    } catch (err) {
      console.error(err);
      alert("Error saving pet");
    }
  };

  const requestDeletePet = (pet) => {
    setDeleteItem({ id: pet._id, name: pet.name, type: "pet" });
    setDeleteDialogOpen(true);
  };

  const deletePet = async (id) => {
    await apiFetch(`http://localhost:5000/api/admin/pets/${id}`, {
      method: "DELETE",
    });
    setPets((current) => current.filter((p) => p._id !== id));
  };

  const updatePetStatus = (id, status) => {
    setPets((current) =>
      current.map((p) => (p._id === id ? { ...p, status } : p))
    );
  };

  /* ===== CLIENTS ===== */

  const getFilteredClients = () =>
    users.filter((u) => {
      const statusMatch =
        clientFilter === "all" || u.role === clientFilter;
      const searchMatch =
        clientSearchTerm === "" ||
        [u.name, u.email, u.phone, u.address]
          .join(" ")
          .toLowerCase()
          .includes(clientSearchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });

  const handleEditClient = (u) => {
    setEditingClient(u);
    setClientForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      address: u.address || "",
      role: u.role || "customer",
    });
    setClientDialogOpen(true);
  };

  const handleClientFormSubmit = async (e) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.email) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      if (editingClient) {
        const updated = await apiFetch(
          `http://localhost:5000/api/admin/users/${editingClient._id}`,
          {
            method: "PUT",
            body: JSON.stringify(clientForm),
          }
        );
        setUsers((current) =>
          current.map((u) => (u._id === editingClient._id ? updated : u))
        );
      } else {
        alert("No POST /api/admin/users route defined yet.");
      }
      setEditingClient(null);
      setClientDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving user");
    }
  };

  const requestDeleteClient = (u) => {
    setDeleteItem({ id: u._id, name: u.name, type: "client" });
    setDeleteDialogOpen(true);
  };

  const deleteClient = async (id) => {
    await apiFetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: "DELETE",
    });
    setUsers((current) => current.filter((u) => u._id !== id));
  };

  const updateClientStatus = (id, status) => {
    setUsers((current) =>
      current.map((u) => (u._id === id ? { ...u, status } : u))
    );
  };

  /* ===== INVOICES ===== */

  const getFilteredInvoices = () =>
    invoices.filter((inv) => {
      const statusMatch =
        invoiceFilter === "all" || inv.status === invoiceFilter;
      const customerName =
        inv.customer && inv.customer.name ? inv.customer.name : "";
      const searchMatch =
        invoiceSearchTerm === "" ||
        [inv.invoiceNumber, customerName]
          .join(" ")
          .toLowerCase()
          .includes(invoiceSearchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });

  const handleEditInvoice = (inv) => {
    setEditingInvoice(inv);
    setInvoiceForm({
      status: inv.status || "pending",
      total: inv.total || "",
      paymentMethod: inv.paymentMethod || "",
      paidDate: inv.paidDate ? inv.paidDate.slice(0, 10) : "",
    });
    setInvoiceDialogOpen(true);
  };

  const handleInvoiceFormSubmit = async (e) => {
    e.preventDefault();
    if (invoiceForm.total === "") {
      alert("Please fill out required fields.");
      return;
    }
    const payload = {
      status: invoiceForm.status,
      total: Number(invoiceForm.total),
      paymentMethod: invoiceForm.paymentMethod,
      paidDate: invoiceForm.paidDate || null,
    };

    try {
      if (editingInvoice) {
        const updated = await apiFetch(
          `http://localhost:5000/api/admin/invoices/${editingInvoice._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        setInvoices((current) =>
          current.map((inv) =>
            inv._id === editingInvoice._id ? updated : inv
          )
        );
      } else {
        alert("No POST /api/admin/invoices route defined yet.");
      }
      setEditingInvoice(null);
      setInvoiceDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    }
  };

  const requestDeleteInvoice = (inv) => {
    setDeleteItem({
      id: inv._id,
      name: inv.invoiceNumber || inv._id,
      type: "invoice",
    });
    setDeleteDialogOpen(true);
  };

  const deleteInvoice = async (id) => {
    await apiFetch(`http://localhost:5000/api/admin/invoices/${id}`, {
      method: "DELETE",
    });
    setInvoices((current) => current.filter((inv) => inv._id !== id));
  };

  const updateInvoiceStatus = (id, status) => {
    setInvoices((current) =>
      current.map((inv) => (inv._id === id ? { ...inv, status } : inv))
    );
  };

  /* ===== SERVICES – front-end only ===== */

  const getFilteredServices = () =>
    services.filter((service) => {
      const filterMatch =
        serviceFilter === "all" || service.category === serviceFilter;
      const searchMatch =
        serviceSearchTerm === "" ||
        [service.name, service.category]
          .join(" ")
          .toLowerCase()
          .includes(serviceSearchTerm.toLowerCase());
      return filterMatch && searchMatch;
    });

  // create or update service
const handleServiceFormSubmit = async (e) => {
  e.preventDefault();
  if (
    !serviceForm.name ||
    !serviceForm.category ||
    !serviceForm.price ||
    !serviceForm.duration
  ) {
    alert("Please fill out all fields.");
    return;
  }

  const payload = {
    name: serviceForm.name,
    category: serviceForm.category,
    price: Number(serviceForm.price),
    duration: Number(serviceForm.duration),
    status: serviceForm.status || "active",
  };

  try {
    if (editingService && editingService._id) {
      // UPDATE
      const updated = await apiFetch(
        `http://localhost:5000/api/admin/services/${editingService._id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      setServices((current) =>
        current.map((s) => (s._id === editingService._id ? updated : s))
      );
    } else {
      // CREATE
      const created = await apiFetch(
        "http://localhost:5000/api/admin/services",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      setServices((current) => [...current, created]);
    }

    setEditingService(null);
    setServiceDialogOpen(false);
    setServiceForm({
      name: "",
      category: "",
      price: "",
      duration: "",
      status: "active",
    });
  } catch (err) {
    console.error(err);
    alert("Error saving service");
  }
};

const requestDeleteService = (service) => {
  setDeleteItem({ id: service._id, name: service.name, type: "service" });
  setDeleteDialogOpen(true);
};

const deleteService = async (id) => {
  await apiFetch(`http://localhost:5000/api/admin/services/${id}`, {
    method: "DELETE",
  });
  setServices((current) => current.filter((s) => s._id !== id));
};


  const updateServiceStatus = (id, status) => {
    setServices((current) =>
      current.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  /* ===== FEEDBACK ===== */

  const getFilteredFeedbacks = () =>
    feedbacks.filter((fb) => {
      const statusMatch =
        feedbackFilter === "all" || fb.status === feedbackFilter;
      const searchMatch =
        feedbackSearchTerm === "" ||
        [
          fb.userName,
          fb.userEmail,
          fb.subject,
          fb.category,
          fb.message,
        ]
          .join(" ")
          .toLowerCase()
          .includes(feedbackSearchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });

  const requestDeleteFeedback = (feedback) => {
    setDeleteItem({
      id: feedback._id,
      name: feedback.subject,
      type: "feedback",
    });
    setDeleteDialogOpen(true);
  };

  const deleteFeedback = async (id) => {
    await apiFetch(`http://localhost:5000/api/admin/feedbacks/${id}`, {
      method: "DELETE",
    });
    setFeedbacks((current) => current.filter((fb) => fb._id !== id));
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!deleteItem) return;
      const { id, type } = deleteItem;
      if (type === "pet") await deletePet(id);
      else if (type === "client") await deleteClient(id);
      else if (type === "invoice") await deleteInvoice(id);
      else if (type === "service") deleteService(id);
      else if (type === "feedback") await deleteFeedback(id);
      setDeleteDialogOpen(false);
      setDeleteItem(null);
    } catch (err) {
      console.error(err);
      alert("Error deleting item");
    }
  };

  /* ===== RENDER ===== */

  return (
    <div className="admin-bg">
      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-navbar-content">
            <div className="admin-navbar-brand">
              <h1 className="admin-navbar-title">Welcome OK Clinic Admin</h1>
            </div>
            <button className="admin-logout-btn" onClick={onLogout}>
              <span className="admin-logout-icon" style={{ marginRight: 8 }}>
                ⏻
              </span>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="admin-main">
        <div className="admin-tabs-list">
          {[
            "dashboard",
            "appointments",
            "pets",
            "clients",
            "invoices",
            "services",
            "feedback",
          ].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "admin-tab active" : "admin-tab"}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <DashboardTab
            totalRevenue={totalRevenue}
            pendingRevenue={pendingRevenue}
            todayAppointments={todayAppointments}
            activeUsers={activeUsers}
            totalPets={totalPets}
            invoices={invoices}
            appointments={appointments}
            users={users}
            pets={pets}
            getStatusColor={getStatusColor}
            getOwnerName={getOwnerName}
          />
        )}

        {activeTab === "appointments" && (
          <AppointmentsTab
            appointments={appointments}
            services={services}
            users={users}
            pets={pets}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            appointmentFilter={appointmentFilter}
            setAppointmentFilter={setAppointmentFilter}
            getFilteredAppointments={getFilteredAppointments}
            updateAppointmentStatus={updateAppointmentStatus}
            openAppointmentDialog={openAppointmentDialog}
            setDeleteItem={setDeleteItem}
            setDeleteDialogOpen={setDeleteDialogOpen}
          />
        )}

        {activeTab === "pets" && (
          <PetsTab
            pets={pets}
            getOwnerName={getOwnerName}
            getFilteredPets={getFilteredPets}
            petSearchTerm={petSearchTerm}
            setPetSearchTerm={setPetSearchTerm}
            petFilter={petFilter}
            setPetFilter={setPetFilter}
            openPetDialog={openPetDialog}
            handleEditPet={handleEditPet}
            requestDeletePet={requestDeletePet}
            updatePetStatus={updatePetStatus}
          />
        )}

        {activeTab === "clients" && (
          <ClientsTab
            clients={users}
            clientSearchTerm={clientSearchTerm}
            setClientSearchTerm={setClientSearchTerm}
            clientFilter={clientFilter}
            setClientFilter={setClientFilter}
            getFilteredClients={getFilteredClients}
            handleEditClient={handleEditClient}
            setClientDialogOpen={setClientDialogOpen}
            setClientForm={setClientForm}
            requestDeleteClient={requestDeleteClient}
            updateClientStatus={updateClientStatus}
          />
        )}

        {activeTab === "invoices" && (
          <InvoicesTab
            invoices={invoices}
            invoiceSearchTerm={invoiceSearchTerm}
            setInvoiceSearchTerm={setInvoiceSearchTerm}
            invoiceFilter={invoiceFilter}
            setInvoiceFilter={setInvoiceFilter}
            getFilteredInvoices={getFilteredInvoices}
            handleEditInvoice={handleEditInvoice}
            setInvoiceDialogOpen={setInvoiceDialogOpen}
            setInvoiceForm={setInvoiceForm}
            requestDeleteInvoice={requestDeleteInvoice}
            updateInvoiceStatus={updateInvoiceStatus}
          />
        )}

        {activeTab === "services" && (
          <ServicesTab
            services={services}
            serviceSearchTerm={serviceSearchTerm}
            setServiceSearchTerm={setServiceSearchTerm}
            serviceFilter={serviceFilter}
            setServiceFilter={setServiceFilter}
            getFilteredServices={getFilteredServices}
            handleEditService={handleEditService}
            setServiceDialogOpen={setServiceDialogOpen}
            setServiceForm={setServiceForm}
            requestDeleteService={requestDeleteService}
            updateServiceStatus={updateServiceStatus}
          />
        )}

        {activeTab === "feedback" && (
          <FeedbackTab
            feedbacks={feedbacks}
            feedbackSearchTerm={feedbackSearchTerm}
            setFeedbackSearchTerm={setFeedbackSearchTerm}
            feedbackFilter={feedbackFilter}
            setFeedbackFilter={setFeedbackFilter}
            getFilteredFeedbacks={getFilteredFeedbacks}
            requestDeleteFeedback={requestDeleteFeedback}
          />
        )}
      </div>

      {/* Dialogs */}
      <AppointmentDialog
        open={appointmentDialogOpen}
        setOpen={setAppointmentDialogOpen}
        appointmentForm={appointmentForm}
        setAppointmentForm={setAppointmentForm}
        editingAppointment={editingAppointment}
        setEditingAppointment={setEditingAppointment}
        users={users}
        pets={pets}
        services={services}
        appointments={appointments}
        getActiveClients={getActiveClients}
        getClientPets={(clientId) =>
          pets.filter((p) => p.owner?._id === clientId)
        }
        handleServiceToggle={handleServiceToggle}
        onSubmit={handleAppointmentSubmit}
      />

      <PetDialog
        open={petDialogOpen}
        setOpen={setPetDialogOpen}
        petForm={petForm}
        setPetForm={setPetForm}
        editingPet={editingPet}
        users={users}
        onSubmit={handlePetFormSubmit}
      />

      <ClientDialog
        open={clientDialogOpen}
        setOpen={setClientDialogOpen}
        clientForm={clientForm}
        setClientForm={setClientForm}
        editingClient={editingClient}
        onSubmit={handleClientFormSubmit}
      />

      <InvoiceDialog
        open={invoiceDialogOpen}
        setOpen={setInvoiceDialogOpen}
        invoiceForm={invoiceForm}
        setInvoiceForm={setInvoiceForm}
        editingInvoice={editingInvoice}
        users={users}
        onSubmit={handleInvoiceFormSubmit}
      />

      <ServiceDialog
        open={serviceDialogOpen}
        setOpen={setServiceDialogOpen}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
        editingService={editingService}
        onSubmit={handleServiceFormSubmit}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        item={deleteItem}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default AdminDashboard;
