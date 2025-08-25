// SignUpForm.tsx
import React, { useState } from 'react';

export default function SignUpForm({ onSignUp }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="signup-page" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', minHeight: '100vh'
    }}>
      <h2 style={{ marginTop: '60px', fontWeight: 'bold', color: '#283e4a' }}>
        Join Our Community of Lifesavers
      </h2>
      <p style={{ color: '#283e4a', maxWidth: '400px', textAlign: 'center', marginBottom: 30 }}>
        Register now to connect with hospitals and help save lives. Fast, seamless, and trusted blood donation – every second counts!
      </p>

      <div style={{
        background: '#fff', borderRadius: '15px', padding: '32px', boxShadow: '0 6px 24px rgba(40,62,74,0.06)', width: '360px'
      }}>
        <button style={{
          background: '#ea4c89', color: '#fff', fontWeight: 'bold', borderRadius: '8px',
          border: 'none', padding: '10px 0', width: '100%', marginBottom: '12px', fontSize: '16px'
        }}>Sign Up with Google</button>
        {/* Divider */}
        <div style={{ textAlign: 'center', color: "#999", margin: "10px" }}>or</div>

        <form onSubmit={onSignUp}>
          <input type="text" placeholder="Full Name" required
            style={{
              width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '8px',
              border: '1px solid #d0d0d0'
            }} />
          <input type="email" placeholder="Email" required
            style={{
              width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '8px',
              border: '1px solid #d0d0d0'
            }} />
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                border: '1px solid #d0d0d0', paddingRight: '40px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                cursor: 'pointer', fontSize: '16px', background: 'none', border: 'none'
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button type="submit" style={{
            background: '#283e4a', color: '#fff', fontWeight: 'bold', borderRadius: '8px',
            border: 'none', padding: '12px', width: '100%', fontSize: '18px'
          }}>
            Start Saving Lives!
          </button>
        </form>
      </div>
      {/* Social Proof and Testimonial */}
      <div style={{ marginTop: "18px", fontSize: "14px", color: "#464e56" }}>
        Trusted by <b>100+ Hospitals</b> | <i>“Donating was quick and easy – I felt proud to help someone in need.”</i>
      </div>
    </div>
  );
}
