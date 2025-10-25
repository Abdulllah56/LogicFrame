"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register Helvetica font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' }
  ]
});

// Template-specific styles
const templateStyles = {
  modern: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    headerBg: 'linear-gradient(to right, #1e40af, #3b82f6)',
    text: '#ffffff',
    accent: '#3b82f6'
  },
  classic: {
    primary: '#1f2937',
    secondary: '#374151',
    headerBg: '#1f2937',
    text: '#ffffff',
    accent: '#374151'
  },
  minimal: {
    primary: '#ffffff',
    secondary: '#f3f4f6',
    headerBg: '#ffffff',
    text: '#111827',
    accent: '#374151'
  }
};

export function StyledInvoicePDF({ invoice, template, logo }) {
  const theme = templateStyles[template];

  // Create styles
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 12,
      fontFamily: 'Helvetica'
    },
    header: {
      backgroundColor: theme.primary,
      padding: template === 'minimal' ? 0 : 30,
      marginBottom: 30,
      borderBottom: template === 'minimal' ? '2 solid #e5e7eb' : 'none',
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      color: template === 'minimal' ? '#000000' : theme.text,
    },
    logo: {
      width: 100,
      height: 50,
      marginBottom: 10,
      objectFit: 'contain',
    },
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    section: {
      marginBottom: 20,
    },
    grid: {
      flexDirection: 'row',
      gap: 20,
    },
    column: {
      flex: 1,
    },
    label: {
      fontSize: 10,
      color: '#6B7280',
      marginBottom: 4,
    },
    value: {
      fontSize: 12,
      marginBottom: 8,
    },
    table: {
      marginVertical: 20,
    },
    tableHeader: {
      backgroundColor: theme.secondary,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      padding: 8,
      color: template === 'minimal' ? '#000000' : '#ffffff',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      padding: 8,
    },
    tableCell: {
      flex: 1,
    },
    tableCellWide: {
      flex: 2,
    },
    totals: {
      marginLeft: 'auto',
      width: '40%',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    totalValue: {
      fontWeight: 'bold',
    },
    grandTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderTopWidth: 2,
      borderTopColor: theme.accent,
      marginTop: 4,
      fontSize: 16,
      fontWeight: 'bold',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: 'center',
      color: '#6B7280',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
  });

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              {logo && <Image src={logo} style={styles.logo} />}
              <Text style={styles.title}>INVOICE</Text>
              <Text style={styles.value}>#{invoice.invoiceNumber}</Text>
            </View>
            <View>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(invoice.createdAt || new Date())}</Text>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.column}>
            <Text style={styles.label}>FROM</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>Your Company Name</Text>
            <Text style={styles.value}>your@email.com</Text>
            <Text style={styles.value}>Your Address</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>BILL TO</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>{invoice.clientName}</Text>
            <Text style={styles.value}>{invoice.clientEmail}</Text>
            <Text style={styles.value}>{invoice.projectName}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
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
              <Text style={styles.tableCell}>
                {formatCurrency(Number(item.quantity) * Number(item.rate))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({invoice.taxRate}%):</Text>
            <Text>{formatCurrency(invoice.taxAmount)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Total:</Text>
            <Text>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
}