import React, { useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';

// UI components
function Card({ children, className = '', ...props }) {
  return <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`} {...props}>{children}</div>;
}
function CardHeader({ children, className = '', ...props }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>;
}
function CardTitle({ children, className = '' }) {
  return <h2 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
}
function CardDescription({ children, className = '' }) {
  return <p className={`text-muted-foreground text-sm ${className}`}>{children}</p>;
}
function CardContent({ children, className = '', ...props }) {
  return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;
}
function Button({ children, variant = "default", size = "default", className = '', ...props }) {
  const base = "inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm",
    outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm",
    ghost: "hover:bg-accent hover:text-accent-foreground px-2 py-1 text-sm"
  };
  const sizes = {
    default: "",
    sm: "h-8 px-2 text-xs",
  };
  return (
    <button className={`${base} ${variants[variant] || ""} ${sizes[size] || ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
function Input(props) {
  return <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring" {...props} />;
}
function Label({ children, ...props }) {
  return <label className="text-sm font-medium leading-none block mb-1" {...props}>{children}</label>;
}
function Textarea(props) {
  return <textarea className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring" {...props} />;
}

export function FeedbackPage({ user, onNavigate }) {
  const [feedbackForm, setFeedbackForm] = useState({
    category: '',
    subject: '',
    message: '',
    rating: 0
  });
  const [selectOpen, setSelectOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!feedbackForm.category || !feedbackForm.subject || !feedbackForm.message || feedbackForm.rating === 0) {
    alert('Please fill in all fields and provide a rating');
    return;
  }

  try {
    setSubmitting(true);

    const res = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(user?.token ? { Authorization: 'Bearer ' + user.token } : {})
  },
  body: JSON.stringify({
    category: feedbackForm.category,
    subject: feedbackForm.subject,
    message: feedbackForm.message,
    rating: feedbackForm.rating
  })
});


    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      // ignore if no body
    }

    if (!res.ok || data.success === false) {
      alert('Submission error: ' + (data.error || 'Unknown error'));
      return;
    }

    alert('Thank you for your feedback! We appreciate your input.');

    setFeedbackForm({
      category: '',
      subject: '',
      message: '',
      rating: 0
    });
  } catch (err) {
    alert('Failed to submit feedback. Please try again.');
  } finally {
    setSubmitting(false);
  }
};


  const StarRating = () => (
    <div className="flex gap-2 mb-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
          className="focus:outline-none transition-colors"
        >
          <Star
            className={`w-8 h-8 ${
              star <= feedbackForm.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2">Share Your Feedback</h1>
          <p className="text-muted-foreground">
            We value your opinion! Let us know about your experience with PawCare Veterinary.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Feedback Form
            </CardTitle>
            <CardDescription>
              Your feedback helps us improve our services for you and your pets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>How would you rate your overall experience?</Label>
                <StarRating />
                {feedbackForm.rating > 0 && (
                  <p className="text-muted-foreground">
                    {feedbackForm.rating === 1 && 'Poor'}
                    {feedbackForm.rating === 2 && 'Fair'}
                    {feedbackForm.rating === 3 && 'Good'}
                    {feedbackForm.rating === 4 && 'Very Good'}
                    {feedbackForm.rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    className="flex items-center w-full border border-input rounded px-3 py-2 bg-background justify-between text-start text-sm"
                    onClick={() => setSelectOpen(!selectOpen)}
                  >
                    <span>
                      {feedbackForm.category
                        ? {
                            'service-quality': 'Service Quality',
                            'staff-behavior': 'Staff Behavior',
                            'facility-cleanliness': 'Facility Cleanliness',
                            'appointment-booking': 'Appointment Booking',
                            'pricing': 'Pricing',
                            'wait-time': 'Wait Time',
                            'other': 'Other'
                          }[feedbackForm.category] || "Select a category"
                        : "Select a category"}
                    </span>
                    <span className="ml-2">&#9662;</span>
                  </button>
                  {selectOpen && (
                    <div className="absolute z-10 bg-popover border border-border rounded mt-1 w-full">
                      {[
                        ['service-quality', 'Service Quality'],
                        ['staff-behavior', 'Staff Behavior'],
                        ['facility-cleanliness', 'Facility Cleanliness'],
                        ['appointment-booking', 'Appointment Booking'],
                        ['pricing', 'Pricing'],
                        ['wait-time', 'Wait Time'],
                        ['other', 'Other'],
                      ].map(([value, label]) => (
                        <div
                          key={value}
                          className="px-4 py-2 cursor-pointer hover:bg-muted"
                          onClick={() => {
                            setFeedbackForm({ ...feedbackForm, category: value });
                            setSelectOpen(false);
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your feedback"
                  value={feedbackForm.subject}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, subject: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Feedback</Label>
                <Textarea
                  id="message"
                  placeholder="Please share your thoughts, suggestions, or concerns..."
                  rows={6}
                  value={feedbackForm.message}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, message: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate('profile')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Need immediate assistance? Reach out to us directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p>(555) 123-4567</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p>support@pawcare.com</p>
            </div>
            <div>
              <p className="text-muted-foreground">Hours</p>
              <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
