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
import "./customer.css";

/* ---------- Reusable UI primitives ---------- */

function Card({ children, ...props }) {
  return (
    <div
      className="rounded-xl border bg-card text-card-foreground shadow"
      {...props}
    >
      {children}
    </div>
  );
}
function CardHeader({ children, ...props }) {
  return (
    <div className="flex flex-col space-y-1.5 p-6" {...props}>
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
function CardContent({ children, ...props }) {
  return (
    <div className="p-6 pt-0" {...props}>
      {children}
    </div>
  );
}
function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm",
    outline:
      "border border-border bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm",
    ghost: "hover:bg-accent hover:text-accent-foreground px-2 py-1 text-sm",
  };
  const sizes = {
    default: "",
    sm: "h-8 px-2 text-xs",
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
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground"
      {...props}
    />
  );
}
function Label({ children, ...props }) {
  return (
    <label
      className="text-sm font-medium leading-none mb-2 block peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      {...props}
    >
      {children}
    </label>
  );
}
function Badge({ children, variant = "default", ...props }) {
  const variants = {
    default:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground",
    secondary:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground",
    outline:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border",
  };
  return (
    <span className={variants[variant] || ""} {...props}>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <div className="flex gap-2">
          <Button onClick={() => onNavigate("booking")}>
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
          <Button variant="outline" onClick={() => onNavigate("invoices")}>
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
          <div className="flex justify-between items-center">
            <CardTitle>Personal Information</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingUser((prev) => !prev)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {editingUser ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {editingUser ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Button onClick={handleUserSave}>Save Changes</Button>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p>{userForm.name || user.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p>{userForm.phone || user.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p>{userForm.address || user.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </div>
            <Button variant="outline" onClick={() => onNavigate("invoices")}>
              View All Invoices
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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
                    className="border-2"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                              <h4>
                                {new Date(
                                  appointment.date
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </h4>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
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
                          <p className="text-sm text-muted-foreground mb-1">
                            Pet
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p>{appointment.pet?.name}</p>
                            {appointment.pet?.species && (
                              <Badge variant="outline">
                                {appointment.pet.species}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {appointment.pet?.breed} •{" "}
                              {appointment.pet?.age} years old
                            </span>
                          </div>
                        </div>

                        {!isBookingOnly &&
                          appointment.services &&
                          appointment.services.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Services
                              </p>
                              <div className="space-y-2">
                                {appointment.services.map((service) => (
                                  <div
                                    key={service.id}
                                    className="flex justify-between items-center"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Heart className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {service.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ({service.duration} min)
                                      </span>
                                    </div>
                                    <span className="text-sm">
                                      ${service.price}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {appointment.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Notes
                            </p>
                            <p className="text-sm bg-muted p-2 rounded">
                              {appointment.notes}
                            </p>
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                          {isBookingOnly ? (
                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="text-sm">Free Consultation</p>
                                  <p className="text-xs text-muted-foreground">
                                    No payment required
                                  </p>
                                </div>
                              </div>
                              <p>$0.00</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Total Amount:
                                </span>
                                <span>${total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    Deposit Paid (50%):
                                  </span>
                                  {depositPaid >= depositAmount ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                  )}
                                </div>
                                <span
                                  className={
                                    depositPaid >= depositAmount
                                      ? "text-green-600"
                                      : "text-amber-600"
                                  }
                                >
                                  ${depositPaid.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t">
                                <span>Balance Due:</span>
                                <span
                                  className={
                                    balanceDue > 0 ? "" : "text-green-600"
                                  }
                                >
                                  ${balanceDue.toFixed(2)}
                                </span>
                              </div>
                              {balanceDue > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Payable at your appointment
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No Upcoming Appointments</h3>
              <p className="text-muted-foreground mb-4">
                You do not have any scheduled appointments yet.
              </p>
              <Button onClick={() => onNavigate("booking")}>
                <Calendar className="w-4 h-4 mr-2" />
                Book Your First Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pets */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My Pets</CardTitle>
              <CardDescription>Manage your pet information</CardDescription>
            </div>
            <Button onClick={() => setAddingPet(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Pet
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {pets.map((pet) => (
            <div
              key={pet._id || pet.id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div>
                  <h4>{pet.name}</h4>
                  <p className="text-muted-foreground">
                    {pet.breed} • {pet.age} years old
                  </p>
                </div>
                <Badge variant="outline">{pet.species}</Badge>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {addingPet && (
            <div className="p-4 border rounded-lg bg-muted space-y-4">
              <h4 className="font-semibold">Add New Pet</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex gap-2">
                <Button onClick={handleAddPet}>Add Pet</Button>
                <Button variant="outline" onClick={() => setAddingPet(false)}>
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
