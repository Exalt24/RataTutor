import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/exam-theme.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [animationStage, setAnimationStage] = useState(0);
  const [mailboxVisible, setMailboxVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hideForm, setHideForm] = useState(false);
  const navigate = useNavigate();

  // Show mailbox on page load
  useEffect(() => {
    setMailboxVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Begin animation sequence
    setAnimationStage(1);
    
    // After a delay, position in front of slot
    setTimeout(() => {
      setAnimationStage(2);
      
      // After another delay, enter the mailbox
      setTimeout(() => {
        setAnimationStage(3);
        setSending(true);
        
        // Hide the form after it's "entered" the mailbox
        setTimeout(() => {
          setHideForm(true);
          setSuccess(true);
          
          // Redirect after showing success
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }, 800);
      }, 600);
    }, 400);
  };

  return (
    <div className="register-container">
      <div className="register-content-wrapper">
        {/* Form */}
        {!hideForm && (
          <div className={`register-letter ${animationStage > 0 ? 'sending' : ''}`}>
            <h2 className="letter-title">Join RataTutor</h2>
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label className="handwriting-accent">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="handwriting-accent">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="handwriting-accent">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="handwriting-accent">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="exam-button" data-hover="Join Us!">
                REGISTER
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <span className="handwriting-accent">Already have an account?</span>
                <Link to="/login" style={{ marginLeft: '0.3rem', color: 'var(--button-primary)' }}>
                  <span className="pixel-accent">LOGIN</span>
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Mailbox */}
        <div className="register-mailbox">
          <div className={`register-mailbox-slot ${animationStage >= 2 ? 'highlight' : ''}`}></div>
          
          <div className={`register-mailbox-flag ${sending ? 'down' : ''}`}>
            <div className="register-mailbox-flag-head"></div>
          </div>

          {animationStage >= 1 && animationStage < 3 && (
            <div className="register-paper-trail">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="register-paper-trail-item" />
              ))}
            </div>
          )}

          {animationStage === 3 && (
            <div className="register-delivery-particles">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="register-delivery-particle" />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Success Banner */}
      <div className={`register-success-message ${success ? 'visible' : ''}`}>
        <span className="pixel-accent">Registration successful!</span>
        <span className="handwriting-accent" style={{ marginLeft: '0.5rem' }}>
          Welcome aboard!
        </span>
      </div>
    </div>
  );
}
