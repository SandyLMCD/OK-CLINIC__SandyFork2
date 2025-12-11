import React, { useState } from "react";
import {
  CalendarIcon,
  Clock,
  ArrowRight,
  Heart,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import "../edit/BookingPage.css";

/* ---------------- UI COMPONENTS (INLINE) ---------------- */

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

function CardTitle({ children, className = "", ...props }) {
  return (
    <h2
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`text-muted-foreground text-sm ${className}`} {...props}>
      {children}
    </p>
  );
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

function Textarea({ className = "", ...props }) {
  return (
    <textarea className={`booking-notes-textarea ${className}`} {...props} />
  );
}

function Checkbox({ checked, onCheckedChange, className = "", ...props }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={`flex h-4 w-4 items-center justify-center rounded border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        checked ? "bg-primary text-primary-foreground" : ""
      } ${className}`}
      {...props}
    >
      {checked && (
        <span className="block h-2 w-2 rounded-sm bg-primary-foreground" />
      )}
    </button>
  );
}

/* Minimal Calendar stub */
function Calendar({ selected, onSelect, disabled, className = "" }) {
  const handleChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    const date = new Date(`${value}T00:00:00`);
    if (disabled && disabled(date)) return;
    onSelect && onSelect(date);
  };

  const value = selected ? selected.toISOString().split("T")[0] : "";

  return (
    <input
      type="date"
      value={value}
      onChange={handleChange}
      className={`border rounded-md px-3 py-2 text-sm ${className}`}
    />
  );
}

/* ---------------- STATIC DATA ---------------- */

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

const availableServices = [
  {
    id: "1",
    name: "General Health Checkup",
    price: 75,
    duration: 30,
    description:
      "Comprehensive physical examination including weight, temperature, and basic health assessment.",
    category: "Wellness",
  },
  {
    id: "2",
    name: "Vaccination",
    price: 45,
    duration: 15,
    description:
      "Essential vaccinations to protect your pet from common diseases.",
    category: "Prevention",
  },
  {
    id: "3",
    name: "Dental Cleaning",
    price: 120,
    duration: 60,
    description:
      "Professional dental cleaning under anesthesia to maintain oral health.",
    category: "Dental",
  },
  {
    id: "4",
    name: "Blood Work Panel",
    price: 95,
    duration: 20,
    description:
      "Complete blood chemistry panel to assess organ function and overall health.",
    category: "Diagnostics",
  },
  {
    id: "5",
    name: "Microchipping",
    price: 35,
    duration: 10,
    description:
      "Permanent identification chip implantation for pet safety and recovery.",
    category: "Safety",
  },
  {
    id: "6",
    name: "Spay/Neuter Surgery",
    price: 200,
    duration: 120,
    description:
      "Surgical sterilization procedure performed by experienced veterinarians.",
    category: "Surgery",
  },
  {
    id: "7",
    name: "X-Ray Imaging",
    price: 85,
    duration: 25,
    description:
      "Digital radiography for diagnosing bone, joint, and internal organ conditions.",
    category: "Diagnostics",
  },
  {
    id: "8",
    name: "Flea & Tick Treatment",
    price: 55,
    duration: 20,
    description:
      "Professional treatment and prevention plan for external parasites.",
    category: "Treatment",
  },
];

export function BookingPage({
  pets,
  appointments,
  onBookingComplete,
  onNavigate,
}) {
  const [currentStep, setCurrentStep] = useState("details"); // 'details' | 'services' | 'confirmation'

  // Step 1: Booking Details
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPet, setSelectedPet] = useState(null);
  const [notes, setNotes] = useState("");

  // Step 2: Services
  const [selectedServices, setSelectedServices] = useState([]);

  const handleNextFromDetails = () => {
    if (selectedDate && selectedTime && selectedPet) {
      setCurrentStep("services");
    }
  };

  const handleServiceToggle = (service, checked) => {
    setSelectedServices((prev) => {
      if (checked) {
        if (prev.some((s) => s.id === service.id)) return prev;
        return [...prev, service];
      }
      return prev.filter((s) => s.id !== service.id);
    });
  };

  const handleSkipServices = () => {
    setSelectedServices([]);
    setCurrentStep("confirmation");
  };

  const handleContinueWithServices = () => {
    if (selectedServices.length > 0) {
      setCurrentStep("confirmation");
    }
  };

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime && selectedPet) {
      onBookingComplete({
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        pet: selectedPet,
        services: selectedServices,
        notes,
      });
      onNavigate("checkout");
    }
  };

  const handleBackToDetails = () => setCurrentStep("details");
  const handleBackToServices = () => setCurrentStep("services");

  const today = new Date();
  const minDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const servicesTotal = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );
  const depositAmount = servicesTotal > 0 ? servicesTotal * 0.5 : 0;
  const categories = Array.from(
    new Set(availableServices.map((service) => service.category))
  );

  // Check time slot availability
  const isTimeSlotAvailable = (time) => {
    if (!selectedDate) return true;
    const dateStr = selectedDate.toISOString().split("T")[0];
    return !appointments.some(
      (apt) =>
        apt.date === dateStr && apt.time === time && apt.status !== "cancelled"
    );
  };

  /* ---------- Step 1: Booking Details ---------- */
  if (currentStep === "details") {
    return (
      <div className="booking-container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Book Appointment</h1>
          <p className="text-muted-foreground">
            Step 1 of 3: Select pet, date, and time
          </p>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="booking-two-column">
          {/* Column 1: Pet, Date, Time */}
          <div className="booking-column">
            {/* Pet Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Pet</CardTitle>
                <CardDescription>
                  Which pet is this appointment for?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pet-selection-list">
                  {pets.map((pet) => {
                    const petId = pet.id || pet._id;
                    const selectedId = selectedPet?.id || selectedPet?._id;
                    const isSelected = selectedId === petId;

                    return (
                      <div
                        key={petId}
                        className={
                          "pet-card-selectable" +
                          (isSelected ? " pet-card-selected" : "")
                        }
                        onClick={() =>
                          setSelectedPet((current) => {
                            const currentId = current?.id || current?._id;
                            return currentId === petId ? null : pet;
                          })
                        }
                      >
                        <div className="pet-card-content">
                          <div>
                            <h4>{pet.name}</h4>
                            <p className="pet-meta pet-breed-age">
                              {pet.breed} • {pet.age} years old
                            </p>
                          </div>
                          <Badge variant="outline">{pet.species}</Badge>
                        </div>
                      </div>
                    );
                  })}

                  {pets.length === 0 && (
                    <p className="empty-pets-message">
                      No pets found. Please add a pet to your profile first.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  Choose your preferred appointment date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="calendar-wrapper">
                  <div className="calendar-card">
                    <Calendar
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < minDate}
                      className="calendar-input"
                    />
                  </div>

                  <div className="calendar-legend">
                    <p className="calendar-legend-title">
                      Availability Legend:
                    </p>
                    <div className="calendar-legend-items">
                      <div className="calendar-legend-item">
                        <span className="legend-indicator legend-available" />
                        <span>Available</span>
                      </div>
                      <div className="calendar-legend-item">
                        <span className="legend-indicator legend-limited" />
                        <span>Limited Slots</span>
                      </div>
                      <div className="calendar-legend-item">
                        <span className="legend-indicator legend-booked" />
                        <span>Fully Booked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Time</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Available slots for ${selectedDate.toLocaleDateString()}`
                    : "Please select a date first"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="time-slots-grid">
                    {timeSlots.map((time) => {
                      const isSelected = selectedTime === time;
                      const isDisabled = !isTimeSlotAvailable(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          className={
                            "time-slot-button" +
                            (isSelected ? " time-slot-selected" : "") +
                            (isDisabled ? " time-slot-disabled" : "")
                          }
                          onClick={() => !isDisabled && setSelectedTime(time)}
                          disabled={isDisabled}
                        >
                          <Clock className="time-slot-icon" />
                          <span className="time-slot-label">{time}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="time-empty-state">
                    <CalendarIcon className="time-empty-icon" />
                    <p>Select a date to view available time slots</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Notes, Summary */}
          <div className="booking-column">
            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Any special instructions or concerns?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  placeholder="Tell us about any symptoms, concerns, or special requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Summary</CardTitle>
              </CardHeader>

              <CardContent className="appointment-summary">
                <div className="summary-row">
                  <span className="summary-label">Pet:</span>
                  <span className="summary-value">
                    {selectedPet ? selectedPet.name : "Not selected"}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Not selected"}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Time:</span>
                  <span className="summary-value">
                    {selectedTime || "Not selected"}
                  </span>
                </div>

                <hr className="summary-divider" />

                <div className="summary-section-title">Pet Details:</div>
                <div className="summary-pet-details">
                  {selectedPet
                    ? `${selectedPet.breed} • ${selectedPet.age}`
                    : "No pet selected"}
                </div>

                <button
                  type="button"
                  className="summary-next-button"
                  disabled={!selectedPet || !selectedDate || !selectedTime}
                  onClick={handleNextFromDetails}
                >
                  Next: Add Services (Optional) →
                </button>

                <p className="summary-helper-text">
                  Please select a pet, date, and time to continue
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Step 2: Services ---------- */
  if (currentStep === "services") {
    const totalDuration = selectedServices.reduce(
      (sum, service) => sum + service.duration,
      0
    );

    return (
      <div className="booking-container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Add Services (Optional)</h1>
          <p className="text-muted-foreground">
            Step 2 of 3: Select additional services or skip for booking only
          </p>
        </div>

        {/* Single-column list like your screenshot */}
        <div className="services-list-vertical">
          {categories.map((category) => (
            <div key={category} className="services-category-block">
              <h2 className="mb-4 text-lg font-semibold">{category}</h2>

              {availableServices
                .filter((service) => service.category === category)
                .map((service) => {
                  const isSelected = selectedServices.some(
                    (s) => s.id === service.id
                  );

                  return (
                    <Card
                      key={service.id}
                      className={
                        "service-card cursor-pointer transition-all" +
                        (isSelected ? " service-card-selected" : "")
                      }
                    >
                      <CardContent className="service-card-content">
                        {/* Header row: checkbox + title, heart on right */}
                        <div className="service-card-header">
                          <div className="service-card-title-group">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleServiceToggle(service, checked)
                              }
                              className="service-checkbox"
                            />

                            <span className="service-card-title">
                              {service.name}
                            </span>
                          </div>
                          <Heart className="service-card-heart" />
                        </div>

                        {/* Description */}
                        <p className="service-card-description">
                          {service.description}
                        </p>

                        {/* Footer: price + duration left, category pill right */}
                        <div className="service-card-footer">
                          <div className="service-card-meta">
                            <span className="service-meta-item">
                              <DollarSign className="service-meta-icon" />
                              <span>${service.price}</span>
                            </span>
                            <span className="service-meta-item">
                              <Clock className="service-meta-icon" />
                              <span>{service.duration}min</span>
                            </span>
                          </div>
                          <span className="service-category-pill">
                            {service.category}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="services-footer-row">
          <Button
            variant="outline"
            onClick={handleBackToDetails}
            className="btn-pill btn-pill-outline"
          >
            Back to Details
          </Button>

          <Button
            variant="outline"
            onClick={handleSkipServices}
            className="btn-pill btn-pill-outline"
          >
            Skip Services (Booking Only - Free)
          </Button>

          <Button
            onClick={handleContinueWithServices}
            disabled={selectedServices.length === 0}
            className="btn-pill btn-pill-primary"
          >
            Continue with Services
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- Step 3: Confirmation ---------- */
  if (currentStep === "confirmation") {
    const isBookingOnly = selectedServices.length === 0;
    const totalDuration = selectedServices.reduce(
      (sum, service) => sum + service.duration,
      0
    );

    return (
      <div className="booking-container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Confirm Booking</h1>
          <p className="text-muted-foreground">
            Step 3 of 3: Review your appointment details
          </p>
        </div>

        <div className="booking-two-column">
          {/* Left Column - Appointment Details */}
          <div className="booking-column">
            <Card>
              <CardHeader className="appointment-card-header">
                <CardTitle className="appointment-card-title">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Appointment Details</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="appointment-card-content">
                {/* Date / Time row */}
                <div className="appointment-row">
                  <div className="appointment-field">
                    <p className="appointment-label">Date</p>
                    <p className="appointment-value">
                      {selectedDate?.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="appointment-field appointment-field-right">
                    <p className="appointment-label">Time</p>
                    <p className="appointment-value appointment-time">
                      <Clock className="w-4 h-4" />
                      <span>{selectedTime}</span>
                    </p>
                  </div>
                </div>

                <hr className="appointment-divider" />

                {/* Pet row */}
                <div className="appointment-pet-section">
                  <p className="appointment-label">Pet</p>
                  <div className="appointment-pet-row">
                    <div>
                      <p className="appointment-pet-name">
                        {selectedPet?.name}
                      </p>
                      <p className="appointment-pet-meta">
                        {selectedPet?.breed} • {selectedPet?.age} years old
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="appointment-species-pill"
                    >
                      {selectedPet?.species}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedServices.length > 0 && (
              <Card>
                <CardHeader className="selected-services-header">
                  <CardTitle className="selected-services-title">
                    Selected Services
                  </CardTitle>
                </CardHeader>

                <CardContent className="selected-services-content">
                  <div className="selected-services-list">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="selected-service-row">
                        <div>
                          <p className="selected-service-name">
                            {service.name}
                          </p>
                          <p className="selected-service-duration">
                            {service.duration} minutes
                          </p>
                        </div>
                        <p className="selected-service-price">
                          ${service.price}
                        </p>
                      </div>
                    ))}
                  </div>

                  <hr className="selected-services-divider" />

                  <div className="selected-services-total-row">
                    <span className="selected-services-total-label">
                      Total Duration:
                    </span>
                    <span className="selected-services-total-value">
                      {totalDuration} minutes
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Payment Summary */}
          <div className="booking-column">
            <Card>
              <CardHeader className="payment-card-header">
                <CardTitle className="payment-card-title">
                  Payment Summary
                </CardTitle>
              </CardHeader>

              <CardContent className="payment-card-content">
                {isBookingOnly ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">
                      Booking Only - Free
                    </h3>
                    <p className="text-muted-foreground">
                      No services selected. Your appointment booking is free of
                      charge.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Services total row */}
                    <div className="payment-row">
                      <span className="payment-label">Services Total:</span>
                      <span className="payment-value">
                        ${servicesTotal.toFixed(2)}
                      </span>
                    </div>

                    <hr className="payment-divider" />

                    {/* Deposit row */}
                    <div className="payment-row">
                      <div>
                        <p className="payment-label-strong">
                          50% Deposit Required
                        </p>
                        <p className="payment-subtext">Non-refundable</p>
                      </div>
                      <span className="payment-value">
                        ${depositAmount.toFixed(2)}
                      </span>
                    </div>

                    <hr className="payment-divider" />

                    {/* Balance row */}
                    <div className="payment-row">
                      <div>
                        <p className="payment-label-strong">Balance Due:</p>
                        <p className="payment-subtext">
                          Payable at appointment
                        </p>
                      </div>
                      <span className="payment-value payment-value-muted">
                        ${(servicesTotal - depositAmount).toFixed(2)}
                      </span>
                    </div>

                    {/* Note box */}
                    <div className="payment-note">
                      <p className="payment-note-text">
                        <strong>Note:</strong> The 50% deposit ($
                        {depositAmount.toFixed(2)}) is non-refundable and
                        secures your appointment.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="confirmation-actions-content">
                <Button
                  className="confirmation-primary-btn"
                  onClick={handleConfirmBooking}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isBookingOnly
                    ? "Confirm Booking"
                    : `Proceed to Payment ($${depositAmount.toFixed(2)})`}
                </Button>

                <Button
                  variant="outline"
                  className="confirmation-secondary-btn"
                  onClick={handleBackToServices}
                >
                  Back to Services
                </Button>

                <p className="confirmation-helper-text">
                  By confirming, you agree to our terms of service and booking
                  policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
