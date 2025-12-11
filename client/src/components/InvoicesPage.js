// CustomerInvoicesScreen.jsx

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  CreditCard,
  Calendar,
  DollarSign,
} from "lucide-react";
import "../edit/InvoicesPage.css";

/* ---------- Generic UI components ---------- */

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
    <div className={`${className || "p-6 pt-0"}`} {...props}>
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

function Badge({ children, className = "", variant = "default", ...props }) {
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

function Table({ children, ...props }) {
  return (
    <table className="w-full text-sm border-collapse" {...props}>
      {children}
    </table>
  );
}
function TableHead({ children, className = "" }) {
  return <th className={`invoice-th ${className}`}>{children}</th>;
}
function TableHeader({ children }) {
  return <thead className="bg-muted">{children}</thead>;
}
function TableRow({ children, className = "" }) {
  return <tr className={`invoice-tr ${className}`}>{children}</tr>;
}
function TableCell({ children, colSpan, className = "" }) {
  return (
    <td className={`invoice-td ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

function Input(props) {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    />
  );
}
function Label({ children }) {
  return (
    <label className="text-sm font-medium leading-none block mb-1">
      {children}
    </label>
  );
}

/* Dialog skeleton */

function Dialog({ children }) {
  return <>{children}</>;
}
function DialogTrigger({ children, asChild = false }) {
  return asChild ? children : <button>{children}</button>;
}
function DialogContent({ children, className = "", onClose, ...props }) {
  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 border bg-popover rounded-lg shadow-lg w-full max-w-lg p-6 ${className}`}
      {...props}
    >
      {children}
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}
function DialogTitle({ children }) {
  return <h3 className="text-lg font-bold mb-1">{children}</h3>;
}
function DialogDescription({ children }) {
  return <div className="text-muted-foreground mb-2">{children}</div>;
}

/* Tabs */

function Tabs({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
function TabsList({ children, className }) {
  return (
    <div
      className={`inline-flex border rounded mb-2 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
function TabsTrigger({ children, isActive = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
        isActive ? "bg-primary text-primary-foreground" : "bg-background"
      }`}
    >
      {children}
    </button>
  );
}
function TabsContent({ children }) {
  return <div>{children}</div>;
}

/* ---------- Presentational InvoicesPage ---------- */

export function InvoicesPage({ user, invoices, onNavigate, onPayInvoice }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const safeInvoices = invoices || [];

  const filteredInvoices = safeInvoices.filter((inv) =>
    filterStatus === "all" ? true : inv.status === filterStatus
  );

  const sum = (items, predicate = () => true) =>
    items
      .filter(predicate)
      .reduce((acc, inv) => acc + Number(inv.amount || 0), 0);

  const totalAmount = sum(filteredInvoices);
  const totalPaid = sum(filteredInvoices, (inv) => inv.status === "paid");
  const totalPending = sum(filteredInvoices, (inv) => inv.status === "pending");
  const totalOverdue = sum(filteredInvoices, (inv) => inv.status === "overdue");

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "overdue":
        return "bg-red-500/10 text-red-500";
      default:
        return "";
    }
  };

  const closeDialog = () => setSelectedInvoice(null);

  return (
    <div className="invoices-container min-h-screen bg-background">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Invoices</h1>
            <p className="text-muted-foreground">
              Track and manage your veterinary invoices
            </p>
          </div>
          <Button
            variant="outline"
            className="btn-pill btn-pill-primary backToProfile"
            onClick={() => onNavigate("profile")}
          >
            Back to Profile
          </Button>
        </div>

        {/* Summary cards */}
        <div className="summary-grid">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Total</span>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-primary text-lg">
                ${totalAmount.toFixed(2)}
              </div>
              <p className="text-muted-foreground mt-1">
                {filteredInvoices.length} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Paid</span>
                <DollarSign className="w-4 h-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-primary text-lg">
                ${totalPaid.toFixed(2)}
              </div>
              <p className="text-muted-foreground mt-1">
                {filteredInvoices.filter((inv) => inv.status === "paid").length}{" "}
                invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Pending</span>
                <Calendar className="w-4 h-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-primary text-lg">
                ${totalPending.toFixed(2)}
              </div>
              <p className="text-muted-foreground mt-1">
                {
                  filteredInvoices.filter((inv) => inv.status === "pending")
                    .length
                }{" "}
                invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Overdue</span>
                <CreditCard className="w-4 h-4 text-red-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-primary text-lg">
                ${totalOverdue.toFixed(2)}
              </div>
              <p className="text-muted-foreground mt-1">
                {
                  filteredInvoices.filter((inv) => inv.status === "overdue")
                    .length
                }{" "}
                invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>View and manage your invoices</CardDescription>
          </CardHeader>
          <CardContent className="invoice-table-content">
            <Tabs className="mb-3">
              <TabsList className="invoice-tabs-list">
                <TabsTrigger
                  isActive={filterStatus === "all"}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  isActive={filterStatus === "paid"}
                  onClick={() => setFilterStatus("paid")}
                >
                  Paid
                </TabsTrigger>
                <TabsTrigger
                  isActive={filterStatus === "pending"}
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  isActive={filterStatus === "overdue"}
                  onClick={() => setFilterStatus("overdue")}
                >
                  Overdue
                </TabsTrigger>
              </TabsList>
              <TabsContent>
                <div className="invoice-table-wrapper">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Pet</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No invoices found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice) => {
                          const id = invoice._id || invoice.id;
                          const isOpen =
                            selectedInvoice &&
                            (selectedInvoice._id || selectedInvoice.id) === id;

                          return (
                            <TableRow key={id}>
                              <TableCell>{invoice.invoiceNumber}</TableCell>
                              <TableCell>
                                {invoice.date
                                  ? new Date(invoice.date).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell>{invoice.petName}</TableCell>
                              <TableCell>
                                <div className="max-w-[220px]">
                                  {(invoice.services || []).join(", ")}
                                </div>
                              </TableCell>
                              <TableCell>
                                ${Number(invoice.amount || 0).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(invoice.status)}
                                >
                                  {invoice.status
                                    ? invoice.status.charAt(0).toUpperCase() +
                                      invoice.status.slice(1)
                                    : ""}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setSelectedInvoice(invoice)
                                        }
                                      >
                                        <FileText className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    {isOpen && (
                                      <DialogContent
                                        className="max-w-2xl"
                                        onClose={closeDialog}
                                      >
                                        <DialogHeader>
                                          <DialogTitle>
                                            Invoice Details
                                          </DialogTitle>
                                          <DialogDescription>
                                            Invoice {invoice.invoiceNumber}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label>Invoice Number</Label>
                                              <p className="mt-1">
                                                {invoice.invoiceNumber}
                                              </p>
                                            </div>
                                            <div>
                                              <Label>Status</Label>
                                              <div className="mt-1">
                                                <Badge
                                                  variant="outline"
                                                  className={getStatusColor(
                                                    invoice.status
                                                  )}
                                                >
                                                  {invoice.status
                                                    ? invoice.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                      invoice.status.slice(1)
                                                    : ""}
                                                </Badge>
                                              </div>
                                            </div>
                                            <div>
                                              <Label>Date Issued</Label>
                                              <p className="mt-1">
                                                {invoice.date
                                                  ? new Date(
                                                      invoice.date
                                                    ).toLocaleDateString()
                                                  : "-"}
                                              </p>
                                            </div>
                                            <div>
                                              <Label>Due Date</Label>
                                              <p className="mt-1">
                                                {invoice.dueDate
                                                  ? new Date(
                                                      invoice.dueDate
                                                    ).toLocaleDateString()
                                                  : "-"}
                                              </p>
                                            </div>
                                            <div>
                                              <Label>Pet</Label>
                                              <p className="mt-1">
                                                {invoice.petName}
                                              </p>
                                            </div>
                                            {invoice.paidDate && (
                                              <div>
                                                <Label>Paid Date</Label>
                                                <p className="mt-1">
                                                  {new Date(
                                                    invoice.paidDate
                                                  ).toLocaleDateString()}
                                                </p>
                                              </div>
                                            )}
                                            {invoice.paymentMethod && (
                                              <div>
                                                <Label>Payment Method</Label>
                                                <p className="mt-1">
                                                  {invoice.paymentMethod}
                                                </p>
                                              </div>
                                            )}
                                          </div>

                                          <div>
                                            <Label>Services</Label>
                                            <div className="mt-2 space-y-2">
                                              {(invoice.services || []).map(
                                                (service, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="flex justify-between p-2 bg-muted rounded"
                                                  >
                                                    <span>{service}</span>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>

                                          <div className="border-t pt-4">
                                            <div className="flex justify-between">
                                              <span>Total Amount</span>
                                              <span>
                                                $
                                                {Number(
                                                  invoice.amount || 0
                                                ).toFixed(2)}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="flex gap-2 justify-end">
                                            <Button variant="outline">
                                              <Download className="w-4 h-4 mr-2" />
                                              Download PDF
                                            </Button>
                                            {invoice.status !== "paid" && (
                                              <Button
                                                onClick={() =>
                                                  onPayInvoice(invoice)
                                                }
                                              >
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                Pay Now
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </DialogContent>
                                    )}
                                  </Dialog>
                                  {invoice.status !== "paid" && (
                                    <Button
                                      size="sm"
                                      onClick={() => onPayInvoice(invoice)}
                                    >
                                      Pay
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Container that connects to API / MongoDB ---------- */

export function InvoicesContainer({ user, onNavigate }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiFetch = async (path, options = {}) => {
    const res = await fetch(`http://localhost:5000${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  };

  // load invoices from /api/invoices (customer route)
  useEffect(() => {
    if (!user?.token) return;

    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/invoices");
        setInvoices(data);
      } catch (err) {
        console.error("Failed to load invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [user]);

  const handlePayInvoice = async (invoice) => {
    try {
      const updated = await apiFetch(`/api/invoices/${invoice._id}/pay`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod: "card" }),
      });
      setInvoices((prev) =>
        prev.map((inv) => (inv._id === updated._id ? updated : inv))
      );
    } catch (err) {
      console.error("Failed to pay invoice:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  return (
    <InvoicesPage
      user={user}
      invoices={invoices}
      onNavigate={onNavigate}
      onPayInvoice={handlePayInvoice}
    />
  );
}