import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';

// Use system fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' }
  ]
});

const templateStyles = {
  modern: {
    headerBg: '#1e40af',
    headerText: '#ffffff',
    accent: '#3b82f6',
    border: '#e5e7eb'
  },
  classic: {
    headerBg: '#1f2937',
    headerText: '#ffffff',
    accent: '#374151',
    border: '#1f2937'
  },
  minimal: {
    headerBg: '#ffffff',
    headerText: '#111827',
    accent: '#374151',
    border: '#e5e7eb'
  }
};

const createStyles = (template) => {
  const colors = templateStyles[template];
  
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 30,
      fontFamily: 'Helvetica',
    },
    header: {
      backgroundColor: colors.headerBg,
      padding: 30,
      marginBottom: 20,
    },
    headerText: {
      color: colors.headerText,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    section: {
      margin: 10,
      padding: 10,
    },
    table: {
      width: 'auto',
      marginBottom: 10,
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#000',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomColor: '#000',
      borderBottomWidth: 1,
      alignItems: 'center',
      minHeight: 30,
    },
    tableHeader: {
      backgroundColor: '#f0f0f0',
    },
    tableCell: {
      flex: 1,
      padding: 5,
    },
    total: {
      marginTop: 20,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#000',
    },
    label: {
      fontSize: 10,
      color: '#666',
      marginBottom: 4,
    },
    value: {
      fontSize: 12,
      marginBottom: 8,
    },
  });
};

// Create Document Component
export function InvoicePDF({ invoice, template = 'modern', logo }) {
  // Validate required data
  if (!invoice || !invoice.items) {
    throw new Error('Invalid invoice data provided to PDF generator');
  }

  // Get current template styles
  const currentStyle = templateStyles[template];
  
  // Create styles based on template
  const styles = createStyles(template);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logo && (
            <Image 
              src={logo} 
              style={{ width: 100, height: 50, marginBottom: 10 }} 
            />
          )}
          <Text style={[styles.title, styles.headerText]}>INVOICE</Text>
          <Text style={[styles.value, styles.headerText]}>#{invoice.invoiceNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Client Information</Text>
          <Text style={styles.value}>{invoice.clientName}</Text>
          <Text style={styles.value}>{invoice.clientEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Project Details</Text>
          <Text style={styles.value}>{invoice.projectName}</Text>
          {invoice.description && (
            <Text style={styles.value}>{invoice.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Description</Text>
              <Text style={styles.tableCell}>Quantity</Text>
              <Text style={styles.tableCell}>Rate</Text>
              <Text style={styles.tableCell}>Amount</Text>
            </View>
            {invoice.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.description}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCell}>${item.rate}</Text>
                <Text style={styles.tableCell}>${item.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.total]}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5 }}>
            <Text style={{ marginRight: 20 }}>Subtotal:</Text>
            <Text>${invoice.subtotal}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5 }}>
            <Text style={{ marginRight: 20 }}>Tax ({invoice.taxRate}%):</Text>
            <Text>${invoice.taxAmount}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5 }}>
            <Text style={{ marginRight: 20, fontWeight: 'bold' }}>Total:</Text>
            <Text style={{ fontWeight: 'bold' }}>${invoice.total}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.value}>
            {new Date(invoice.dueDate).toLocaleDateString()}
          </Text>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}