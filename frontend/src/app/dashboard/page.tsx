"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../utils/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState([]);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState('Mid-Range Balanced');
  const [interests, setInterests] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadUserTrips();
  }, []);

  const loadUserTrips = async () => {
    try {
      const data = await fetchWithAuth('/trips');
      setTrips(data);
    } catch (err) {
      console.error('Error loading trips:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await fetchWithAuth('/trips/generate', {
        method: 'POST',
        body: JSON.stringify({
          destination,
          durationDays: Number(duration),
          budgetTier: budget,
          interests: interests.split(',').map(i => i.trim()),
        }),
      });
      setDestination('');
      setInterests('');
      loadUserTrips(); 
    } catch (err) {
      alert("AI Processing exception encountered.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm("Are you sure you want to cancel and remove this expedition?")) return;
    
    try {
      await fetchWithAuth(`/trips/${tripId}`, {
        method: 'DELETE',
      });
      loadUserTrips(); 
    } catch (err) {
      alert("Failed to drop database record stream.");
    }
  };

  return (
    <div>
      <header className="header-bar">
        <h1 className="main-logo">TRAO AI PLANNER</h1>
        <div className="user-badge-area">
          <span>Explorer: {user?.name}</span>
          <button onClick={logout} className="btn btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        
        <section className="panel-card">
          <h3 className="panel-title">Design New Venture</h3>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Target Destination</label>
              <input 
                type="text" 
                placeholder="e.g. Paris, Tokyo, Goa" 
                value={destination} 
                onChange={e => setDestination(e.target.value)} 
                required 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (Days)</label>
              <input 
                type="number" 
                min={1} 
                max={14} 
                value={duration} 
                onChange={e => setDuration(Number(e.target.value))} 
                required 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Budget Matrix Tier</label>
              <select 
                value={budget} 
                onChange={e => setBudget(e.target.value)} 
                className="form-input"
              >
                <option value="Budget Economy">Budget Economy</option>
                <option value="Mid-Range Balanced">Mid-Range Balanced</option>
                <option value="Luxury Premium">Luxury Premium</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Interests (Comma Separated)</label>
              <input 
                type="text" 
                placeholder="e.g. Museums, Beaches, Food" 
                value={interests} 
                onChange={e => setInterests(e.target.value)} 
                required 
                className="form-input" 
              />
            </div>
            <button type="submit" disabled={generating} className="btn btn-primary">
              {generating ? 'Assembling Datasets...' : 'AI Analyze'}
            </button>
          </form>
        </section>

        <section className="trip-feed">
          {trips.length === 0 ? (
            <div className="empty-state">
              No active itineraries compiled yet. Input constraints to prompt Gemini engine parameters.
            </div>
          ) : (
            trips.map((trip: any) => {
              const parseJsonData = (field: any) => {
                try {
                  return typeof field === 'string' ? JSON.parse(field) : field;
                } catch (e) {
                  return null;
                }
              };

              const parsedItinerary = parseJsonData(trip.itinerary);
              const parsedHotels = parseJsonData(trip.hotels);

              return (
                <div key={trip.id} className="trip-card" style={{ marginTop: '0px' }}>
                  <div className="trip-header">
                    <div>
                      <h4 className="trip-destination">{trip.destination}</h4>
                      <p className="trip-meta">{trip.duration_days} Days — {trip.budget_tier}</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => handleDeleteTrip(trip.id)} className="btn-delete">Cancel Trip</button>
                      <span className="status-badge">Active Stream</span>
                    </div>
                  </div>
                  
                  {/* Target Focus Tags */}
                  <div style={{ marginTop: '16px' }}>
                    <p className="form-label" style={{ marginBottom: '8px' }}>Target Focus Elements</p>
                    <div className="interests-container">
                      {Array.isArray(trip.interests) ? (
                        trip.interests.map((interest: string, i: number) => (
                          <span key={i} className="interest-tag">{interest}</span>
                        ))
                      ) : (
                        <span className="interest-tag">{trip.interests}</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded AI Itinerary Planning Blocks */}
                  {parsedItinerary && (
                    <div className="details-section">
                      <p className="details-subtitle">Generated Schedule Plan</p>
                      <div className="itinerary-box">
                        {Array.isArray(parsedItinerary) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {parsedItinerary.map((day: any, i: number) => (
                              <div key={i} className="day-block">
                                <h5 className="day-title">Day {day.dayNumber || day.day || i + 1}</h5>
                                <div style={{ marginTop: '6px' }}>
                                  {Array.isArray(day.activities) ? (
                                    day.activities.map((activity: any, actIdx: number) => (
                                      <div key={actIdx} className="activity-item">
                                        <span className="activity-bullet">✦</span>
                                        <span>
                                          {typeof activity === 'object' && activity !== null
                                            ? `${activity.time ? `[${activity.time}] ` : ''}${activity.name || activity.activity || activity.title}`
                                            : activity}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="activity-item">
                                      <span className="activity-bullet">✦</span>
                                      <span>{day.activities || 'No scheduled items flagged.'}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Curated Accommodations Grid Section */}
                  {Array.isArray(parsedHotels) && parsedHotels.length > 0 && (
                    <div className="details-section">
                      <p className="details-subtitle">Curated Accommodations</p>
                      <div className="hotel-list">
                        {parsedHotels.map((hotel: any, idx: number) => (
                          <div key={idx} className="hotel-item">
                            <span className="hotel-name">{hotel.name}</span>
                            <span className="hotel-cost">✨ {hotel.budget || 'Premium Tier'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>

      </div>
    </div>
  );
}