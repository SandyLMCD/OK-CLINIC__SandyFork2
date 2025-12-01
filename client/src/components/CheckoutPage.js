import { useState } from "react";
import { Calendar, Clock, Heart, CheckCircle } from "lucide-react";

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
    <label
      className="text-sm font-medium leading-none block mb-1"
      {...props}
    >
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
      services: services.map((s) => s.name), // matches Invoice.services: [String]
      amount: servicesTotal,
      invoiceNumber: `INV-${Date.now()}`,
      date: today,
      dueDate: today,
      // status, paymentMethod, paidDate will be set by routes/invoice.js
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
    return data; // created invoice document
  };

  const handlePayment = async () => {
    if (processing) return;
    try {
      setProcessing(true);
      // simulate card processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const invoice = await createInvoice();
      onPaymentComplete(invoice);
    } catch (err) {
      console.error("Payment / invoice error:", err);
      // optional: show toast or alert here
    } finally {
      setProcessing(false);
    }
  };

  const handleFreeBooking = async () => {
    try {
      const invoice = await createInvoice(); // still create invoice even if amount is 0
      onPaymentComplete(invoice);
    } catch (err) {
      console.error("Free booking / invoice error:", err);
    }
  };

  // Basic guard: if key fields are missing, send user back
  if (!appointment?.date || !appointment?.time || !appointment?.pet) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1>Checkout</h1>
        <p className="text-muted-foreground">
          Review and confirm your appointment
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Appointment Details */}
        <div className="space-y-6">
          {/* Appointment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{new Date(appointment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Pet</p>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p>{appointment.pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.pet.breed} • {appointment.pet.age} years old
                    </p>
                  </div>
                  <Badge variant="outline">{appointment.pet.species}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Services</CardTitle>
            </CardHeader>
            <CardContent>
              {isBookingOnly ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3>Booking Only - Free</h3>
                  <p className="text-muted-foreground">
                    No paid services selected. Your appointment has no deposit.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id || service._id || service.name}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p>{service.name}</p>
                        {service.duration != null && (
                          <p className="text-sm text-muted-foreground">
                            {service.duration} minutes
                          </p>
                        )}
                      </div>
                      <p>${Number(service.price || 0).toFixed(2)}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Services Total:
                    </span>
                    <span>${servicesTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-start border-t pt-3">
                    <div>
                      <p>50% Deposit Required</p>
                      <p className="text-sm text-muted-foreground">
                        Non-refundable
                      </p>
                    </div>
                    <p className="text-lg">${depositAmount.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Balance Due (at appointment):</span>
                    <span>${balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment */}
        <div className="space-y-6">
          {isBookingOnly ? (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3>No Payment Required</h3>
                  <p className="text-muted-foreground mb-6">
                    Your appointment booking does not require a deposit. Click
                    below to confirm.
                  </p>
                  <Button className="w-full" onClick={handleFreeBooking}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    By confirming, you agree to our terms of service and booking
                    policy.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Pay 50% deposit (${depositAmount.toFixed(2)}) to secure your
                    appointment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                    <p className="text-sm">
                      <strong>Note:</strong> The deposit is non-refundable.
                      Remaining balance (${balanceDue.toFixed(2)}) is due at
                      your appointment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
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
                  <div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
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
                    <div>
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

              {/* Confirm Payment */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-muted-foreground">Deposit Amount</p>
                      <p className="text-2xl font-semibold">
                        ${depositAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (50% of ${servicesTotal.toFixed(2)} total)
                      </p>
                    </div>
                    <Button
                      className="w-full"
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
                    <p className="text-xs text-muted-foreground text-center">
                      By confirming, you agree to our terms of service and
                      booking policy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
