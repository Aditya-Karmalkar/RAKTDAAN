

import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PendingRequests = () => {
	const [view, setView] = useState('list'); // 'list' | 'map'

	// Dummy requests across India
	const requests = useMemo(
		() => [
			{
				id: 'req-1',
				hospital: 'All India Institute of Medical Sciences',
				bloodType: 'A+',
				units: 4,
				urgency: 'High',
				deadline: '2025-09-05 18:00',
				city: 'New Delhi',
				location: { lat: 28.6139, lng: 77.209 },
			},
			{
				id: 'req-2',
				hospital: 'Tata Memorial Hospital',
				bloodType: 'O-',
				units: 2,
				urgency: 'Medium',
				deadline: '2025-09-08 12:00',
				city: 'Mumbai',
				location: { lat: 19.076, lng: 72.8777 },
			},
			{
				id: 'req-3',
				hospital: 'Christian Medical College',
				bloodType: 'B+',
				units: 6,
				urgency: 'High',
				deadline: '2025-09-04 09:00',
				city: 'Vellore',
				location: { lat: 12.9165, lng: 79.1325 },
			},
			{
				id: 'req-4',
				hospital: 'Apollo Hospitals',
				bloodType: 'AB-',
				units: 3,
				urgency: 'Low',
				deadline: '2025-09-12 17:30',
				city: 'Hyderabad',
				location: { lat: 17.385, lng: 78.4867 },
			},
			{
				id: 'req-5',
				hospital: 'Fortis Hospital',
				bloodType: 'O+',
				units: 5,
				urgency: 'Medium',
				deadline: '2025-09-07 15:00',
				city: 'Bengaluru',
				location: { lat: 12.9716, lng: 77.5946 },
			},
		],
		[]
	);

	// Red themed DivIcon for markers (avoids asset path issues)
	const markerIcon = useMemo(
		() =>
			L.divIcon({
				className: 'custom-marker',
				html:
					'<span style="display:inline-block;background:#dc2626;border:2px solid #fff;width:14px;height:14px;border-radius:9999px;box-shadow:0 0 0 2px rgba(0,0,0,0.2)"></span>',
				iconSize: [16, 16],
				iconAnchor: [8, 8],
			}),
		[]
	);

	const getUrgencyBadgeClasses = (urgency) => {
		switch (urgency) {
			case 'High':
				return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200';
			case 'Medium':
				return 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200';
			default:
				return 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200';
		}
	};

	const DropletIcon = ({ className = 'w-4 h-4' }) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
			<path d="M12.66 2.58a1 1 0 0 0-1.32 0C8.4 5.21 5 9.12 5 12.5A7 7 0 0 0 12 19.5a7 7 0 0 0 7-7c0-3.38-3.4-7.29-6.34-9.92z" />
		</svg>
	);

	const PinIcon = ({ className = 'w-4 h-4' }) => (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className={className}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
			<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
		</svg>
	);

	const Toggle = () => (
		<div className="inline-flex rounded-full bg-red-50 p-1 ring-1 ring-inset ring-red-200">
			<button
				type="button"
				onClick={() => setView('list')}
				className={`px-4 py-2 text-sm font-medium rounded-full transition ${
					view === 'list'
						? 'bg-white text-red-700 shadow'
						: 'text-red-600 hover:text-red-700 hover:bg-white/70'
				}`}
			>
				List View
			</button>
			<button
				type="button"
				onClick={() => setView('map')}
				className={`px-4 py-2 text-sm font-medium rounded-full transition ${
					view === 'map'
						? 'bg-white text-red-700 shadow'
						: 'text-red-600 hover:text-red-700 hover:bg-white/70'
				}`}
			>
				Map View
			</button>
		</div>
	);

	return (
		<section className="w-full">
			<div className="mb-6 flex items-center justify-between gap-4">
				<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Pending Blood Requests</h2>
				<Toggle />
			</div>

			{/* List View */}
			{view === 'list' && (
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-red-50">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-red-700">Hospital</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-red-700">Blood Type</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-red-700">Units</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-red-700">Urgency</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-red-700">Deadline</th>
									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-red-700">Location</th>
									<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-red-700">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100 bg-white">
								{requests.map((req) => (
									<tr key={req.id} className="hover:bg-red-50/40 transition">
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">{req.hospital}</div>
											<div className="text-xs text-gray-500">{req.city}</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="inline-flex items-center gap-2 text-gray-700">
												<span className="text-red-600">
													<DropletIcon className="w-4 h-4" />
												</span>
												<span className="text-sm font-medium">{req.bloodType}</span>
											</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-700">{req.units}</span>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getUrgencyBadgeClasses(req.urgency)}`}>
												{req.urgency}
											</span>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-700">{req.deadline}</span>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="inline-flex items-center gap-2 text-gray-700">
												<span className="text-red-600">
													<PinIcon className="w-4 h-4" />
												</span>
												<span className="text-sm">{req.city}</span>
											</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap text-right">
											<button
												type="button"
												className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
												onClick={() => alert(`Proceed to donate for ${req.hospital}`)}
											>
												Donate Now
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Map View */}
			{view === 'map' && (
				<div className="h-[480px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<MapContainer
						center={[22.9734, 78.6569]}
						zoom={5}
						scrollWheelZoom
						className="h-full w-full"
						zoomControl={true}
					>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						{requests.map((req) => (
							<Marker key={req.id} position={[req.location.lat, req.location.lng]} icon={markerIcon}>
								<Popup>
									<div className="space-y-1">
										<div className="font-semibold text-gray-900">{req.hospital}</div>
										<div className="text-sm text-gray-700">City: {req.city}</div>
										<div className="text-sm text-gray-700">Blood: {req.bloodType}</div>
										<div className="text-sm text-gray-700">Units: {req.units}</div>
										<div className="text-sm">
											<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getUrgencyBadgeClasses(req.urgency)}`}>
												{req.urgency} urgency
											</span>
										</div>
										<div className="text-sm text-gray-700">Deadline: {req.deadline}</div>
										<div className="pt-2">
											<button
												type="button"
												className="w-full rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
												onClick={() => alert(`Proceed to donate for ${req.hospital}`)}
											>
												Donate Now
											</button>
										</div>
									</div>
								</Popup>
							</Marker>
						))}
					</MapContainer>
				</div>
			)}
		</section>
	);
};

export default PendingRequests;