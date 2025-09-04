import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const palette = {
	High: {
		badgeClasses: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
		hex: { base: '#dc2626', light: '#fee2e2', ring: '#fecaca', text: '#991b1b' },
	},
	Medium: {
		badgeClasses: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200',
		hex: { base: '#f59e0b', light: '#fef3c7', ring: '#fde68a', text: '#92400e' },
	},
	Low: {
		badgeClasses: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200',
		hex: { base: '#16a34a', light: '#dcfce7', ring: '#bbf7d0', text: '#166534' },
	},
};
const getUrgencyKey = (u) => (u === 'High' ? 'High' : u === 'Medium' ? 'Medium' : 'Low');
const urgencyBadgeClasses = (u) => palette[getUrgencyKey(u)].badgeClasses;
const urgencyStyleFallback = (u) => {
	const p = palette[getUrgencyKey(u)].hex;
	return { backgroundColor: p.light, color: p.text, border: `1px inset ${p.ring}` };
};
const buildMarkerIcon = (color) =>
	L.divIcon({
		className: 'custom-marker',
		html: `<span style="display:inline-block;background:${color};border:2px solid #fff;width:14px;height:14px;border-radius:9999px;box-shadow:0 0 0 2px rgba(0,0,0,0.2)"></span>`,
		iconSize: [16, 16],
		iconAnchor: [8, 8],
	});

const DropletIcon = ({ color = '#dc2626', className = 'w-4 h-4' }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} className={className} width="16" height="16">
		<path d="M12.66 2.58a1 1 0 0 0-1.32 0C8.4 5.21 5 9.12 5 12.5A7 7 0 0 0 12 19.5a7 7 0 0 0 7-7c0-3.38-3.4-7.29-6.34-9.92z" />
	</svg>
);
const PinIcon = ({ color = '#dc2626', className = 'w-4 h-4' }) => (
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke={color} className={className} width="16" height="16">
		<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
	</svg>
);

const PendingRequests = () => {
	const [view, setView] = useState('list');
	const [bloodFilter, setBloodFilter] = useState('All');
	const [urgencyFilter, setUrgencyFilter] = useState('All');

	const requests = useMemo(
		() => [
			{ id: 'req-1', hospital: 'All India Institute of Medical Sciences', bloodType: 'A+', units: 4, urgency: 'High', deadline: '2025-09-05 18:00', city: 'New Delhi', location: { lat: 28.6139, lng: 77.209 } },
			{ id: 'req-2', hospital: 'Tata Memorial Hospital', bloodType: 'O-', units: 2, urgency: 'Medium', deadline: '2025-09-08 12:00', city: 'Mumbai', location: { lat: 19.076, lng: 72.8777 } },
			{ id: 'req-3', hospital: 'Christian Medical College', bloodType: 'B+', units: 6, urgency: 'High', deadline: '2025-09-04 09:00', city: 'Vellore', location: { lat: 12.9165, lng: 79.1325 } },
			{ id: 'req-4', hospital: 'Apollo Hospitals', bloodType: 'AB-', units: 3, urgency: 'Low', deadline: '2025-09-12 17:30', city: 'Hyderabad', location: { lat: 17.385, lng: 78.4867 } },
			{ id: 'req-5', hospital: 'Fortis Hospital', bloodType: 'O+', units: 5, urgency: 'Medium', deadline: '2025-09-07 15:00', city: 'Bengaluru', location: { lat: 12.9716, lng: 77.5946 } },
		],
		[]
	);

	// Unique blood types for filter options
	const bloodOptions = useMemo(() => {
		const set = new Set(requests.map((r) => r.bloodType));
		return ['All', ...Array.from(set)];
	}, [requests]);

	// Apply filters
	const filtered = useMemo(() => {
		return requests.filter((r) => {
			const byBlood = bloodFilter === 'All' || r.bloodType === bloodFilter;
			const byUrg = urgencyFilter === 'All' || r.urgency === urgencyFilter;
			return byBlood && byUrg;
		});
	}, [requests, bloodFilter, urgencyFilter]);

	const Toggle = () => (
		<div className="inline-flex rounded-full bg-red-50 p-1 ring-1 ring-inset ring-red-200" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9999, padding: 4 }}>
			<button type="button" onClick={() => setView('list')}
				className={view === 'list' ? 'bg-white text-red-700 shadow px-4 py-2 rounded-full' : 'text-red-600 hover:text-red-700 px-4 py-2 rounded-full'}
				style={view === 'list' ? { background: '#fff', color: '#b91c1c', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', borderRadius: 9999 } : { color: '#dc2626', borderRadius: 9999 }}>
				List View
			</button>
			<button type="button" onClick={() => setView('map')}
				className={view === 'map' ? 'bg-white text-red-700 shadow px-4 py-2 rounded-full' : 'text-red-600 hover:text-red-700 px-4 py-2 rounded-full'}
				style={view === 'map' ? { background: '#fff', color: '#b91c1c', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', borderRadius: 9999 } : { color: '#dc2626', borderRadius: 9999 }}>
				Map View
			</button>
		</div>
	);

	return (
		<section className="w-full" style={{ backgroundColor: '#fff1f2', minHeight: '100vh', padding: '24px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
				<h2 className="text-xl sm:text-2xl font-semibold text-gray-900" style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>
					Pending Blood Requests
				</h2>
				<Toggle />
			</div>

			{/* Filters */}
			<div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
				<label style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>
					Blood Type:
					<select
						value={bloodFilter}
						onChange={(e) => setBloodFilter(e.target.value)}
						className="ml-2 rounded-full border-gray-300 text-sm"
						style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 9999, border: '1px solid #e5e7eb', background: '#fff' }}
					>
						{bloodOptions.map((opt) => (
							<option key={opt} value={opt}>{opt}</option>
						))}
					</select>
				</label>

				<label style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>
					Urgency:
					<select
						value={urgencyFilter}
						onChange={(e) => setUrgencyFilter(e.target.value)}
						className="ml-2 rounded-full border-gray-300 text-sm"
						style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 9999, border: '1px solid #e5e7eb', background: '#fff' }}
					>
						{['All', 'High', 'Medium', 'Low'].map((opt) => (
							<option key={opt} value={opt}>{opt}</option>
						))}
					</select>
				</label>

				<button
					type="button"
					onClick={() => { setBloodFilter('All'); setUrgencyFilter('All'); }}
					className="rounded-full px-3 py-2 text-sm font-medium text-white"
					style={{ background: '#6b7280', borderRadius: 9999, padding: '8px 12px' }}
				>
					Reset
				</button>
			</div>

			{view === 'list' && (
				<div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: 'transparent', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200" style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead className="bg-red-50" style={{ backgroundColor: '#fef2f2' }}>
								<tr>
									{['Hospital','Blood Type','Units','Urgency','Deadline','Location','Action'].map((h) => (
										<th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-red-700"
											style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, letterSpacing: 0.6, color: '#b91c1c', borderBottom: '1px solid #e5e7eb' }}>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100" style={{ background: 'transparent' }}>
								{filtered.map((req) => {
									const p = palette[getUrgencyKey(req.urgency)].hex;
									return (
										<tr key={req.id} className="hover:bg-red-50/40 transition" style={{ borderLeft: `4px solid ${p.base}`, background: 'transparent' }}>
											<td className="px-4 py-4 whitespace-nowrap" style={{ padding: '12px 16px' }}>
												<div className="text-sm font-medium text-gray-900" style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{req.hospital}</div>
												<div className="text-xs text-gray-500" style={{ fontSize: 12, color: '#6b7280' }}>{req.city}</div>
											</td>
											<td className="px-4 py-4 whitespace-nowrap" style={{ padding: '12px 16px' }}>
												<div className="inline-flex items-center gap-2 text-gray-700" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#374151' }}>
													<DropletIcon color={p.base} />
													<span className="text-sm font-medium" style={{ fontSize: 14, fontWeight: 500 }}>{req.bloodType}</span>
												</div>
											</td>
											<td className="px-4 py-4 whitespace-nowrap" style={{ padding: '12px 16px' }}>
												<span className="text-sm text-gray-700" style={{ fontSize: 14, color: '#374151' }}>{req.units}</span>
											</td>
											<td className="px-4 py-4 whitespace-nowrap" style={{ padding: '12px 16px' }}>
												<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${urgencyBadgeClasses(req.urgency)}`}
													style={{ ...urgencyStyleFallback(req.urgency), borderRadius: 9999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
													{req.urgency}
												</span>
											</td>
											<td className="px-4 py-4 whitespace-nowrap" style={{ padding: '12px 16px' }}>
												<span className="text-sm text-gray-700" style={{ fontSize: 14, color: '#374151' }}>{req.deadline}</span>
											</td>
											<td className="px-4 py-4 whitespace-nowrap" style={{ padding: '12px 16px' }}>
												<div className="inline-flex items-center gap-2 text-gray-700" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#374151' }}>
													<PinIcon color={p.base} />
													<span className="text-sm" style={{ fontSize: 14 }}>{req.city}</span>
												</div>
											</td>
											<td className="px-4 py-4 whitespace-nowrap text-right" style={{ padding: '12px 16px', textAlign: 'right' }}>
												<button type="button" className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
													style={{ background: p.base, color: '#fff', borderRadius: 9999, padding: '8px 16px', fontSize: 14, fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
													onClick={() => alert(`Proceed to donate for ${req.hospital}`)}>
													Donate Now
												</button>
											</td>
										</tr>
									);
								})}
								{filtered.length === 0 && (
									<tr>
										<td colSpan={7} style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>No requests match your filters.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{view === 'map' && (
				<div className="h-[480px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm"
					style={{ height: 480, width: '100%', overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: 12, background: 'transparent', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
					<MapContainer center={[22.9734, 78.6569]} zoom={5} scrollWheelZoom className="h-full w-full" zoomControl={true} style={{ height: '100%', width: '100%' }}>
						<TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
						{filtered.map((req) => {
							const p = palette[getUrgencyKey(req.urgency)].hex;
							const icon = buildMarkerIcon(p.base);
							return (
								<Marker key={req.id} position={[req.location.lat, req.location.lng]} icon={icon}>
									<Popup>
										<div className="space-y-1">
											<div className="font-semibold text-gray-900" style={{ fontWeight: 600, color: '#111827' }}>{req.hospital}</div>
											<div className="text-sm text-gray-700" style={{ fontSize: 14, color: '#374151' }}>City: {req.city}</div>
											<div className="text-sm text-gray-700" style={{ fontSize: 14, color: '#374151' }}>Blood: {req.bloodType}</div>
											<div className="text-sm text-gray-700" style={{ fontSize: 14, color: '#374151' }}>Units: {req.units}</div>
											<div className="text-sm">
												<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${urgencyBadgeClasses(req.urgency)}`}
													style={{ ...urgencyStyleFallback(req.urgency), borderRadius: 9999, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
													{req.urgency} urgency
												</span>
											</div>
											<div className="text-sm text-gray-700" style={{ fontSize: 14, color: '#374151' }}>Deadline: {req.deadline}</div>
											<div className="pt-2" style={{ paddingTop: 8 }}>
												<button type="button" className="w-full rounded-full px-3 py-2 text-sm font-semibold text-white shadow-sm transition"
													style={{ width: '100%', background: p.base, color: '#fff', borderRadius: 9999, padding: '8px 12px', fontSize: 14, fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
													onClick={() => alert(`Proceed to donate for ${req.hospital}`)}>
													Donate Now
												</button>
											</div>
										</div>
									</Popup>
								</Marker>
							);
						})}
						{filtered.length === 0 && null}
					</MapContainer>
				</div>
			)}
		</section>
	);
};

export default PendingRequests;