
RAKTDAAN 🩸
Connecting Blood Donors & Recipients Instantly




🌟 Project Overview
RAKTDAAN is a real-time blood donation platform that connects donors, recipients, hospitals, and administrators through a centralized system. Designed with responsiveness, urgency, and simplicity in mind, it helps bridge the life-saving gap in critical moments.

💡 “One unit of blood can save up to three lives. Be the reason someone lives. Be a donor. Be a hero.”

📸 Live Demo →
🎯 Project Purpose
Facilitate real-time donor-recipient matching

Enable emergency blood requests (SOS) from hospitals or individuals

Maintain donation history and availability status

Provide a secure admin dashboard for management

Encourage and organize voluntary blood donation

📋 Features
🧑‍💉 Donor Features
Quick & secure donor registration

Update availability and location in real-time

View donation history

Receive alerts for nearby requests

🏥 Hospital Features
Raise emergency SOS alerts

Manage blood request inventory

View matched donors by group/location

🚨 Emergency System
Location-based real-time matching

Auto-alerts to eligible donors nearby

🛡️ Admin Dashboard
View, verify, and manage donor/hospital registrations

Monitor active requests

Control user roles and platform statistics

🛠️ Tech Stack
Layer	Technology
Frontend	React 19, Vite, Tailwind CSS
Backend	Convex (serverless functions, DB, and auth)
Other	Firebase (auth & uploads), Location Services (GeoLocation API), Netlify (deployment)

🚀 Getting Started
🔧 Prerequisites
Node.js ≥ 18

Git

Convex CLI & Firebase CLI (optional)

📥 Clone & Install
bash
Copy
Edit
git clone https://github.com/Aditya-Karmalkar/RAKTDAAN.git
cd RAKTDAAN
npm install
🧪 Environment Setup
Create a .env file in the root with the following variables:

env
Copy
Edit
VITE_CONVEX_URL=your_convex_url
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
🖥️ Run the App
bash
Copy
Edit
npm run dev
Visit: http://localhost:5173

📁 Project Structure
bash
Copy
Edit
RAKTDAAN/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level components
│   ├── convex/            # Backend functions (Convex)
│   ├── firebase/          # Firebase config
│   └── utils/             # Helpers (e.g., geolocation, form validators)
├── .env
└── vite.config.js
🔐 Admin Access (For Reviewers)
🧪 Test Credentials

✅ Features:

Donor list & verification

SOS request monitoring

Stats dashboard

User role management

🤝 Contributing
We welcome contributions from developers, designers, and medical volunteers!

How to Contribute:
Fork the repo

Create a new branch: feature/your-feature

Submit a PR with detailed description

📬 For any queries or suggestions, reach out via issues

🙏 Acknowledgments
Convex.dev for enabling real-time backend features

Firebase for streamlined authentication

Tailwind CSS for a clean, modern UI


📄 License
This project is licensed under the MIT License.
Feel free to use, adapt, and expand it for educational or non-profit initiatives.