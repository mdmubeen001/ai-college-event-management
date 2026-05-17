import React from 'react';

const StatCard = ({ icon: Icon, label, value, color, onClick, compact = true }) => {
  return (
    <div 
      className={`neu-card neu-stat ${compact ? 'neu-stat-compact' : ''}`}
      onClick={onClick}
      style={{ 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        justifyContent: 'center',
        transition: 'transform 0.2s ease'
      }}
    >
      <div 
        className="neu-button circle" 
        style={{ 
          width: compact ? '40px' : '50px', 
          height: compact ? '40px' : '50px', 
          marginBottom: compact ? '0.75rem' : '1rem', 
          color: color || 'var(--neu-text-primary)',
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={compact ? 20 : 24} />
      </div>
      <p style={{ color: 'var(--neu-text-secondary)', fontSize: compact ? '0.8rem' : '0.9rem', textTransform: 'uppercase', letterSpacing: compact ? '0.5px' : '1px', margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: compact ? '1.5rem' : '2.5rem', fontWeight: 700, margin: compact ? '0.35rem 0 0' : '0.5rem 0 0', color: 'var(--neu-text-primary)' }}>
        {value}
      </p>
    </div>
  );
};

export default StatCard;