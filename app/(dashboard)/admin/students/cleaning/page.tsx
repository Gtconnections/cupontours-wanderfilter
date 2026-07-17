'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/lib/utils/useAuth';
import './cleaning.css';

interface CleaningItem {
  title: string;
  icon?: string;
  items: string[];
}

const cleaningData: CleaningItem[] = [
  {
    title: 'Before to Start',
    icon: '🎬',
    items: [
      'Record a complete video of the entire property upon entering.',
      'Start washing machine (Include sofa bed sheets)',
      'Start dishwasher'
    ]
  },
  {
    title: 'General',
    icon: '📋',
    items: [
      'Check for damages or lost items left by guests',
      'Immediately notify via chat with video',
      'Communicate when there is only 25% left of the following supplies: trash bags, bathroom and kitchen supplies, soap and shampoo, dishwasher tablets, fragrance oil, laundry detergent, toilet paper, dishwashing liquid, dishwasher sponges, light bulbs, coffee and sugar, absorbent towels, anti-hair caps',
      'Check that all pipes are draining properly',
      'Turn on all lights and check for burnt out bulbs',
      'Put furniture and accessories back in their original place',
      'Open curtains/blinds to maximize natural light',
      'Change fragrance oils'
    ]
  },
  {
    title: 'Kitchen',
    icon: '🍳',
    items: [
      'Wash everything in the dishwasher',
      'Clean inside the oven, microwave, and refrigerator',
      'ONLY REMOVE EXPIRED OR UNCOVERED ITEMS FROM THE FRIDGE AND CABINETS (Leave condiments even if they are uncovered)',
      'Clean all appliances and check for possible crumbs (toasters, coffee maker, toaster oven, etc.)',
      'Clean the floor - sweep and mop',
      'Empty the dishwasher: Place clean plates, silverware, glasses, etc. in their proper place',
      'Fill ice trays and put them in the freezer',
      'For guests - Clean absorbent towel, refill coffee, sugar, dishwashing liquid, dishwasher tablets, laundry detergent, and trash bags',
      'Five (5) minutes of wall cleaning'
    ]
  },
  {
    title: 'Bathroom',
    icon: '🚿',
    items: [
      'Remove all objects from the sink, shower, shelves, etc.',
      'Spray all surfaces with disinfectant cleaner and wipe them down',
      'Clean the toilet (Make sure to clean the outside, back, and sides)',
      'Clean the sink and bathtub',
      'Clean the faucets in the sink and shower with a brillo sponge and absorbent paper to make them shiny',
      'Clean the glass and mirrors with glass cleaner',
      'Clean the floor (sweep, mop)',
      'For guests - Place one (1) hand towel and two (2) face towels per bathroom, refill two (2) folded toilet papers per bathroom, two (2) soaps, and two (2) shampoos',
      'Five (5) minutes of wall cleaning'
    ]
  },
  {
    title: 'Bedrooms',
    icon: '🛏️',
    items: [
      'Clean all surfaces (Tables, drawers inside and outside, night lamps) with disinfectant cleaner',
      'Remove stains from towels and bed linen. If not possible, report it',
      'Make the beds (Dress them with clean linen)',
      'Clean the floor (Sweep, mop, vacuum if necessary)',
      'Carefully fold (or roll) two (2) bath towels per Queen/King bed',
      'Carefully fold (or roll) one (1) bath towel per Twin bed',
      'Five (5) minutes of wall cleaning'
    ]
  },
  {
    title: 'Common Areas',
    icon: '🛋️',
    items: [
      'Clean under all surfaces, tables, and furniture. Clean the sofa bed inside and out and leave it open for a while to avoid concentrated odors',
      'Clean the windows with glass cleaner',
      'Clean the floor (Sweep, mop, vacuum if necessary)',
      'Presentation is key. Give a good "first impression" to guests by organizing cushions, chairs, blankets, etc.',
      'Clean the patio/balcony of leaves and dirt (floors and furniture)',
      'For guests - Place keys, FOBS, and "Housekeeper presentation cards" and inventory in a visible place',
      'Five (5) minutes of wall cleaning'
    ]
  },
  {
    title: 'Final Check',
    icon: '✅',
    items: [
      'Exit the property, count to ten (10), and re-enter:',
      'For guests - Make sure to leave enough supplies: Two (2) towels per Queen/King bed and one (1) towel per Twin bed, two (2) folded toilet papers per bathroom, two (2) soaps and shampoos per bathroom, coffee and sugar according to the capacity of the property, two (2) extra trash bags under the sink, clean absorbent towel, two (2) dishwasher tablets, two (2) laundry detergent tablets, refill dishwashing liquid and sponges, "Housekeeper presentation card" and inventory, fragrance oil tablet',
      'Notify if the levels of these products are low in the operational closets',
      'No hair, marks/dirt on the walls, no crumbs/dust on floors, tables, or surfaces',
      'Empty dishwasher',
      'Air conditioning in "AUTO" mode and at 75° degrees. Check that the stove and oven are off. Trash cans with bags placed.',
      'Leave bedroom doors open',
      'Turn off lights and close doors and windows',
      'Note: Avoid leaving the property with a tobacco/smoke smell if possible.'
    ]
  }
];

const LoadingSkeleton = () => (
  <div className="wander-cleaning-container">
    <div className="wander-cleaning-header">
      <div>
        <span className="wander-breadcrumb">Students / Cleaning</span>
        <h2>Cargando...</h2>
      </div>
    </div>
    <div className="wander-cleaning-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando guía de limpieza...</p>
    </div>
  </div>
);

export default function CleaningPage() {
  const { isChecking, isAuthenticated, checkAuth } = useAuth();
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  React.useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    // Auth check reads cookies/localStorage, only available after mount; deferring
    // to an effect (rather than a lazy initializer) avoids an SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      // router.push('/login');
      return;
    }
  }, [isChecking, checkAuth]);

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="wander-cleaning-container">
      {/* Cabecera */}
      <header className="wander-cleaning-header">
        <div>
          <span className="wander-breadcrumb">Students / Cleaning</span>
          <h2>Cleaning Check List</h2>
          <p className="wander-cleaning-subtitle">
            This cleaning guide is an essential tool for ensuring that the property is clean and ready for the next guest. 
            By following the tasks outlined in this guide, our housekeeping staff can maintain a high level of cleanliness 
            throughout the property.
          </p>
        </div>
      </header>

      {/* Contenido */}
      <div className="wander-cleaning-content">
        {cleaningData.map((section, index) => (
          <div key={index} className="wander-cleaning-section">
            <div className="wander-cleaning-section-header">
              <span className="wander-cleaning-section-icon">{section.icon}</span>
              <h3 className="wander-cleaning-section-title">{section.title}</h3>
            </div>
            <ul className="wander-cleaning-list">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="wander-cleaning-item">
                  <span className="wander-cleaning-item-marker">•</span>
                  <span className="wander-cleaning-item-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}