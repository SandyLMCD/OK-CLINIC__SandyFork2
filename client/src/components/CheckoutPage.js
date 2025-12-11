import { useState } from "react";
import { Calendar, Clock, Heart, CheckCircle } from "lucide-react";
import "../edit/CheckoutPage.css";

// --- UI COMPONENTS (INLINE) ---
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
function CardTitle({ children, className = "" }) {
  return (
    <h2
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    >
      {children}
    </h2>
  );
}
function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-muted-foreground text-sm ${className}`}>{children}</p>
  );
}
function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
function Input(props) {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    />
  );
}
function Label({ children, ...props }) {
  return (
    <label className="text-sm font-medium leading-none block mb-1" {...props}>
      {children}
    </label>
  );
}
function Separator({ className = "", ...props }) {
  return (
    <div
      className={`shrink-0 bg-border h-px w-full my-2 ${className}`}
      {...props}
    />
  );
}
function Badge({ children, variant = "outline", className = "", ...props }) {
  const variants = {
    default:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground",
    outline:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border",
  };
  return (
    <span className={`${variants[variant] || ""} ${className}`} {...props}>
      {children}
    </span>
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

// --- PAGE LOGIC ---
export function CheckoutPage({
  appointment,
  user,
  onPaymentComplete,
  onNavigate,
}) {
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [processing, setProcessing] = useState(false);

  const services = appointment.services || [];
  const servicesTotal =
    services.length > 0
      ? services.reduce((sum, s) => sum + Number(s.price || 0), 0)
      : Number(appointment.total || 0);
  const isBookingOnly = services.length === 0 || servicesTotal === 0;
  const depositAmount = isBookingOnly ? 0 : servicesTotal * 0.5;
  const balanceDue = servicesTotal - depositAmount;

  // helper to create invoice in backend
  const createInvoice = async () => {
    const today = new Date().toISOString().split("T")[0];

    const body = {
      petName: appointment.pet.name,
      services: services.map((s) => s.name),
      amount: servicesTotal,
      invoiceNumber: `INV-${Date.now()}`,
      date: today,
      dueDate: today,
    };

    const res = await fetch("http://localhost:5000/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create invoice");
    }
    return data;
  };

  const handlePayment = async () => {
    if (processing) return;
    try {
      setProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const invoice = await createInvoice();
      onPaymentComplete(invoice);
    } catch (err) {
      console.error("Payment / invoice error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleFreeBooking = async () => {
    try {
      const invoice = await createInvoice();
      onPaymentComplete(invoice);
    } catch (err) {
      console.error("Free booking / invoice error:", err);
    }
  };

  // Basic guard: if key fields are missing, send user back
  if (!appointment?.date || !appointment?.time || !appointment?.pet) {
    return (
      <div className="booking-container mx-auto p-6">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3>Incomplete Booking</h3>
            <p className="text-muted-foreground mb-6">
              Please complete your booking details first.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => onNavigate("booking")}>
                Update Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="booking-container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-muted-foreground">
          Review and confirm your appointment
        </p>
      </div>

      <div className="booking-two-column">
        {/* Left Column - Appointment Details & Services */}
        <div className="booking-column space-y-6">
          {/* Appointment Summary (matches confirmation style) */}
          <Card className="appointment-card">
            <CardHeader className="appointment-card-header">
              <CardTitle className="appointment-card-title">
                <Calendar className="w-5 h-5" />
                <span>Appointment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="appointment-card-content">
              <div className="appointment-row">
                <div className="appointment-field">
                  <p className="appointment-label">Date</p>
                  <p className="appointment-value">
                    {new Date(appointment.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="appointment-field appointment-field-right">
                  <p className="appointment-label">Time</p>
                  <p className="appointment-value appointment-time">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.time}</span>
                  </p>
                </div>
              </div>

              <hr className="appointment-divider" />

              <div className="appointment-pet-section">
                <p className="appointment-label">Pet</p>
                <div className="appointment-pet-row">
                  <div>
                    <p className="appointment-pet-name">
                      {appointment.pet.name}
                    </p>
                    <p className="appointment-pet-meta">
                      {appointment.pet.breed} • {appointment.pet.age} years old
                    </p>
                  </div>
                  <Badge variant="outline" className="appointment-species-pill">
                    {appointment.pet.species}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Services (matches confirmation style) */}
          <Card className="selected-services-card">
            <CardHeader className="selected-services-header">
              <CardTitle className="selected-services-title">
                Selected Services
              </CardTitle>
            </CardHeader>
            <CardContent className="selected-services-content">
              {isBookingOnly ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3>Booking Only - Free</h3>
                  <p className="text-muted-foreground">
                    No paid services selected. Your appointment has no deposit.
                  </p>
                </div>
              ) : (
                <>
                  <div className="selected-services-list">
                    {services.map((service) => (
                      <div
                        key={service.id || service._id || service.name}
                        className="selected-service-row"
                      >
                        <div>
                          <p className="selected-service-name">
                            {service.name}
                          </p>
                          {service.duration != null && (
                            <p className="selected-service-duration">
                              {service.duration} minutes
                            </p>
                          )}
                        </div>
                        <p className="selected-service-price">
                          ${Number(service.price || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <hr className="selected-services-divider" />

                  <div className="selected-services-total-row">
                    <span className="selected-services-total-label">
                      Services Total:
                    </span>
                    <span className="selected-services-total-value">
                      ${servicesTotal.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Summary & Payment */}
        <div className="booking-column space-y-6">
          {isBookingOnly ? (
            <Card className="confirmation-actions-card">
              <CardHeader className="payment-card-header">
                <CardTitle className="payment-card-title">
                  Confirm Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="confirmation-actions-content">
                <div className="text-center mb-2">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Payment Required</h3>
                  <p className="text-muted-foreground">
                    Your appointment booking does not require a deposit. Click
                    below to confirm.
                  </p>
                </div>

                <Button
                  className="confirmation-primary-btn"
                  onClick={handleFreeBooking}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>

                <p className="confirmation-helper-text">
                  By confirming, you agree to our terms of service and booking
                  policy.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Payment Summary (matches confirmation Payment Summary) */}
              <Card className="payment-card">
                <CardHeader className="payment-card-header">
                  <CardTitle className="payment-card-title">
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="payment-card-content">
                  <div className="payment-row">
                    <span className="payment-label">Services Total:</span>
                    <span className="payment-value">
                      ${servicesTotal.toFixed(2)}
                    </span>
                  </div>

                  <hr className="payment-divider" />

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

                  <div className="payment-row">
                    <div>
                      <p className="payment-label-strong">Balance Due:</p>
                      <p className="payment-subtext">Payable at appointment</p>
                    </div>
                    <span className="payment-value payment-value-muted">
                      ${balanceDue.toFixed(2)}
                    </span>
                  </div>

                  <div className="payment-note">
                    <p className="payment-note-text">
                      <strong>Note:</strong> The 50% deposit ($
                      {depositAmount.toFixed(2)}) is non-refundable and secures
                      your appointment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Details */}
              <Card className="card-details-card">
                <CardHeader className="card-details-header">
                  <CardTitle className="text-base font-semibold">
                    Card Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-details-content">
                  <div className="card-details-field">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="Name on card"
                      value={cardDetails.name}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="card-details-field">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          number: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="card-details-row">
                    <div className="card-details-field">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            expiry: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="card-details-field">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cvv: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confirm Payment (matches confirmation button card style) */}
              <Card className="confirmation-actions-card">
                <CardContent className="confirmation-actions-content">
                  <div className="confirmation-amount-block">
                    <p className="confirmation-amount-label">Deposit Amount</p>
                    <p className="confirmation-amount-value">
                      ${depositAmount.toFixed(2)}
                    </p>
                    <p className="confirmation-amount-subtext">
                      (50% of ${servicesTotal.toFixed(2)} total)
                    </p>
                  </div>

                  <Button
                    className="confirmation-primary-btn"
                    onClick={handlePayment}
                    disabled={processing}
                  >
                    {processing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm &amp; Pay ${depositAmount.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="confirmation-helper-text">
                    By confirming, you agree to our terms of service and booking
                    policy.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
