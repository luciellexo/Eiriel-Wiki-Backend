import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { Substance } from '../../types';

export default function SubstanceDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [substance, setSubstance] = useState<Substance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      loadSubstance();
    }
  }, [name]);

  const loadSubstance = async () => {
    if (!name) return;
    setLoading(true);
    const data = await api.getSubstanceDetail(name);
    setSubstance(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  if (!substance) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Substance not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{substance.name}</Text>
      
      {substance.summary && (
        <View style={styles.section}>
          <Text style={styles.summary}>{substance.summary}</Text>
        </View>
      )}

      {substance.roas && substance.roas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dosage & Duration</Text>
          {substance.roas.map((roa, index) => (
            <View key={index} style={styles.roaContainer}>
              <Text style={styles.roaName}>{roa.name}</Text>
              
              {roa.dose && (
                <View style={styles.table}>
                  <Text style={styles.tableHeader}>Dosage ({roa.dose.units})</Text>
                  {roa.dose.threshold !== null && <Text style={styles.row}>Threshold: {roa.dose.threshold}</Text>}
                  {roa.dose.light && <Text style={styles.row}>Light: {roa.dose.light.min}-{roa.dose.light.max}</Text>}
                  {roa.dose.common && <Text style={styles.row}>Common: {roa.dose.common.min}-{roa.dose.common.max}</Text>}
                  {roa.dose.strong && <Text style={styles.row}>Strong: {roa.dose.strong.min}-{roa.dose.strong.max}</Text>}
                  {roa.dose.heavy !== null && <Text style={styles.row}>Heavy: {roa.dose.heavy}+</Text>}
                </View>
              )}

              {roa.duration && (
                <View style={styles.table}>
                   <Text style={styles.tableHeader}>Duration</Text>
                   {roa.duration.onset && <Text style={styles.row}>Onset: {roa.duration.onset.min}-{roa.duration.onset.max} {roa.duration.onset.units}</Text>}
                   {roa.duration.total && <Text style={styles.row}>Total: {roa.duration.total.min}-{roa.duration.total.max} {roa.duration.total.units}</Text>}
                   {roa.duration.afterglow && <Text style={styles.row}>Afterglow: {roa.duration.afterglow.min}-{roa.duration.afterglow.max} {roa.duration.afterglow.units}</Text>}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {substance.interactions_flat && substance.interactions_flat.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactions</Text>
          {substance.interactions_flat.map((interaction, index) => (
            <View key={index} style={styles.interactionRow}>
              <Text style={[
                styles.interactionName, 
                interaction.status === 'Dangerous' ? styles.dangerous :
                interaction.status === 'Unsafe' ? styles.unsafe :
                styles.caution
              ]}>
                {interaction.name}
              </Text>
              <Text style={styles.interactionStatus}>{interaction.status}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#BB86FC',
    marginBottom: 16,
  },
  summary: {
    color: '#E0E0E0',
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  roaContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 16,
  },
  roaName: {
    fontSize: 18,
    color: '#03DAC6',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  table: {
    marginBottom: 8,
  },
  tableHeader: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  row: {
    color: '#ccc',
    fontSize: 15,
    marginBottom: 2,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  interactionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  interactionStatus: {
    color: '#888',
    fontSize: 14,
  },
  dangerous: { color: '#CF6679' },
  unsafe: { color: '#FFB74D' },
  caution: { color: '#FFD54F' },
  errorText: {
    color: '#CF6679',
    fontSize: 18,
  },
});
