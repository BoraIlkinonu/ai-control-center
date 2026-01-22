/**
 * MOCK EXTERNAL SERVICES
 * Simulates real-world integrations for demo/training
 */

// In-memory databases
const databases = {
  // CRM Database
  crm: {
    customers: [],
    contacts: [],
    opportunities: [],
    activities: []
  },

  // ERP Database
  erp: {
    inventory: [],
    purchaseOrders: [],
    salesOrders: [],
    invoices: [],
    payments: []
  },

  // HR System
  hr: {
    employees: [],
    attendance: [],
    payroll: [],
    leaveRequests: []
  },

  // Quality Management
  qms: {
    defects: [],
    audits: [],
    corrativeActions: [],
    supplierScores: []
  }
};

// Email inbox
const emailInbox = [];

// SMS log
const smsLog = [];

// Webhook calls log
const webhookLog = [];

// Notifications
const notifications = [];

// ============================================
// MOCK EMAIL SERVICE (like SendGrid/Mailgun)
// ============================================
const EmailService = {
  async send({ to, from = 'system@soundpod-manufacturing.com', subject, body, template, data }) {
    const email = {
      id: `EMAIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      to: Array.isArray(to) ? to : [to],
      from,
      subject,
      body: template ? EmailService.renderTemplate(template, data) : body,
      status: 'delivered',
      opened: false,
      clicked: false
    };

    emailInbox.push(email);

    // Simulate delivery delay
    await new Promise(r => setTimeout(r, 100));

    return {
      success: true,
      messageId: email.id,
      message: `Email sent to ${email.to.join(', ')}`
    };
  },

  renderTemplate(template, data) {
    const templates = {
      'po-created': `
        Purchase Order Created
        ----------------------
        PO Number: ${data?.poNumber || 'N/A'}
        Supplier: ${data?.supplierName || 'N/A'}
        Total Amount: $${data?.totalAmount || 0}

        Please review and confirm delivery date.
      `,
      'quality-alert': `
        ⚠️ QUALITY ALERT
        ----------------
        Defect Category: ${data?.category || 'N/A'}
        Severity: ${data?.severity || 'N/A'}
        Affected Units: ${data?.count || 0}

        Immediate action required.
      `,
      'shipment-notification': `
        📦 Shipment Dispatched
        ----------------------
        Order: ${data?.orderId || 'N/A'}
        Tracking: ${data?.trackingNumber || 'N/A'}
        Carrier: ${data?.carrier || 'N/A'}
        ETA: ${data?.eta || 'N/A'}
      `,
      'invoice': `
        Invoice ${data?.invoiceNumber || 'N/A'}
        --------------------------
        Customer: ${data?.customerName || 'N/A'}
        Amount Due: $${data?.amount || 0}
        Due Date: ${data?.dueDate || 'N/A'}

        Thank you for your business.
      `
    };
    return templates[template] || `Template: ${template}\nData: ${JSON.stringify(data)}`;
  },

  getInbox() {
    return emailInbox.slice().reverse();
  },

  markAsRead(emailId) {
    const email = emailInbox.find(e => e.id === emailId);
    if (email) email.opened = true;
    return email;
  }
};

// ============================================
// MOCK SMS SERVICE (like Twilio)
// ============================================
const SMSService = {
  async send({ to, body, from = '+1-555-SOUNDPOD' }) {
    const sms = {
      id: `SMS-${Date.now()}`,
      timestamp: new Date().toISOString(),
      to,
      from,
      body,
      status: 'delivered'
    };

    smsLog.push(sms);
    await new Promise(r => setTimeout(r, 50));

    return { success: true, sid: sms.id };
  },

  getLog() {
    return smsLog.slice().reverse();
  }
};

// ============================================
// MOCK CRM SERVICE (like Salesforce/HubSpot)
// ============================================
const CRMService = {
  async getCustomer(customerId) {
    return databases.crm.customers.find(c => c.id === customerId) || {
      id: customerId,
      name: `Customer ${customerId}`,
      email: `customer${customerId}@example.com`,
      tier: 'Standard',
      lifetimeValue: Math.floor(Math.random() * 100000)
    };
  },

  async updateCustomer(customerId, updates) {
    let customer = databases.crm.customers.find(c => c.id === customerId);
    if (!customer) {
      customer = { id: customerId };
      databases.crm.customers.push(customer);
    }
    Object.assign(customer, updates, { updatedAt: new Date().toISOString() });
    return customer;
  },

  async createActivity(customerId, activity) {
    const record = {
      id: `ACT-${Date.now()}`,
      customerId,
      ...activity,
      timestamp: new Date().toISOString()
    };
    databases.crm.activities.push(record);
    return record;
  },

  async createOpportunity(data) {
    const opp = {
      id: `OPP-${Date.now()}`,
      ...data,
      stage: data.stage || 'New',
      probability: data.probability || 20,
      createdAt: new Date().toISOString()
    };
    databases.crm.opportunities.push(opp);
    return opp;
  },

  getActivities() {
    return databases.crm.activities.slice().reverse();
  }
};

// ============================================
// MOCK ERP SERVICE (like SAP/Oracle)
// ============================================
const ERPService = {
  async createPurchaseOrder(data) {
    const po = {
      id: `PO-${Date.now()}`,
      poNumber: `PO-2025-${String(databases.erp.purchaseOrders.length + 1).padStart(5, '0')}`,
      ...data,
      status: 'Created',
      createdAt: new Date().toISOString()
    };
    databases.erp.purchaseOrders.push(po);

    // Send email to supplier
    await EmailService.send({
      to: data.supplierEmail || 'supplier@example.com',
      subject: `New Purchase Order: ${po.poNumber}`,
      template: 'po-created',
      data: { poNumber: po.poNumber, supplierName: data.supplierName, totalAmount: data.totalAmount }
    });

    return po;
  },

  async updateInventory(sku, quantity, type = 'adjustment') {
    let item = databases.erp.inventory.find(i => i.sku === sku);
    if (!item) {
      item = { sku, quantity: 0, reserved: 0 };
      databases.erp.inventory.push(item);
    }

    if (type === 'receipt') item.quantity += quantity;
    else if (type === 'issue') item.quantity -= quantity;
    else if (type === 'reserve') item.reserved += quantity;
    else item.quantity = quantity;

    item.lastUpdated = new Date().toISOString();
    return item;
  },

  async createInvoice(data) {
    const invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV-2025-${String(databases.erp.invoices.length + 1).padStart(5, '0')}`,
      ...data,
      status: 'Sent',
      createdAt: new Date().toISOString()
    };
    databases.erp.invoices.push(invoice);

    // Send invoice email
    await EmailService.send({
      to: data.customerEmail || 'customer@example.com',
      subject: `Invoice ${invoice.invoiceNumber}`,
      template: 'invoice',
      data: {
        invoiceNumber: invoice.invoiceNumber,
        customerName: data.customerName,
        amount: data.amount,
        dueDate: data.dueDate
      }
    });

    return invoice;
  },

  async processPayment(data) {
    const payment = {
      id: `PAY-${Date.now()}`,
      ...data,
      status: 'Completed',
      processedAt: new Date().toISOString()
    };
    databases.erp.payments.push(payment);
    return payment;
  },

  getPurchaseOrders() {
    return databases.erp.purchaseOrders.slice().reverse();
  },

  getInvoices() {
    return databases.erp.invoices.slice().reverse();
  }
};

// ============================================
// MOCK SUPPLIER PORTAL
// ============================================
const SupplierPortal = {
  async sendQualityAlert(supplierId, data) {
    const alert = {
      id: `ALERT-${Date.now()}`,
      supplierId,
      ...data,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    databases.qms.corrativeActions.push(alert);

    // Send email to supplier
    await EmailService.send({
      to: `supplier-${supplierId}@example.com`,
      subject: `Quality Alert - Action Required`,
      template: 'quality-alert',
      data
    });

    return alert;
  },

  async scheduleAudit(supplierId, data) {
    const audit = {
      id: `AUDIT-${Date.now()}`,
      supplierId,
      ...data,
      status: 'Scheduled',
      scheduledDate: data.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    databases.qms.audits.push(audit);

    // Notify supplier
    await EmailService.send({
      to: `supplier-${supplierId}@example.com`,
      subject: `Quality Audit Scheduled - ${audit.scheduledDate}`,
      body: `A quality audit has been scheduled for ${audit.scheduledDate}. Please prepare relevant documentation.`
    });

    return audit;
  },

  async updateSupplierScore(supplierId, score, reason) {
    const record = {
      id: `SCORE-${Date.now()}`,
      supplierId,
      score,
      reason,
      timestamp: new Date().toISOString()
    };
    databases.qms.supplierScores.push(record);
    return record;
  },

  getAudits() {
    return databases.qms.audits;
  }
};

// ============================================
// MOCK SHIPPING/LOGISTICS (like FedEx/UPS API)
// ============================================
const ShippingService = {
  carriers: ['FedEx', 'UPS', 'DHL', 'USPS'],

  async createShipment(data) {
    const carrier = data.carrier || this.carriers[Math.floor(Math.random() * this.carriers.length)];
    const shipment = {
      id: `SHP-${Date.now()}`,
      trackingNumber: `${carrier.toUpperCase().substr(0,2)}${Date.now()}`,
      carrier,
      ...data,
      status: 'Label Created',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        { timestamp: new Date().toISOString(), status: 'Label Created', location: 'Origin Facility' }
      ]
    };

    // Send notification
    await EmailService.send({
      to: data.customerEmail || 'customer@example.com',
      subject: `Your order has shipped! Tracking: ${shipment.trackingNumber}`,
      template: 'shipment-notification',
      data: {
        orderId: data.orderId,
        trackingNumber: shipment.trackingNumber,
        carrier,
        eta: shipment.estimatedDelivery
      }
    });

    return shipment;
  },

  async getTrackingInfo(trackingNumber) {
    return {
      trackingNumber,
      status: 'In Transit',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        { timestamp: new Date().toISOString(), status: 'In Transit', location: 'Distribution Center' },
        { timestamp: new Date(Date.now() - 1000).toISOString(), status: 'Departed Facility', location: 'Origin' }
      ]
    };
  }
};

// ============================================
// MOCK PAYMENT GATEWAY (like Stripe)
// ============================================
const PaymentGateway = {
  async chargeCard(data) {
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 500));

    const success = Math.random() > 0.05; // 95% success rate

    return {
      id: `ch_${Date.now()}`,
      amount: data.amount,
      currency: data.currency || 'usd',
      status: success ? 'succeeded' : 'failed',
      paymentMethod: data.paymentMethod || 'card_****4242',
      created: new Date().toISOString()
    };
  },

  async createRefund(chargeId, amount) {
    return {
      id: `rf_${Date.now()}`,
      chargeId,
      amount,
      status: 'succeeded',
      created: new Date().toISOString()
    };
  }
};

// ============================================
// MOCK HR SYSTEM (like Workday/BambooHR)
// ============================================
const HRService = {
  async requestOvertime(data) {
    const request = {
      id: `OT-${Date.now()}`,
      ...data,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Auto-approve if less than 20 hours
    if (data.hours && data.hours <= 20) {
      request.status = 'Approved';
      request.approvedBy = 'System (Auto-approved)';
    }

    // Notify HR
    await EmailService.send({
      to: 'hr@soundpod-manufacturing.com',
      subject: `Overtime Request: ${data.department} - ${data.hours} hours`,
      body: `Overtime request for ${data.department}:\n\nHours: ${data.hours}\nReason: ${data.reason}\nStatus: ${request.status}`
    });

    return request;
  },

  async scheduleShift(data) {
    return {
      id: `SHIFT-${Date.now()}`,
      ...data,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };
  }
};

// ============================================
// NOTIFICATION SERVICE
// ============================================
const NotificationService = {
  async push(data) {
    const notification = {
      id: `NOTIF-${Date.now()}`,
      ...data,
      read: false,
      timestamp: new Date().toISOString()
    };
    notifications.push(notification);
    return notification;
  },

  getAll() {
    return notifications.slice().reverse();
  },

  markAsRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif;
  }
};

// ============================================
// WEBHOOK SERVICE
// ============================================
const WebhookService = {
  async call(url, data) {
    const log = {
      id: `WH-${Date.now()}`,
      url,
      data,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
    webhookLog.push(log);
    return log;
  },

  getLog() {
    return webhookLog.slice().reverse();
  }
};

// ============================================
// GET ALL SERVICE DATA (for dashboard)
// ============================================
function getAllServiceData() {
  return {
    emails: emailInbox.slice().reverse().slice(0, 50),
    sms: smsLog.slice().reverse().slice(0, 20),
    notifications: notifications.slice().reverse().slice(0, 30),
    webhooks: webhookLog.slice().reverse().slice(0, 20),
    crm: {
      customers: databases.crm.customers.length,
      activities: databases.crm.activities.slice(-20),
      opportunities: databases.crm.opportunities
    },
    erp: {
      purchaseOrders: databases.erp.purchaseOrders.slice(-20),
      invoices: databases.erp.invoices.slice(-20),
      inventory: databases.erp.inventory
    },
    qms: {
      audits: databases.qms.audits,
      alerts: databases.qms.corrativeActions.slice(-20)
    }
  };
}

module.exports = {
  EmailService,
  SMSService,
  CRMService,
  ERPService,
  SupplierPortal,
  ShippingService,
  PaymentGateway,
  HRService,
  NotificationService,
  WebhookService,
  getAllServiceData,
  databases
};
