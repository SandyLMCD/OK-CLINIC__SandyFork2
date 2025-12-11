import { useState } from "react";
import {
  Plus,
  Edit,
  Calendar,
  Heart,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "../edit/ProfilePage.css";

/* ---------- Reusable UI primitives ---------- */

function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
function CardTitle({ children }) {
  return (
    <h2 className="text-2xl font-semibold leading-none tracking-tight">
      {children}
    </h2>
  );
}
function CardDescription({ children }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}
function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "bg-transparent text-primary hover:bg-accent",
  };

  const sizes = {
    sm: "h-7 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-9 px-4 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant] || ""} ${
        sizes[size] || ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Input(props) {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm profile-input"
      {...props}
    />
  );
}
function Label({ children, ...props }) {
  return (
    <label className="text-sm font-medium leading-none mb-2 block" {...props}>
      {children}
    </label>
  );
}
function Badge({ children, variant = "default", className = "", ...props }) {
  const variants = {
    default:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground",
    secondary:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground",
    outline:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border",
  };
  return (
    <span className={`${variants[variant] || ""} ${className}`} {...props}>
      {children}
    </span>
  );
}
function Separator({ className = "", ...props }) {
  return (
    <div className={`shrink-0 bg-border h-px w-full ${className}`} {...props} />
  );
}

/* ---------- Main Profile Page ---------- */

export function ProfilePage({
  user,
  pets: initialPets,
  appointments,
  onNavigate,
}) {
  const [editingUser, setEditingUser] = useState(false);
  const [addingPet, setAddingPet] = useState(false);

  const [userForm, setUserForm] = useState(
    user || {
      id: "",
      email: "",
      name: "",
      phone: "",
      address: "",
    }
  );

  const [petForm, setPetForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: 0,
  });

  const [pets, setPets] = useState(initialPets || []);
  const [message, setMessage] = useState("");

  // NEW: state for editing a pet
  const [editingPetId, setEditingPetId] = useState(null);
  const [editPetForm, setEditPetForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: 0,
  });

  if (!user) return null;

  const handleUserSave = async () => {
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: userForm.name,
          phone: userForm.phone,
          address: userForm.address,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserForm((prev) => ({
          ...prev,
          name: data.name,
          phone: data.phone,
          address: data.address,
        }));
        setEditingUser(false);
        setMessage("Profile updated successfully.");
      } else {
        setMessage(data.error || "Failed to update profile.");
      }
    } catch {
      setMessage("Error connecting to server.");
    }
  };

  const handleAddPet = async () => {
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: petForm.name,
          species: petForm.species,
          breed: petForm.breed,
          age: petForm.age,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPets((prev) => [...prev, data]);
        setPetForm({ name: "", species: "", breed: "", age: 0 });
        setAddingPet(false);
        setMessage("Pet added successfully.");
      } else {
        setMessage(data.error || "Failed to add pet.");
      }
    } catch {
      setMessage("Error connecting to server.");
    }
  };

  // NEW: update pet handler
  const handleUpdatePet = async () => {
    if (!editingPetId) return;

    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:5000/api/pets/${editingPetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            name: editPetForm.name,
            species: editPetForm.species,
            breed: editPetForm.breed,
            age: editPetForm.age,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setPets((prev) =>
          prev.map((p) =>
            (p._id || p.id) === editingPetId ? { ...p, ...data } : p
          )
        );
        setEditingPetId(null);
        setMessage("Pet updated successfully.");
      } else {
        setMessage(data.error || "Failed to update pet.");
      }
    } catch {
      setMessage("Error connecting to server.");
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <div className="profile-header-buttons">
          <Button
            size="md"
            className="btn-pill btn-pill-primary"
            onClick={() => onNavigate("booking")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
          <Button
            variant="outline"
            size="md"
            className="btn-pill btn-pill-secondary"
            onClick={() => onNavigate("invoices")}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Manage Balance
          </Button>
        </div>
      </div>

      {message && (
        <div className="mb-2 text-sm text-center text-muted-foreground">
          {message}
        </div>
      )}

      {/* User Information */}
      <Card>
        <CardHeader>
          <div className="profile-card-header">
            <CardTitle>Personal Information</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="btn-pill btn-pill-outline"
              onClick={() => setEditingUser((prev) => !prev)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {editingUser ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="profile-card-content">
          {editingUser ? (
            <>
              <div className="profile-grid-2col">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email || user.email}
                    disabled
                  />
                </div>
              </div>
              <div className="profile-grid-2col">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={userForm.phone}
                    onChange={(e) =>
                      setUserForm({ ...userForm, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={userForm.address}
                    onChange={(e) =>
                      setUserForm({ ...userForm, address: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                size="md"
                className="btn-pill btn-pill-primary"
                onClick={handleUserSave}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <div className="profile-grid-2col">
              <div>
                <p className="profile-info-label">Name</p>
                <p>{userForm.name || user.name}</p>
              </div>
              <div>
                <p className="profile-info-label">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="profile-info-label">Phone</p>
                <p>{userForm.phone || user.phone}</p>
              </div>
              <div>
                <p className="profile-info-label">Address</p>
                <p>{userForm.address || user.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="profile-card-header">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="btn-pill btn-pill-outline"
              onClick={() => onNavigate("invoices")}
            >
              View All Invoices
            </Button>
          </div>
        </CardHeader>

        <CardContent className="appointments-list">
          {appointments && appointments.length > 0 ? (
            appointments
              .filter((apt) => apt.status === "upcoming")
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((appointment) => {
                const isBookingOnly =
                  !appointment.services || appointment.services.length === 0;
                const total = Number(appointment.total || 0);
                const depositAmount = isBookingOnly ? 0 : total * 0.5;
                const depositPaid = Number(appointment.depositPaid || 0);
                const balanceDue = total - depositPaid;

                return (
                  <Card
                    key={appointment._id || appointment.id}
                    className="appointment-card"
                  >
                    <CardContent className="profile-card-content">
                      <div className="appointment-header">
                        <div className="appointment-date-container">
                          <Calendar className="appointment-icon" />
                          <div>
                            <h4>
                              {new Date(appointment.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </h4>
                            <div className="appointment-time">
                              <Clock className="appointment-time-icon" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={isBookingOnly ? "secondary" : "default"}
                        >
                          {isBookingOnly ? "Consultation" : "With Services"}
                        </Badge>
                      </div>

                      <Separator />

                      <div>
                        <p className="pet-info-label">Pet</p>
                        <div className="pet-details">
                          <p>{appointment.pet?.name}</p>
                          {appointment.pet?.species && (
                            <Badge variant="outline">
                              {appointment.pet.species}
                            </Badge>
                          )}
                          <span className="pet-details-text">
                            {appointment.pet?.breed} • {appointment.pet?.age}{" "}
                            years old
                          </span>
                        </div>
                      </div>

                      {!isBookingOnly &&
                        appointment.services &&
                        appointment.services.length > 0 && (
                          <div>
                            <p className="pet-info-label">Services</p>
                            <div className="services-list">
                              {appointment.services.map((service) => (
                                <div key={service.id} className="service-item">
                                  <div className="pet-details">
                                    <Heart className="service-icon" />
                                    <span className="service-name">
                                      {service.name}
                                    </span>
                                    <span className="service-duration">
                                      ({service.duration} min)
                                    </span>
                                  </div>
                                  <span className="service-price">
                                    ${service.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {appointment.notes && (
                        <div>
                          <p className="pet-info-label">Notes</p>
                          <p className="appointment-notes">
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                      <Separator />

                      <div className="payment-info">
                        {isBookingOnly ? (
                          <div className="payment-free">
                            <div className="payment-free-content">
                              <CheckCircle className="payment-free-icon" />
                              <div>
                                <p className="payment-free-text">
                                  Free Consultation
                                </p>
                                <p className="payment-free-subtext">
                                  No payment required
                                </p>
                              </div>
                            </div>
                            <p>$0.00</p>
                          </div>
                        ) : (
                          <>
                            <div className="payment-row">
                              <span className="payment-label">
                                Total Amount:
                              </span>
                              <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="payment-row">
                              <div className="payment-row-with-icon">
                                <span className="payment-label-with-status">
                                  Deposit Paid (50%):
                                </span>
                                {depositPaid >= depositAmount ? (
                                  <CheckCircle className="payment-status-icon payment-status-success" />
                                ) : (
                                  <AlertCircle className="payment-status-icon payment-status-warning" />
                                )}
                              </div>
                              <span
                                className={
                                  depositPaid >= depositAmount
                                    ? "payment-balance-due"
                                    : ""
                                }
                              >
                                ${depositPaid.toFixed(2)}
                              </span>
                            </div>
                            <div className="payment-balance-row">
                              <span>Balance Due:</span>
                              <span
                                className={
                                  balanceDue > 0 ? "" : "payment-balance-due"
                                }
                              >
                                ${balanceDue.toFixed(2)}
                              </span>
                            </div>
                            {balanceDue > 0 && (
                              <p className="payment-note">
                                Payable at your appointment
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          ) : (
            <div className="empty-appointments">
              <Calendar className="empty-icon" />
              <h3 className="text-lg font-semibold">
                No Upcoming Appointments
              </h3>
              <p className="empty-text">
                You do not have any scheduled appointments yet.
              </p>
              <Button
                size="md"
                className="btn-pill btn-pill-primary"
                onClick={() => onNavigate("booking")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Your Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pets */}
      <Card>
        <CardHeader>
          <div className="pets-header">
            <div>
              <CardTitle>My Pets</CardTitle>
              <CardDescription>Manage your pet information</CardDescription>
            </div>
            <Button
              size="md"
              className="btn-pill btn-pill-primary"
              onClick={() => {
                setAddingPet(true);
                setEditingPetId(null); // close edit when adding
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pet
            </Button>
          </div>
        </CardHeader>

        <CardContent className="profile-card-content">
          {pets.map((pet) => (
            <div key={pet._id || pet.id} className="pet-card">
              <div className="pet-info">
                <div>
                  <h4>{pet.name}</h4>
                  <p className="pet-details-container">
                    {pet.breed} • {pet.age} years old
                  </p>
                </div>
                <Badge variant="outline">{pet.species}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingPetId(pet._id || pet.id);
                  setAddingPet(false); // close add form when editing
                  setEditPetForm({
                    name: pet.name || "",
                    species: pet.species || "",
                    breed: pet.breed || "",
                    age: pet.age || 0,
                  });
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {addingPet && (
            <div className="add-pet-form">
              <h4 className="font-semibold">Add New Pet</h4>
              <div className="profile-grid-2col">
                <div>
                  <Label htmlFor="petName">Name</Label>
                  <Input
                    id="petName"
                    value={petForm.name}
                    onChange={(e) =>
                      setPetForm({ ...petForm, name: e.target.value })
                    }
                    placeholder="Pet name"
                  />
                </div>
                <div>
                  <Label htmlFor="species">Species</Label>
                  <Input
                    id="species"
                    value={petForm.species}
                    onChange={(e) =>
                      setPetForm({ ...petForm, species: e.target.value })
                    }
                    placeholder="Dog, Cat, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={petForm.breed}
                    onChange={(e) =>
                      setPetForm({ ...petForm, breed: e.target.value })
                    }
                    placeholder="Pet breed"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={petForm.age}
                    onChange={(e) =>
                      setPetForm({
                        ...petForm,
                        age: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    placeholder="Age in years"
                  />
                </div>
              </div>
              <div className="add-pet-buttons">
                <Button
                  size="md"
                  className="btn-pill btn-pill-primary"
                  onClick={handleAddPet}
                >
                  Add Pet
                </Button>
                <Button
                  variant="outline"
                  className="btn-pill btn-pill-outline"
                  size="md"
                  onClick={() => setAddingPet(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {editingPetId && (
            <div className="add-pet-form">
              <h4 className="font-semibold">Edit Pet</h4>
              <div className="profile-grid-2col">
                <div>
                  <Label htmlFor="editPetName">Name</Label>
                  <Input
                    id="editPetName"
                    value={editPetForm.name}
                    onChange={(e) =>
                      setEditPetForm({ ...editPetForm, name: e.target.value })
                    }
                    placeholder="Pet name"
                  />
                </div>
                <div>
                  <Label htmlFor="editSpecies">Species</Label>
                  <Input
                    id="editSpecies"
                    value={editPetForm.species}
                    onChange={(e) =>
                      setEditPetForm({
                        ...editPetForm,
                        species: e.target.value,
                      })
                    }
                    placeholder="Dog, Cat, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="editBreed">Breed</Label>
                  <Input
                    id="editBreed"
                    value={editPetForm.breed}
                    onChange={(e) =>
                      setEditPetForm({ ...editPetForm, breed: e.target.value })
                    }
                    placeholder="Pet breed"
                  />
                </div>
                <div>
                  <Label htmlFor="editAge">Age</Label>
                  <Input
                    id="editAge"
                    type="number"
                    value={editPetForm.age}
                    onChange={(e) =>
                      setEditPetForm({
                        ...editPetForm,
                        age: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    placeholder="Age in years"
                  />
                </div>
              </div>
              <div className="add-pet-buttons">
                <Button
                  size="md"
                  className="btn-pill btn-pill-primary"
                  onClick={handleUpdatePet}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="btn-pill btn-pill-outline"
                  size="md"
                  onClick={() => setEditingPetId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
