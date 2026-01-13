import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, TextInput } from 'react-native';
import { useDoseStore } from '../../store/useDoseStore';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../constants/theme';

export default function SettingsScreen() {
  const { logs, clearLogs, favorites, themeMode, setThemeMode, updateCustomTheme } = useDoseStore();
  const theme = useTheme();
  
  // Custom Theme Modal
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempCustomColors, setTempCustomColors] = useState<Partial<ThemeColors>>({});

  const handleExport = async () => {
    const data = JSON.stringify(logs, null, 2);
    await Clipboard.setStringAsync(data);
    Alert.alert('Success', 'Logs copied to clipboard!');
  };

  const handleClear = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            clearLogs();
            Alert.alert('Cleared', 'All logs have been deleted.');
          }
        }
      ]
    );
  };

  const openLink = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  const saveCustomTheme = () => {
    updateCustomTheme(tempCustomColors);
    setThemeMode('custom');
    setShowColorPicker(false);
  };

  // Stats
  const totalLogs = logs.length;
  const uniqueSubstances = new Set(logs.map(l => l.substanceName)).size;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>Settings</Text>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
        <View style={styles.themeRow}>
          <TouchableOpacity 
            style={[styles.themeOption, themeMode === 'light' && { borderColor: theme.accent, borderWidth: 2 }]} 
            onPress={() => setThemeMode('light')}
          >
            <View style={[styles.colorPreview, { backgroundColor: '#F8F5FA' }]} />
            <Text style={[styles.themeText, { color: theme.textPrimary }]}>Light</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.themeOption, themeMode === 'dark' && { borderColor: theme.accent, borderWidth: 2 }]} 
            onPress={() => setThemeMode('dark')}
          >
            <View style={[styles.colorPreview, { backgroundColor: '#121212' }]} />
            <Text style={[styles.themeText, { color: theme.textPrimary }]}>Dark</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.themeOption, themeMode === 'custom' && { borderColor: theme.accent, borderWidth: 2 }]} 
            onPress={() => {
              setThemeMode('custom');
              setShowColorPicker(true);
            }}
          >
            <View style={[styles.colorPreview, { backgroundColor: '#FFD700' }]} />
            <Text style={[styles.themeText, { color: theme.textPrimary }]}>Custom</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{marginTop: 12}} onPress={() => setShowColorPicker(true)}>
           <Text style={{color: theme.accent, textAlign: 'center'}}>Edit Custom Theme</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Statistics</Text>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Doses Logged</Text>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{totalLogs}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Unique Substances</Text>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{uniqueSubstances}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Favorites</Text>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{favorites.length}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Data Management</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleExport}>
          <Ionicons name="copy-outline" size={20} color="#FFF" style={styles.icon} />
          <Text style={styles.buttonText}>Export Logs (JSON to Clipboard)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.error }]} onPress={handleClear}>
          <Ionicons name="trash-outline" size={20} color="#FFF" style={styles.icon} />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Harm Reduction Resources</Text>
        <TouchableOpacity style={[styles.linkButton, { borderColor: theme.border }]} onPress={() => openLink('https://psychonautwiki.org/')}>
           <Text style={[styles.linkText, { color: theme.accent }]}>PsychonautWiki</Text>
           <Ionicons name="open-outline" size={16} color={theme.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkButton, { borderColor: theme.border }]} onPress={() => openLink('https://tripsit.me/')}>
           <Text style={[styles.linkText, { color: theme.accent }]}>TripSit</Text>
           <Ionicons name="open-outline" size={16} color={theme.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkButton, { borderColor: theme.border }]} onPress={() => openLink('https://dancesafe.org/')}>
           <Text style={[styles.linkText, { color: theme.accent }]}>DanceSafe</Text>
           <Ionicons name="open-outline" size={16} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
         <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
            Disclaimer: This app is for harm reduction and educational purposes only. It does not encourage illegal activity. Always research before use.
         </Text>
         <Text style={[styles.version, { color: theme.textSecondary }]}>v1.1.0</Text>
      </View>

      {/* Custom Color Picker Modal */}
      <Modal visible={showColorPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Custom Theme</Text>
            <Text style={{color: theme.textSecondary, marginBottom: 16}}>Enter hex codes (e.g. #FF0000)</Text>
            
            <ScrollView style={{maxHeight: 300}}>
              {['background', 'card', 'textPrimary', 'accent', 'error'].map((key) => (
                <View key={key} style={{marginBottom: 12}}>
                  <Text style={{color: theme.textSecondary, marginBottom: 4, textTransform: 'capitalize'}}>{key}</Text>
                  <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                    placeholder="#......"
                    placeholderTextColor={theme.placeholder}
                    onChangeText={(text) => setTempCustomColors(prev => ({...prev, [key]: text}))}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowColorPicker(false)} style={[styles.modalButton, {backgroundColor: theme.border}]}>
                <Text style={{color: theme.textPrimary}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCustomTheme} style={[styles.modalButton, {backgroundColor: theme.accent}]}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Save & Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 24, marginTop: 40 },
  section: { marginBottom: 24, borderRadius: 12, padding: 16, shadowColor: "#000", shadowOffset: {width:0, height:1}, shadowOpacity:0.05, shadowRadius:2, elevation:2 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 16 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  button: { 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  dangerButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  icon: { marginRight: 8 },
  linkButton: { 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  linkText: { fontSize: 16 },
  footer: { marginTop: 20, alignItems: 'center' },
  disclaimer: { fontSize: 12, textAlign: 'center', marginBottom: 8 },
  version: { fontSize: 12 },
  
  // Theme Styles
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  themeOption: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 8 },
  colorPreview: { width: 40, height: 40, borderRadius: 20, marginBottom: 8, borderWidth: 1, borderColor: '#DDD' },
  themeText: { fontWeight: '500' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }
});
