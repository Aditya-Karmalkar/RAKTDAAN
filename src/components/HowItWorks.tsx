import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BellRing,
  ShieldCheck,
  Smartphone,
  BarChart3,
  Clock,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

type Step = {
  title: string;
  desc: string;
  color: "red" | "blue";
  index: number;
};

const donorSteps: Step[] = [
  { index: 1, title: "Register", desc: "Sign up and provide your basic information, blood type, and location.", color: "red" },
  { index: 2, title: "Get Alerts", desc: "Receive real-time SOS alerts when hospitals near you need your blood type.", color: "red" },
  { index: 3, title: "Respond", desc: "Choose to help and get instant contact details of the requesting hospital.", color: "red" },
  { index: 4, title: "Save Lives", desc: "Visit the hospital and donate blood to save precious lives.", color: "red" },
];

const hospitalSteps: Step[] = [
  { index: 1, title: "Register & Verify", desc: "Register your hospital and get verified by our team for authenticity.", color: "blue" },
  { index: 2, title: "Send SOS Alert", desc: "Create urgent blood requests with specific requirements and urgency level.", color: "blue" },
  { index: 3, title: "Get Responses", desc: "Receive instant responses from nearby donors willing to help.", color: "blue" },
  { index: 4, title: "Coordinate", desc: "Manage donor visits and track blood collection through your dashboard.", color: "blue" },
];

const features = [
  { icon: BellRing, title: "Real‑time Alerts", desc: "Instant notifications for urgent blood requirements." },
  { icon: Smartphone, title: "Location Matching", desc: "Connect with the nearest available donors." },
  { icon: ShieldCheck, title: "Verified Network", desc: "All hospitals and donors are verified for safety." },
  { icon: Smartphone, title: "Mobile‑first", desc: "Optimized for quick on‑the‑go access." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track donations and manage requests efficiently." },
  { icon: Clock, title: "24/7 Availability", desc: "Round‑the‑clock service for emergencies." },
];

function StepCard({ step }: { step: Step }) {
  const color = step.color === "red" ? "red" : "blue";
  const circle = color === "red" ? "bg-red-600" : "bg-blue-600";
  const ring = color === "red" ? "ring-red-100" : "ring-blue-100";

  return (
    <motion.li variants={item} className="group flex flex-col items-center text-center" whileHover={{ y: -4 }}>
      <div className={`w-16 h-16 ${circle} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md mb-4`}>
        {step.index}
      </div>
      <div className={`w-full max-w-xs bg-white rounded-xl shadow-sm ring-1 ${ring} p-5 transition-all hover:shadow-lg`}>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
        <p className="text-gray-600 text-sm">{step.desc}</p>
      </div>
    </motion.li>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <motion.div variants={item} className="group p-6 bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
        <Icon className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            How It <span className="text-red-600">Works</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Simple steps to connect life‑savers with those in need.
          </motion.p>
        </header>

        {/* For Donors */}
        <section aria-labelledby="donors" className="mb-20">
          <div className="text-center mb-10">
            <h2 id="donors" className="text-3xl font-bold text-gray-900 mb-2">For Donors</h2>
            <p className="text-lg text-gray-600">Become a hero in just a few steps</p>
          </div>
          <motion.ol variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {donorSteps.map((s) => (
              <StepCard step={s} key={`d-${s.index}`} />
            ))}
          </motion.ol>
        </section>

        {/* For Hospitals */}
        <section aria-labelledby="hospitals" className="mb-20">
          <div className="text-center mb-10">
            <h2 id="hospitals" className="text-3xl font-bold text-gray-900 mb-2">For Hospitals</h2>
            <p className="text-lg text-gray-600">Get the blood you need, when you need it</p>
          </div>
          <motion.ol variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {hospitalSteps.map((s) => (
              <StepCard step={s} key={`h-${s.index}`} />
            ))}
          </motion.ol>
        </section>

        {/* Key Features */}
        <section className="bg-white rounded-2xl p-8 md:p-12 ring-1 ring-gray-100 shadow-sm">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Key Features</h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </motion.div>
          { <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-3">
            <Button className="h-11 px-6 text-base rounded-xl">Become a Donor</Button>
            <Button variant="secondary" className="h-11 px-6 text-base rounded-xl">Register Hospital</Button>
          </div> }
        </section>
      </div>
    </div>
  );
}
