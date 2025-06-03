import React from 'react';
import '../styles/components/loading-spinner.css'; // Adjust path to your actual CSS file
import hamsterGif from '../assets/hamster.gif'; // Adjust path to your actual file location

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner">
        <img src={hamsterGif} alt="Loading... Hamster in a wheel" className="hamster-gif" />
      </div>
      <div className="loading-text">LOADING ...</div>
    </div>
  );
};

export default LoadingSpinner;