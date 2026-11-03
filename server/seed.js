require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Load = require('./models/Load');
const Connection = require('./models/Connection');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections for a clean, consistent seed
    await User.deleteMany({});
    await Load.deleteMany({});
    await Connection.deleteMany({});
    console.log('[Seed] Cleared existing records.');

    // 1. Create Load Owners
    const owner1 = await User.create({
      name: 'R. Krishnan',
      email: 'owner@tata-steel.in',
      password: 'password123',
      role: 'load_owner',
      phone: '+91 98401 23456',
      privacySetting: 'secure',
      companyName: 'Tata Steel Plant Ltd.',
      headLocation: 'Jamshedpur, Jharkhand',
      description: 'Major steel manufacturer supplying billets, coils, and industrial rebar to western and southern corridors.',
    });

    const owner2 = await User.create({
      name: 'Anand Mahindra',
      email: 'logistics@apex-auto.in',
      password: 'password123',
      role: 'load_owner',
      phone: '+91 98200 99887',
      privacySetting: 'public',
      companyName: 'Apex Automotive Ancillaries',
      headLocation: 'Chennai, Tamil Nadu',
      description: 'Automotive body frames, engine blocks, and sub-assemblies shipped to Pune and Gurgaon hubs.',
    });

    console.log('[Seed] Load Owners created.');

    // 2. Create Transporters
    const transporter1 = await User.create({
      name: 'Vikramaditya Sharma',
      email: 'operations@vrl-logistics.in',
      password: 'password123',
      role: 'transporter',
      phone: '+91 94480 11223',
      secondaryPhone: '+91 80 2678 9900',
      privacySetting: 'secure',
      companyName: 'VRL National Logistics',
      ceoName: 'Vijay Sankeshwar',
      headLocation: 'Bengaluru / Hubli, Karnataka',
      description: 'National freight carrier with 400+ heavy container trucks running Delhi-Mumbai-Chennai Golden Quadrilateral.',
    });

    const transporter2 = await User.create({
      name: 'Rajeev Singhania',
      email: 'dispatch@cj-darcl.in',
      password: 'password123',
      role: 'transporter',
      phone: '+91 98110 55443',
      secondaryPhone: '+91 11 4567 8900',
      privacySetting: 'public',
      companyName: 'Darcl Heavy Freightways',
      ceoName: 'Kishan Kumar',
      headLocation: 'Delhi / NCR',
      description: 'Specialists in heavy industrial ODC, 12-wheeler flatbeds, and multi-axle bulk movements.',
    });

    console.log('[Seed] Transporters created.');

    // 3. Create Drivers
    const driver1 = await User.create({
      name: 'Ramesh Kumar',
      email: 'driver.ramesh@gmail.com',
      password: 'password123',
      role: 'driver',
      phone: '+91 97890 12345',
      privacySetting: 'secure',
      vehicleNumber: 'TN-57-AB-1234',
      vehicleType: 'box_container',
      wheelType: '10',
      permitType: 'all_india_permit',
      licenseNumber: 'TN-57-2015-004321',
      description: 'Experienced container driver with 12 years accident-free record on NH 48 and NH 44 corridors.',
    });

    const driver2 = await User.create({
      name: 'Manpreet Singh',
      email: 'driver.manpreet@gmail.com',
      password: 'password123',
      role: 'driver',
      phone: '+91 98765 67890',
      privacySetting: 'secure',
      vehicleNumber: 'NL-01-AIP-5678',
      vehicleType: 'tarpaulin',
      wheelType: '14',
      permitType: 'national_permit',
      licenseNumber: 'PB-10-2012-009876',
      description: 'Specialist in tarpaulin-covered FMCG and industrial raw material loads, runs Delhi-Indore-Mumbai.',
    });

    const driver3 = await User.create({
      name: 'Gurmeet Singh',
      email: 'driver.gurmeet@gmail.com',
      password: 'password123',
      role: 'driver',
      phone: '+91 94170 33445',
      privacySetting: 'public',
      vehicleNumber: 'PB-10-CD-9988',
      vehicleType: 'flatbed',
      wheelType: '12',
      permitType: 'all_india_permit',
      licenseNumber: 'PB-10-2018-005544',
      description: 'Heavy multi-axle flatbed trailer driver for coil and beam transport.',
    });

    console.log('[Seed] Lorry Drivers created.');

    // 4. Create Mutual Connections
    // Connection: Owner1 <-> Transporter1 (Accepted)
    await Connection.create({
      requester: owner1._id,
      recipient: transporter1._id,
      status: 'accepted',
    });

    // Connection: Owner2 <-> Transporter1 (Accepted)
    await Connection.create({
      requester: transporter1._id,
      recipient: owner2._id,
      status: 'accepted',
    });

    // Connection: Transporter1 <-> Driver1 (Accepted)
    await Connection.create({
      requester: transporter1._id,
      recipient: driver1._id,
      status: 'accepted',
    });

    // Connection: Transporter1 <-> Driver2 (Accepted)
    await Connection.create({
      requester: transporter1._id,
      recipient: driver2._id,
      status: 'accepted',
    });

    // Connection: Driver1 <-> Driver2 (Accepted Peers)
    await Connection.create({
      requester: driver1._id,
      recipient: driver2._id,
      status: 'accepted',
    });

    // Connection: Driver1 <-> Driver3 (Pending sent)
    await Connection.create({
      requester: driver1._id,
      recipient: driver3._id,
      status: 'pending',
    });

    console.log('[Seed] Mutual Connections created.');

    // 5. Create Sample Realistic Loads
    // Load 1: Open Load from Owner1 (Transporter1 has expressed interest)
    await Load.create({
      loadOwner: owner1._id,
      loadName: 'Mild Steel Billets 25MT Batch #A4',
      category: 'Industrial',
      weight: 25,
      loadPackType: 'open',
      fromLocation: {
        address: 'Tata Steel Works, Adityapur Industrial Area',
        city: 'Jamshedpur',
        state: 'Jharkhand',
        pincode: '831013',
      },
      toLocation: {
        address: 'Bhosari MIDC Warehouse Complex',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411026',
      },
      requiredVehicleType: 'box_container',
      requiredWheelType: '10',
      requiredPermitType: 'all_india_permit',
      amountType: 'advance_plus_balance',
      priceRate: 74000,
      description: 'High-tensile industrial steel billets. Requires clean wooden bed floor, dry container body.',
      status: 'open',
      driverAssignmentBadge: 'not_approved',
      willingTransporters: [transporter1._id],
    });

    // Load 2: In-Progress Load (Contracted to Transporter1, Driver pending / Driver1 is willing)
    await Load.create({
      loadOwner: owner1._id,
      loadName: 'Cold Rolled Steel Coils 22MT',
      category: 'Industrial',
      weight: 22,
      loadPackType: 'palletized',
      fromLocation: {
        address: 'Export Terminal Wharf 3',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
      },
      toLocation: {
        address: 'Peenya Industrial Area Phase 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560058',
      },
      requiredVehicleType: 'box_container',
      requiredWheelType: '10',
      requiredPermitType: 'national_permit',
      amountType: 'advance_plus_balance',
      priceRate: 38500,
      description: 'Urgent factory delivery. Consignment must arrive by next morning 8 AM.',
      status: 'in_progress',
      driverAssignmentBadge: 'not_approved',
      assignedTransporter: transporter1._id,
      willingDrivers: [driver1._id],
    });

    // Load 3: In-Progress Load (LIVE on road with Driver2 assigned)
    await Load.create({
      loadOwner: owner2._id,
      loadName: 'Automotive Engine Blocks 18MT',
      category: 'Automotive',
      weight: 18,
      loadPackType: 'closed',
      fromLocation: {
        address: 'Apex Auto Plant 4, Sriperumbudur',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '602105',
      },
      toLocation: {
        address: 'Chakan Auto Corridor, Sector 12',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '410501',
      },
      requiredVehicleType: 'box_container',
      requiredWheelType: '10',
      requiredPermitType: 'all_india_permit',
      amountType: 'to_pay',
      priceRate: 62000,
      description: 'Precision cast engine blocks strapped in wooden crates. GPS tracking required.',
      status: 'in_progress',
      driverAssignmentBadge: 'live',
      assignedTransporter: transporter1._id,
      assignedDriver: driver2._id,
    });

    // Load 4: Completed Load
    await Load.create({
      loadOwner: owner1._id,
      loadName: 'Galvanized Sheet Bundles 20MT',
      category: 'Industrial',
      weight: 20,
      loadPackType: 'palletized',
      fromLocation: {
        address: 'Kalinganagar Steel Complex',
        city: 'Jajpur',
        state: 'Odisha',
        pincode: '755026',
      },
      toLocation: {
        address: 'Sanand Industrial Estate',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382170',
      },
      requiredVehicleType: 'tarpaulin',
      requiredWheelType: '12',
      requiredPermitType: 'all_india_permit',
      amountType: 'advance_plus_balance',
      priceRate: 85000,
      description: 'Delivered in good order and accepted by consignee warehouse.',
      status: 'completed',
      driverAssignmentBadge: 'live',
      assignedTransporter: transporter1._id,
      assignedDriver: driver1._id,
    });

    console.log('[Seed] Sample Loads created across Open, In-Progress, and Completed states.');

    console.log('\n======================================================');
    console.log('✅ SEEDING COMPLETE! Test credentials:');
    console.log('------------------------------------------------------');
    console.log('Load Owner:   owner@tata-steel.in         / password123');
    console.log('Transporter:  operations@vrl-logistics.in  / password123');
    console.log('Driver:       driver.ramesh@gmail.com     / password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
