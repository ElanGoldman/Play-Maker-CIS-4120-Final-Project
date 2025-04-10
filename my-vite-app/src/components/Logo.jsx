function Logo({ small }) {
  return (
    <div className={`logo ${small ? 'logo-small' : ''}`}>
      <div className="logo-placeholder">PLAY MAKER</div>
    </div>
  );
}

export default Logo; //TODO: remeber to add logo, rn temporary place holder