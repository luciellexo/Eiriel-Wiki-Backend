import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDoseStore } from '../../store/useDoseStore';
import { api } from '../../services/api';
import { Substance, SubstanceRoa } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { getActiveLogs, getDurationTotalMinutes } from '../../utils/substanceUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../constants/theme';

export default function LogDoseScreen() {
  const router = useRouter();
  const { logs, addLog } = useDoseStore();
  
  // Form State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Substance[]>([]);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [selectedRoa, setSelectedRoa] = useState<SubstanceRoa | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Time Selection
  const [timestamp, setTimestamp] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Interaction Warning State
  const [interactionWarning, setInteractionWarning] = useState<{name: string, status: string} | null>(null);

  // Search Logic
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await api.searchSubstances(query);
      setSearchResults(results);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Check interactions when substance is selected
  useEffect(() => {
    if (selectedSubstance) {
      const activeLogs = getActiveLogs(logs, {});
      const activeSubstanceNames = new Set(activeLogs.map(l => l.substanceName.toLowerCase()));
      
      if (selectedSubstance.interactions_flat) {
        for (const interaction of selectedSubstance.interactions_flat) {
          if (activeSubstanceNames.has(interaction.name.toLowerCase())) {
             if (interaction.status === 'Dangerous' || interaction.status === 'Unsafe') {
                setInteractionWarning({ name: interaction.name, status: interaction.status });
                return;
             }
          }
        }
      }
      setInteractionWarning(null);
    }
  }, [selectedSubstance, logs]);

  const handleSelectSubstance = async (sub: Substance) => {
    // Fetch full details to get ROAs and Interactions
    const fullSub = await api.getSubstanceDetail(sub.name);
    if (fullSub) {
      setSelectedSubstance(fullSub);
      setQuery(fullSub.name);
      setIsSearching(false);
      // Default ROA
      if (fullSub.roas && fullSub.roas.length > 0) {
        setSelectedRoa(fullSub.roas[0]);
      }
    }
  };

  const handleSave = () => {
    if (!selectedSubstance || !amount || !selectedRoa) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt)) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }

    // Calculate Duration
    const duration = getDurationTotalMinutes(selectedSubstance, selectedRoa.name);

    addLog({
      substanceName: selectedSubstance.name,
      substanceId: selectedSubstance._id,
      amount: amt,
      unit: selectedRoa.dose?.units || 'mg',
      roa: selectedRoa.name,
      timestamp: timestamp.getTime(),
      notes: notes,
      estimatedDurationMinutes: duration,
      substanceSnapshot: {
        interactions_flat: selectedSubstance.interactions_flat
      }
    });

    // Reset
    setSelectedSubstance(null);
    setSelectedRoa(null);
    setAmount('');
    setNotes('');
    setQuery('');
    setTimestamp(new Date());
    setInteractionWarning(null);
    
    router.replace('/(tabs)');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Keep time, change date
      const newDate = new Date(selectedDate);
      newDate.setHours(timestamp.getHours());
      newDate.setMinutes(timestamp.getMinutes());
      setTimestamp(newDate);
      setShowTimePicker(true); // Automatically show time picker after date
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setTimestamp(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Substance</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search (e.g., Caffeine)"
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setIsSearching(true);
            if (selectedSubstance && t !== selectedSubstance.name) {
               setSelectedSubstance(null);
               setSelectedRoa(null);
            }
          }}
        />
      </View>

      {isSearching && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          {searchResults.map((item) => (
            <TouchableOpacity 
              key={item.name} 
              style={styles.resultItem}
              onPress={() => handleSelectSubstance(item)}
            >
              <Text style={styles.resultText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {interactionWarning && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={24} color={theme.error} />
          <Text style={styles.warningText}>
            Warning: Interaction with active {interactionWarning.name} ({interactionWarning.status})
          </Text>
        </View>
      )}

      {selectedSubstance && selectedRoa && (
        <>
          <Text style={styles.label}>Time of Dose</Text>
          <View style={styles.timeContainer}>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
              <Text style={styles.timeButtonText}>
                 {timestamp.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
              <Text style={styles.timeButtonText}>
                 {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={timestamp}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={timestamp}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          <Text style={styles.label}>Route of Administration</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roaScroll}>
            {selectedSubstance.roas.map((roa) => (
              <TouchableOpacity
                key={roa.name}
                style={[styles.roaChip, selectedRoa.name === roa.name && styles.roaChipSelected]}
                onPress={() => setSelectedRoa(roa)}
              >
                <Text style={[styles.roaText, selectedRoa.name === roa.name && styles.roaTextSelected]}>
                  {roa.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Amount ({selectedRoa.dose?.units || 'mg'})</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          
          {selectedRoa.dose && (
            <View style={styles.dosageInfo}>
               <Text style={styles.dosageText}>
                 Light: {selectedRoa.dose.light?.min}-{selectedRoa.dose.light?.max} | 
                 Common: {selectedRoa.dose.common?.min}-{selectedRoa.dose.common?.max} | 
                 Strong: {selectedRoa.dose.strong?.min}-{selectedRoa.dose.strong?.max}
               </Text>
            </View>
          )}

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional notes..."
            placeholderTextColor={theme.textSecondary}
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Log Dose</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 20, paddingBottom: 40 },
  label: { color: theme.accent, fontSize: 16, marginBottom: 8, marginTop: 16, fontWeight: 'bold' },
  input: {
    backgroundColor: theme.inputBg,
    color: theme.textPrimary,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border
  },
  searchContainer: { zIndex: 10 },
  resultsContainer: {
    backgroundColor: theme.card,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: theme.border
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  resultText: { color: theme.textPrimary },
  roaScroll: { flexDirection: 'row', marginBottom: 8 },
  roaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.card,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border
  },
  roaChipSelected: {
    backgroundColor: theme.accent,
    borderColor: theme.accent
  },
  roaText: { color: theme.textSecondary },
  roaTextSelected: { color: '#FFF', fontWeight: 'bold' },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: theme.accent,
    padding: 16, 
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  dosageInfo: { marginTop: 8 },
  dosageText: { color: theme.textSecondary, fontSize: 12 },
  warningContainer: {
    backgroundColor: 'rgba(207, 102, 121, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.error
  },
  warningText: {
    color: theme.error,
    marginLeft: 8,
    flex: 1
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.inputBg,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border
  },
  timeButtonText: {
    color: theme.textPrimary,
    marginLeft: 8,
    fontSize: 16
  }
});
