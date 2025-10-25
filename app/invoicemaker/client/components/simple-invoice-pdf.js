import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Helvetica font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #EEE',
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  section: {
    margin: 10,
    padding: 10
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5
  },
  column: {
    flex: 1
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4
  },
  value: {
    fontSize: 12,
    marginBottom: 8
  },
  table: {
    marginVertical: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 8
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 2,
    borderBottomColor: '#DDD'
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10
  },
  tableCellWide: {
    flex: 2,
    padding: 5,
    fontSize: 10
  },
  totals: {
    marginLeft: 'auto',
    width: '40%',
    marginTop: 20
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 4
  },
  totalLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 11
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 11
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 14,
    borderTopWidth: 2,
    borderTopColor: '#DDD',
    marginTop: 4,
    paddingTop: 4
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10
  }
});

export function SimpleInvoicePDF({ invoice }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Invoice Number</Text>
              <Text style={styles.value}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(invoice.createdAt || new Date())}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.label}>BILL TO</Text>
          <Text style={[styles.value, { fontWeight: 'bold' }]}>{invoice.clientName}</Text>
          <Text style={styles.value}>{invoice.clientEmail}</Text>
          <Text style={styles.value}>{invoice.projectName}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCellWide}>Description</Text>
            <Text style={styles.tableCell}>Quantity</Text>
            <Text style={styles.tableCell}>Rate</Text>
            <Text style={styles.tableCell}>Amount</Text>
          </View>

          {invoice.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCellWide}>{item.description}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>{formatCurrency(item.rate)}</Text>
              <Text style={styles.tableCell}>{formatCurrency(Number(item.quantity) * Number(item.rate))}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
}