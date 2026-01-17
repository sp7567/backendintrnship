const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create default user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log('Created user:', user.username);

  // Create 5 vendors
  const vendors = await Promise.all([
    prisma.vendor.upsert({
      where: { email: 'contact@acmesupplies.com' },
      update: {},
      create: {
        vendorName: 'Acme Supplies Pvt Ltd',
        contactPerson: 'Rajesh Kumar',
        email: 'contact@acmesupplies.com',
        phoneNumber: '+91-9876543210',
        paymentTerms: 'DAYS_30',
        status: 'Active',
        createdBy: user.id,
      },
    }),
    prisma.vendor.upsert({
      where: { email: 'sales@globaltech.com' },
      update: {},
      create: {
        vendorName: 'Global Tech Solutions',
        contactPerson: 'Priya Sharma',
        email: 'sales@globaltech.com',
        phoneNumber: '+91-9876543211',
        paymentTerms: 'DAYS_45',
        status: 'Active',
        createdBy: user.id,
      },
    }),
    prisma.vendor.upsert({
      where: { email: 'info@rawmaterials.com' },
      update: {},
      create: {
        vendorName: 'Raw Materials Inc',
        contactPerson: 'Amit Patel',
        email: 'info@rawmaterials.com',
        phoneNumber: '+91-9876543212',
        paymentTerms: 'DAYS_15',
        status: 'Active',
        createdBy: user.id,
      },
    }),
    prisma.vendor.upsert({
      where: { email: 'orders@qualityparts.com' },
      update: {},
      create: {
        vendorName: 'Quality Parts Co',
        contactPerson: 'Sneha Gupta',
        email: 'orders@qualityparts.com',
        phoneNumber: '+91-9876543213',
        paymentTerms: 'DAYS_60',
        status: 'Active',
        createdBy: user.id,
      },
    }),
    prisma.vendor.upsert({
      where: { email: 'support@industrialgoods.com' },
      update: {},
      create: {
        vendorName: 'Industrial Goods Ltd',
        contactPerson: 'Vikram Singh',
        email: 'support@industrialgoods.com',
        phoneNumber: '+91-9876543214',
        paymentTerms: 'DAYS_7',
        status: 'Inactive',
        createdBy: user.id,
      },
    }),
  ]);

  console.log(`Created ${vendors.length} vendors`);

  // Helper function to generate PO number
  const generatePONumber = (index) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `PO-${dateStr}-${String(index).padStart(3, '0')}`;
  };

  // Helper function to calculate due date based on payment terms
  const calculateDueDate = (poDate, paymentTerms) => {
    const days = {
      'DAYS_7': 7,
      'DAYS_15': 15,
      'DAYS_30': 30,
      'DAYS_45': 45,
      'DAYS_60': 60,
    };
    const dueDate = new Date(poDate);
    dueDate.setDate(dueDate.getDate() + days[paymentTerms]);
    return dueDate;
  };

  // Create 15 Purchase Orders
  const purchaseOrders = [];
  const poItems = [
    [
      { description: 'Steel Rods 10mm', quantity: 100, unitPrice: 250 },
      { description: 'Steel Plates 5mm', quantity: 50, unitPrice: 500 },
    ],
    [
      { description: 'Computer Hardware', quantity: 10, unitPrice: 15000 },
      { description: 'Network Cables', quantity: 100, unitPrice: 50 },
    ],
    [
      { description: 'Raw Cotton Bales', quantity: 200, unitPrice: 1000 },
    ],
    [
      { description: 'Machine Parts Set A', quantity: 5, unitPrice: 8000 },
      { description: 'Machine Parts Set B', quantity: 3, unitPrice: 12000 },
    ],
    [
      { description: 'Industrial Lubricant 20L', quantity: 25, unitPrice: 800 },
    ],
    [
      { description: 'Copper Wire 2.5mm', quantity: 500, unitPrice: 120 },
      { description: 'Copper Wire 4mm', quantity: 300, unitPrice: 180 },
    ],
    [
      { description: 'Server Equipment', quantity: 2, unitPrice: 75000 },
    ],
    [
      { description: 'Packaging Materials', quantity: 1000, unitPrice: 25 },
      { description: 'Shipping Boxes Large', quantity: 500, unitPrice: 50 },
    ],
    [
      { description: 'Bearings Type X', quantity: 100, unitPrice: 350 },
      { description: 'Bearings Type Y', quantity: 75, unitPrice: 450 },
    ],
    [
      { description: 'Safety Equipment Set', quantity: 50, unitPrice: 600 },
    ],
    [
      { description: 'Aluminum Sheets', quantity: 150, unitPrice: 400 },
    ],
    [
      { description: 'Software Licenses', quantity: 20, unitPrice: 5000 },
    ],
    [
      { description: 'Chemical Solvent A', quantity: 100, unitPrice: 200 },
      { description: 'Chemical Solvent B', quantity: 80, unitPrice: 250 },
    ],
    [
      { description: 'Motor Assembly', quantity: 8, unitPrice: 6500 },
    ],
    [
      { description: 'Office Supplies Kit', quantity: 30, unitPrice: 1500 },
    ],
  ];

  for (let i = 0; i < 15; i++) {
    const vendorIndex = i % vendors.length;
    const vendor = vendors[vendorIndex];
    const items = poItems[i];
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const poDate = new Date();
    poDate.setDate(poDate.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: generatePONumber(i + 1),
        vendorId: vendor.id,
        poDate: poDate,
        totalAmount: totalAmount,
        dueDate: calculateDueDate(poDate, vendor.paymentTerms),
        status: i < 5 ? 'Approved' : i < 10 ? 'PartiallyPaid' : i < 13 ? 'FullyPaid' : 'Draft',
        createdBy: user.id,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
    purchaseOrders.push(po);
  }

  console.log(`Created ${purchaseOrders.length} purchase orders`);

  // Helper function to generate payment reference
  const generatePaymentReference = (index) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `PAY-${dateStr}-${String(index).padStart(3, '0')}`;
  };

  // Create 10 Payments
  const paymentMethods = ['Cash', 'Cheque', 'NEFT', 'RTGS', 'UPI'];
  const payments = [];

  // Payments for PartiallyPaid POs (indices 5-9)
  for (let i = 5; i < 10; i++) {
    const po = purchaseOrders[i];
    const partialAmount = parseFloat(po.totalAmount) * 0.5; // 50% payment
    
    const payment = await prisma.payment.create({
      data: {
        referenceNumber: generatePaymentReference(payments.length + 1),
        purchaseOrderId: po.id,
        paymentDate: new Date(),
        amountPaid: partialAmount,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        notes: `Partial payment for ${po.poNumber}`,
        createdBy: user.id,
      },
    });
    payments.push(payment);
  }

  // Full payments for FullyPaid POs (indices 10-12)
  for (let i = 10; i < 13; i++) {
    const po = purchaseOrders[i];
    
    // First payment (60%)
    const firstPayment = await prisma.payment.create({
      data: {
        referenceNumber: generatePaymentReference(payments.length + 1),
        purchaseOrderId: po.id,
        paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        amountPaid: parseFloat(po.totalAmount) * 0.6,
        paymentMethod: paymentMethods[(i * 2) % paymentMethods.length],
        notes: `First payment for ${po.poNumber}`,
        createdBy: user.id,
      },
    });
    payments.push(firstPayment);

    // Second payment (remaining 40%)
    const secondPayment = await prisma.payment.create({
      data: {
        referenceNumber: generatePaymentReference(payments.length + 1),
        purchaseOrderId: po.id,
        paymentDate: new Date(),
        amountPaid: parseFloat(po.totalAmount) * 0.4,
        paymentMethod: paymentMethods[(i * 2 + 1) % paymentMethods.length],
        notes: `Final payment for ${po.poNumber}`,
        createdBy: user.id,
      },
    });
    payments.push(secondPayment);
  }

  console.log(`Created ${payments.length} payments`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
