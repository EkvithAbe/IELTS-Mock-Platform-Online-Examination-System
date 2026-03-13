import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SpeakingAppointment() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    timezone: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData((prev) => ({
      ...prev,
      phone: parsedUser.phone || "",
    }));
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openEmailRequest = () => {
    const subject = encodeURIComponent("Speaking Test Appointment Request");
    const body = encodeURIComponent(
      `Hello Admin,

I would like to book a speaking test appointment.

Name: ${user?.name || "Student"}
Email: ${user?.email || ""}
Phone/WhatsApp: ${formData.phone}
Preferred Date: ${formData.preferredDate}
Preferred Time: ${formData.preferredTime} ${formData.timezone}

Notes:
${formData.notes || "N/A"}

Thank you!`
    );
    window.location.href = `mailto:info@ieltsmock.com?subject=${subject}&body=${body}`;
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I purchased the IELTS package and want to book my speaking test.\nName: ${user?.name || "Student"}\nPreferred: ${formData.preferredDate} ${formData.preferredTime} ${formData.timezone}\nNotes: ${formData.notes || "N/A"}`
    );
    window.open(`https://wa.me/1234567890?text=${message}`, "_blank");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    openEmailRequest();
    alert("We opened your email client with a pre-filled request. The admin will confirm your slot.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Book Speaking Appointment - IELTS Mock Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/dashboard" className="text-2xl font-bold text-blue-600">
                IELTS Mock Platform
              </a>
              <button
                onClick={() => router.back()}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                ← Back
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="text-6xl">🎤</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Book Your Speaking Test Appointment
                </h1>
                <p className="text-gray-600">
                  Speaking tests are scheduled live with an examiner. Share your preferred date and time, and our admin will confirm your slot.
                </p>
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p>• Sessions run between 10:00 AM – 7:00 PM (local time).</p>
                  <p>• You will receive a Zoom/WhatsApp call link after confirmation.</p>
                  <p>• Bring a valid ID during the call.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Appointment Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <input
                      type="text"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      placeholder="e.g. GMT+5 (Pakistan)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Number for the call"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes for Admin</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Share any constraints or ID details"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Send Email Request
                  </button>
                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Message on WhatsApp
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Need help?</h3>
              <p className="text-gray-600 text-sm">
                If you have trouble booking a slot, contact our admin directly:
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Email:</span>
                  <a href="mailto:info@ieltsmock.com" className="text-blue-600 hover:underline">
                    info@ieltsmock.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">WhatsApp:</span>
                  <a
                    href="https://wa.me/1234567890"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    +123 456 7890
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Office Hours:</span>
                  <span>Mon–Sat, 10:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
