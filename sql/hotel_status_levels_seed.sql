-- Seed data for hotel_status_levels from extension HOTEL_PROGRAMS
-- Run after hotel_status_levels.sql (table must exist)
-- Uses ON CONFLICT (program_id) DO UPDATE to upsert so you can re-run safely

INSERT INTO public.hotel_status_levels (program_id, program_name, current_level, level_name, valid_until, is_active, level_definitions)
VALUES
  (
    'accor',
    'Accor',
    1,
    'Classic',
    NULL,
    true,
    '[
      {"level":1,"name":"Classic","color":"bg-gray-100 text-gray-800","benefits":["Member rate","Free WiFi","Exclusive offers","Partner benefits","Car rental services"]},
      {"level":2,"name":"Silver\n(10 N)","color":"bg-gray-300 text-gray-800","benefits":["24% Bonus Points","Welcome drink","Priority Welcome","Late Check-Out","13% off airport lounges"]},
      {"level":3,"name":"Gold\n(30 N)","color":"bg-yellow-200 text-yellow-800","benefits":["48% Bonus Points","Guaranteed room availability","Room upgrade","Early Check-In or Late Check-Out","14% off airport lounges"]},
      {"level":4,"name":"Platinum\n(60 N)","color":"bg-gray-400 text-white","benefits":["76% Bonus Points","Suite Night Upgrade","Lounge access","Premium Wi-Fi","15% off airport lounges","Early Check-In","Late Check-Out"]},
      {"level":5,"name":"Diamond\n(10,4k€)","color":"bg-blue-500 text-white","benefits":["100% Bonus Points","Free breakfast on weekends","Dining & Spa Rewards","Free Gold Status"]}
    ]'::jsonb
  ),
  (
    'choice',
    'Choice',
    1,
    'Member',
    NULL,
    true,
    '[
      {"level":1,"name":"Member","color":"bg-gray-100 text-gray-800","benefits":["Points earning","Member rates","Mobile check-in","Points toward free N","No blackout dates"]},
      {"level":2,"name":"Gold\n(10 N)","color":"bg-yellow-200 text-yellow-800","benefits":["10% Bonus Points","Late Check-Out","Preferred rooms","Welcome gift"]},
      {"level":3,"name":"Platinum\n(20 N)","color":"bg-gray-400 text-white","benefits":["25% Bonus Points","Room upgrade","Late Check-Out 4pm","Welcome amenity"]},
      {"level":4,"name":"Diamond\n(40 N)","color":"bg-blue-500 text-white","benefits":["50% Bonus Points","Suite upgrade","Late Check-Out 6pm","Executive lounge","Guaranteed availability","Free breakfast"]}
    ]'::jsonb
  ),
  (
    'hilton',
    'Hilton',
    1,
    'Member',
    NULL,
    true,
    '[
      {"level":1,"name":"Member","color":"bg-gray-100 text-gray-800","benefits":["Guaranteed Hilton Honors Discount rate","Points toward free N","No resort fees on reward stays","Digital Check-in","Digital Key","Free WiFi","Fifth N free on reward stays","Member rates","Points earning"]},
      {"level":2,"name":"Silver\n(10 N)","color":"bg-gray-300 text-gray-800","benefits":["20% Bonus Points","Free bottled water","Elite Rollover Nights","All-Inclusive Spa Discount","Exclusive Hilton Honors Experiences"]},
      {"level":3,"name":"Gold\n(40 N)","color":"bg-yellow-200 text-yellow-800","benefits":["80% Bonus Points","Space-available room upgrade","Daily Food and Beverage Credit or Continental Breakfast","Milestone Bonuses"]},
      {"level":4,"name":"Diamond\n(60 N)","color":"bg-blue-500 text-white","benefits":["100% Bonus Points","Suite upgrade","Executive lounge access","Diamond status extension","Premium WiFi","48-hour room guarantee","Elite status gifting"]},
      {"level":5,"name":"Diamond Reserve","color":"bg-purple-600 text-white","benefits":["120% Points earning Bonus on stays","4pm guaranteed late check-out","Confirmable Upgrade Reward","Exclusive Customer Service","Premium Club Access"]}
    ]'::jsonb
  ),
  (
    'hyatt',
    'Hyatt',
    1,
    'Member',
    NULL,
    true,
    '[
      {"level":1,"name":"Member","color":"bg-gray-100 text-gray-800","benefits":["5 points per dollar spent","Free WiFi","Waived resort fees on award stays","Points earning","Member rates"]},
      {"level":2,"name":"Discoverist\n(10 N)","color":"bg-green-200 text-green-800","benefits":["10% Bonus Points","Premium WiFi","Late Check-Out 2pm","Preferred room upgrade","Elite check-in","Complimentary bottled water"]},
      {"level":3,"name":"Explorist\n(30 N)","color":"bg-yellow-200 text-yellow-800","benefits":["20% Bonus Points","Upgrade to best room excluding suites","72 hours guaranteed availability","Category 1-4 free night certificate","4 Club Access Awards"]},
      {"level":4,"name":"Globalist\n(60 N)","color":"bg-purple-500 text-white","benefits":["30% Bonus Points","Suite upgrade included","Late Check-Out 4pm","Club lounge access or free breakfast","5 Suite Upgrade Awards","Category 1-7 free night certificate","3 Guest of Honor Awards","Globalist concierge","48 hours guaranteed availability"]}
    ]'::jsonb
  ),
  (
    'ihg',
    'IHG',
    1,
    'Club Member',
    NULL,
    true,
    '[
      {"level":1,"name":"Club Member","color":"bg-gray-100 text-gray-800","benefits":["Earn Points toward Reward Nights and More","No Blackout Dates for Reward Nights","Member Rates","Member Promotions","Free WiFi","Late Check-Out 2PM (subject to availability)"]},
      {"level":2,"name":"Silver Elite\n(10 N)","color":"bg-gray-300 text-gray-800","benefits":["20% Bonus Points","Points Don''t Expire"]},
      {"level":3,"name":"Gold Elite\n(20 N)","color":"bg-yellow-200 text-yellow-800","benefits":["40% Bonus Points","Rollover Nights for Next Year''s Status","Start Earning Milestone Rewards"]},
      {"level":4,"name":"Platinum Elite\n(40 N)","color":"bg-gray-400 text-white","benefits":["60% Bonus Points","Guaranteed Room Availability (72 hrs)","Complimentary Upgrade","Welcome Amenity at Check-In (Points or drink/snack)","Early Check-In","Reward Night Discounts","Hertz Gold Plus Rewards Five Star Status"]},
      {"level":5,"name":"Diamond Elite\n(70 N)","color":"bg-blue-500 text-white","benefits":["100% Bonus Points","Dedicated Diamond Support","Welcome Amenity at Check-In (Free breakfast, points or drink/snack)","Hertz President''s Circle Status"]}
    ]'::jsonb
  ),
  (
    'marriott',
    'Marriott',
    1,
    'Member',
    NULL,
    true,
    '[
      {"level":1,"name":"Member","color":"bg-gray-100 text-gray-800","benefits":["Points earning","Member rates","Free WiFi","Mobile check-in","Mobile key","No blackout dates"]},
      {"level":2,"name":"Silver Elite\n(10 N)","color":"bg-gray-300 text-gray-800","benefits":["10% Bonus Points","Late Check-Out 2pm","Preferred rooms","Priority support"]},
      {"level":3,"name":"Gold Elite\n(25 N)","color":"bg-yellow-200 text-yellow-800","benefits":["25% Bonus Points","Room upgrade","Late Check-Out 4pm","Enhanced WiFi","Welcome gift"]},
      {"level":4,"name":"Platinum Elite\n(50 N)","color":"bg-gray-400 text-white","benefits":["50% Bonus Points","Suite upgrade","Club lounge access","Free breakfast"]},
      {"level":5,"name":"Titanium Elite\n(75 N)","color":"bg-gray-600 text-white","benefits":["75% Bonus Points","Enhanced suite upgrade","48h upgrade guarantee"]},
      {"level":6,"name":"Ambassador Elite\n(100 N)","color":"bg-purple-600 text-white","benefits":["100% Bonus Points","Guaranteed suite upgrade","Late Check-Out anytime","Personal ambassador"]}
    ]'::jsonb
  ),
  (
    'wyndham',
    'Wyndham',
    1,
    'Blue',
    NULL,
    true,
    '[
      {"level":1,"name":"Blue","color":"bg-blue-100 text-blue-800","benefits":["Points earning","Member rates","Free WiFi","Points toward free N","No blackout dates","Member promotions"]},
      {"level":2,"name":"Gold\n(5 N)","color":"bg-yellow-200 text-yellow-800","benefits":["10% Bonus Points","Late Check-Out 2pm","Preferred rooms","Bonus points promotions"]},
      {"level":3,"name":"Platinum\n(15 N)","color":"bg-gray-400 text-white","benefits":["15% Bonus Points","Room upgrade","Late Check-Out 4pm","Welcome amenity","Guaranteed availability","Early Check-In","Caesars Rewards status match","Avis/Budget car rental upgrade"]},
      {"level":4,"name":"Diamond\n(40 N)","color":"bg-blue-500 text-white","benefits":["30% Bonus Points","Late Check-Out 6pm","VIP treatment","Exclusive offers","Free Gold Status","Points bonus","Suite upgrade"]}
    ]'::jsonb
  ),
  (
    'radisson',
    'Radisson',
    1,
    'Club',
    NULL,
    true,
    '[
      {"level":1,"name":"Club","color":"bg-gray-100 text-gray-800","benefits":["Points earning","Member rates","Free WiFi","Points toward free N","No blackout dates","Member promotions","Mobile check-in"]},
      {"level":2,"name":"Premium\n(15 N)","color":"bg-gray-300 text-gray-800","benefits":["15% bonus points","Late Check-Out 2pm","Preferred rooms","Welcome gift"]},
      {"level":3,"name":"VIP\n(30 N)","color":"bg-yellow-200 text-yellow-800","benefits":["25% bonus points","Suite upgrade","Late Check-Out 4pm","Welcome amenity","Guaranteed availability","Early Check-In","Club lounge access","Free breakfast"]}
    ]'::jsonb
  )
ON CONFLICT (program_id) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  current_level = EXCLUDED.current_level,
  level_name = EXCLUDED.level_name,
  valid_until = EXCLUDED.valid_until,
  is_active = EXCLUDED.is_active,
  level_definitions = EXCLUDED.level_definitions,
  updated_at = timezone('utc', now());
