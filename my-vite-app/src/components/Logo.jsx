function Logo({ small }) {
  return (
    <div className={`logo ${small ? 'logo-small' : ''}`}>
      <img 
        src="/Logo.png" 
        alt="PLAY MAKER Logo" 
        className="logo-image"
      />
    </div>
  );
}

export default Logo;