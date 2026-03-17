import React from 'react';

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  tone: 'professional' | 'friendly' | 'bold' | 'minimal';
  heroColor: string;
  accentColor: string;
  textColor: string;
  bodyColor: string;
  cardColor: string;
  font: string;
}

export const styles: StyleOption[] = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Dark hero, clean sections',
    tone: 'professional',
    heroColor: '#0F172A',
    accentColor: '#6366F1',
    textColor: '#FFFFFF',
    bodyColor: '#94A3B8',
    cardColor: '#1E293B',
    font: 'DM Sans'
  },
  {
    id: 'clean-light',
    name: 'Clean Light',
    description: 'White & minimal, airy feel',
    tone: 'minimal',
    heroColor: '#FAFAFA',
    accentColor: '#166534',
    textColor: '#0A0A0A',
    bodyColor: '#6B7280',
    cardColor: '#FFFFFF',
    font: 'Inter'
  },
  {
    id: 'bold-black',
    name: 'Bold Black',
    description: 'High contrast, strong impact',
    tone: 'bold',
    heroColor: '#000000',
    accentColor: '#EF4444',
    textColor: '#FFFFFF',
    bodyColor: '#9CA3AF',
    cardColor: '#111111',
    font: 'DM Sans'
  },
  {
    id: 'warm-friendly',
    name: 'Warm & Friendly',
    description: 'Inviting, approachable tone',
    tone: 'friendly',
    heroColor: '#7C2D12',
    accentColor: '#F97316',
    textColor: '#FFFFFF',
    bodyColor: '#FED7AA',
    cardColor: '#FFFBF5',
    font: 'Inter'
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Trust-focused, B2B ready',
    tone: 'professional',
    heroColor: '#0C1B33',
    accentColor: '#2563EB',
    textColor: '#FFFFFF',
    bodyColor: '#94A3B8',
    cardColor: '#F0F4FF',
    font: 'Inter'
  }
];

interface StylePickerProps {
  selectedStyle: StyleOption;
  onChange: (style: StyleOption) => void;
}

export const StylePicker: React.FC<StylePickerProps> = ({ selectedStyle, onChange }) => {
  return (
    <div className="space-y-3">
      <div 
        style={{
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase'
        }}
      >
        Page Style
      </div>
      
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px'
        }}
        className="[&>*:last-child:nth-child(odd)]:col-span-2"
      >
        {styles.map(style => (
          <div
            key={style.id}
            onClick={() => onChange(style)}
            style={{
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: `2px solid ${selectedStyle.id === style.id ? '#166534' : 'transparent'}`,
              boxShadow: selectedStyle.id === style.id ? '0 0 0 3px rgba(22,101,52,0.12)' : 'none',
              transition: 'all 0.15s',
              background: 'var(--color-background-primary)'
            }}
          >
            {/* Visual Preview Area */}
            <div style={{
              height: '80px',
              background: style.heroColor,
              position: 'relative',
              padding: '12px'
            }}>
              {/* Fake Layout Elements */}
              <div style={{
                height: 8,
                width: '70%',
                background: style.textColor,
                borderRadius: 4,
                opacity: 0.9,
                marginBottom: 6
              }}/>
              <div style={{
                height: 5,
                width: '50%',
                background: style.bodyColor,
                borderRadius: 3,
                marginBottom: 10,
                opacity: 0.7
              }}/>
              <div style={{
                height: 18,
                width: 60,
                background: style.accentColor,
                borderRadius: 4,
                opacity: 1
              }}/>
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: style.accentColor
              }}/>
            </div>

            {/* Label Area */}
            <div style={{
              background: 'var(--color-background-primary)',
              padding: '10px 12px',
              borderTop: '0.5px solid var(--color-border-tertiary)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {style.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {style.description}
                  </div>
                </div>
                
                {/* Small Swatches Row */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.heroColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.accentColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.cardColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
