import React, { useState } from "react";
import { Navigation } from "./components/Navigation";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { PasswordResetPage } from "./components/PasswordResetPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProfilePage } from "./components/ProfilePage";
import { BookingPage } from "./components/BookingPage";
import { InvoicesPage } from "./components/InvoicesPage";
import { FeedbackPage } from "./components/FeedbackPage";
import { CheckoutPage } from "./components/CheckoutPage";
import "./App.css";

const PAGES = {
  LOGIN: "login",
  SIGNUP: "signup",
  RESET: "reset",
  ADMIN: "admin",
  PROFILE: "profile",
  BOOKING: "booking",
  INVOICES: "invoices",
  FEEDBACK: "feedback",
  CHECKOUT: "checkout",
};

function App() {
  const [page, setPage] = useState(PAGES.LOGIN);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pendingAppointment, setPendingAppointment] = useState(null);

  const handleNavigate = (nextPage) => {
    const p = (nextPage || "").toLowerCase();
    setPage(PAGES[p.toUpperCase()] || PAGES.PROFILE);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAdmin(userData.role === "admin");
    setPage(userData.role === "admin" ? PAGES.ADMIN : PAGES.PROFILE);

    const headers = { Authorization: `Bearer ${userData.token}` };

    fetch("http://localhost:5000/api/pets", { headers })
      .then((res) => res.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch(() => setPets([]));

    fetch("http://localhost:5000/api/bookings", { headers })
      .then((res) => res.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]));

    fetch("http://localhost:5000/api/invoices", { headers })
      .then((res) => res.json())
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setPets([]);
    setAppointments([]);
    setInvoices([]);
    setPendingAppointment(null);
    setPage(PAGES.LOGIN);
  };

  const handleBookingComplete = (details) => {
    setPendingAppointment(details);
    setPage(PAGES.CHECKOUT);
  };

  const handlePaymentComplete = async () => {
    if (!pendingAppointment || !user) {
      setPage(PAGES.PROFILE);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          date: pendingAppointment.date,
          time: pendingAppointment.time,
          pet: pendingAppointment.pet._id || pendingAppointment.pet.id,
          services: pendingAppointment.services || [],
          notes: pendingAppointment.notes || "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) => [...prev, data]);
      } else {
        console.error("Failed to save booking:", data.error);
      }
    } catch (e) {
      console.error("Error saving booking:", e);
    }

    setPendingAppointment(null);
    setPage(PAGES.PROFILE);
  };

  const showNav = ![PAGES.LOGIN, PAGES.SIGNUP, PAGES.RESET].includes(page);

  return (
    <div className="App">
      {showNav && (
        <Navigation
          currentPage={page}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {page === PAGES.LOGIN && (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToSignup={() => setPage(PAGES.SIGNUP)}
          onNavigateToPasswordReset={() => setPage(PAGES.RESET)}
        />
      )}
      {page === PAGES.ADMIN && (
  <AdminDashboard user={user} onLogout={handleLogout} />
)}


      {page === PAGES.SIGNUP && (
        <SignupPage
          onSignup={handleLogin}
          onNavigateToLogin={() => setPage(PAGES.LOGIN)}
        />
      )}

      {page === PAGES.RESET && (
        <PasswordResetPage onNavigateToLogin={() => setPage(PAGES.LOGIN)} />
      )}

      {page === PAGES.ADMIN && (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}

      {page === PAGES.PROFILE && (
        <ProfilePage
          user={user}
          pets={pets}
          appointments={appointments}
          onNavigate={handleNavigate}
          onUpdateUser={async (updatedUser) => {
            if (!user) return;
            try {
              const res = await fetch(
                "http://localhost:5000/api/auth/update-profile",
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                  },
                  body: JSON.stringify({
                    name: updatedUser.name,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                  }),
                }
              );
              if (!res.ok) {
                console.error("Failed to update profile");
                return;
              }
              const data = await res.json();
              setUser((prev) => ({ ...prev, ...data }));
            } catch (e) {
              console.error("Update profile error", e);
            }
          }}
          onUpdatePets={async (newPets) => {
            if (!user) return;
            const newPet = newPets[newPets.length - 1];
            try {
              const res = await fetch("http://localhost:5000/api/pets", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                  name: newPet.name,
                  species: newPet.species,
                  breed: newPet.breed,
                  age: newPet.age,
                }),
              });
              if (!res.ok) {
                console.error("Failed to add pet");
                return;
              }
              const saved = await res.json();
              setPets((prev) => [...prev, saved]);
            } catch (e) {
              console.error("Add pet error", e);
            }
          }}
        />
      )}

      {page === PAGES.BOOKING && (
        <BookingPage
          user={user}
          pets={pets}
          appointments={appointments}
          onBookingComplete={handleBookingComplete}
          onNavigate={handleNavigate}
        />
      )}

      {page === PAGES.CHECKOUT && (
        <CheckoutPage
          appointment={pendingAppointment}
          user={user}
          onPaymentComplete={handlePaymentComplete}
          onNavigate={handleNavigate}
        />
      )}

      {page === PAGES.INVOICES && (
        <InvoicesPage
          user={user}
          invoices={invoices}
          onNavigate={handleNavigate}
          onPayInvoice={async (invoice) => {
            if (!user) return;
            try {
              const res = await fetch(
                `http://localhost:5000/api/invoices/${
                  invoice._id || invoice.id
                }/pay`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                  },
                  body: JSON.stringify({ paymentMethod: "Card" }),
                }
              );
              const data = await res.json();
              if (res.ok) {
                setInvoices((prev) =>
                  prev.map((inv) => (inv._id === data._id ? data : inv))
                );
              } else {
                console.error("Payment failed", data.error);
              }
            } catch (e) {
              console.error("Invoice payment error", e);
            }
          }}
        />
      )}

      {page === PAGES.FEEDBACK && (
        <FeedbackPage user={user} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
