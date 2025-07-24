const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: 'your-secret-key-here', // Change this to a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  },
  name: 'raktdaan.sid'
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Please log in to access this page' });
};

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'redstream_db'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// Logout route
app.get('/logout', (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, message: 'Error logging out' });
    }
    
    // Clear the session cookie
    res.clearCookie('connect.sid');
    
    // Clear the remember_me cookie if it exists
    res.clearCookie('remember_me');
    
    // Redirect to login page
    res.redirect('/login.html');
  });
});

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      email,
      mobile_number,
      password,
      blood_group,
      gender,
      birth_date,
      weight,
      state,
      zip_code,
      district,
      area,
      landmarks
    } = req.body;

    // Basic validation
    if (!full_name || !email || !mobile_number || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, mobile number, and password are required.'
      });
    }

    // Check if email already exists
    const emailCheckQuery = 'SELECT id FROM registered_users WHERE email = ?';
    const [existingUsers] = await db.promise().execute(emailCheckQuery, [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertQuery = `
      INSERT INTO registered_users 
      (name, email, phone, password, bloodgroup, gender, birthdate, \`weight(kg)\`, state, zipcode, district, area, landmark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().execute(insertQuery, [
      full_name,
      email,
      mobile_number,
      hashedPassword,
      blood_group || null,
      gender || null,
      birth_date || null,
      weight || null,
      state || null,
      zip_code || null,
      district || null,
      area || null,
      landmarks || null
    ]);

    res.json({
      success: true,
      message: 'Registration successful!',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

// Contact form submission endpoint
app.post('/contact', (req, res) => {
  const { email_address } = req.body;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email_address || !emailRegex.test(email_address)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }
  
  // Here you would typically:
  // 1. Save the email to a database
  // 2. Send a confirmation email
  // 3. Or process the contact form submission as needed
  
  // For now, we'll just log it and return a success response
  console.log('New contact form submission:', email_address);
  
  res.json({
    success: true,
    message: 'Thank you for contacting us! We will get back to you soon.'
  });
});

// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login POST request
app.post('/login', (req, res) => {
  const { email, password, remember_me } = req.body;

  // Validate and sanitize inputs
  if (!email || !password) {
    return res.json({ 
      success: false, 
      message: 'Email and password are required.' 
    });
  }

  // Sanitize email (basic validation)
  const sanitizedEmail = email.trim().toLowerCase();

  // Check if the email exists in the database
  const query = 'SELECT id, name, email, phone, bloodgroup FROM registered_users WHERE email = ?';
  
  db.execute(query, [sanitizedEmail], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.json({ 
        success: false, 
        message: 'Database error occurred.' 
      });
    }

    if (results.length > 0) {
      const hashedPassword = results[0].password;

      // Verify the password
      bcrypt.compare(password, hashedPassword, (err, isMatch) => {
        if (err) {
          console.error('Password comparison error:', err);
          return res.json({ 
            success: false, 
            message: 'Authentication error occurred.' 
          });
        }

        if (isMatch) {
          // Password is correct, set session with user data
          const user = results[0];
          req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            bloodgroup: user.bloodgroup
          };
          req.session.loggedin = true;

          // Handle "Remember Me" functionality
          if (remember_me === '1') {
            const cookieName = 'remember_me_cookie';
            const cookieValue = user.id.toString();
            const cookieExpiry = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
            
            res.cookie(cookieName, cookieValue, {
              maxAge: cookieExpiry,
              httpOnly: true,
              path: '/',
              sameSite: 'lax'
            });
          }

          // Send success response
          res.json({ 
            success: true, 
            message: 'Login successful!',
            redirect: '/dashboard',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              bloodgroup: user.bloodgroup
            }
          });
        } else {
          res.json({ 
            success: false, 
            message: 'Incorrect email or password. Please try again.' 
          });
        }
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Incorrect email or password. Please try again.' 
      });
    }
  });
});

// Dashboard route - Serve dashboard page
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Get current user data
app.get('/api/user', requireAuth, (req, res) => {
  const email = req.session.user.email;
  const query = 'SELECT name, email, phone, bloodgroup, gender, birthdate, `weight(kg)` as weight, state, zipcode, district, area, landmark FROM registered_users WHERE email = ?';
  
  db.execute(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Error fetching user data' });
    }
    
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  });
});

// Update user profile
app.post('/api/user/update', requireAuth, (req, res) => {
  const { name, phone, bloodgroup, gender, birthdate, weight, state, zipcode, district, area, landmark } = req.body;
  const email = req.session.user.email;
  
  const query = `
    UPDATE registered_users 
    SET name = ?, phone = ?, bloodgroup = ?, gender = ?, birthdate = ?, 
        \`weight(kg)\` = ?, state = ?, zipcode = ?, district = ?, area = ?, landmark = ? 
    WHERE email = ?
  `;
  
  db.execute(
    query,
    [name, phone, bloodgroup, gender, birthdate, weight, state, zipcode, district, area, landmark, email],
    (err, results) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ success: false, message: 'Error updating profile' });
      }
      res.json({ success: true, message: 'Profile updated successfully' });
    }
  );
});

// Change password
app.post('/api/user/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const email = req.session.user.email;
  
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }
  
  try {
    // Get current hashed password
    const [users] = await db.promise().execute('SELECT password FROM registered_users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().execute('UPDATE registered_users SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

// Get user's donation history
app.get('/api/user/donations', requireAuth, (req, res) => {
  const email = req.session.user.email;
  const query = 'SELECT * FROM donations WHERE user_email = ? ORDER BY donation_date DESC';
  
  db.execute(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Error fetching donation history' });
    }
    
    res.json({ success: true, donations: results });
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.clearCookie('remember_me_cookie');
    res.clearCookie('raktdaan.sid');
    res.redirect('/login');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
