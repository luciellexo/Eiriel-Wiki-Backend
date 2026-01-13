import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { Substance } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function WikiScreen() {
  const [query, setQuery] = useState('');
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadSubstances = async (q: string = '') => {
    setLoading(true);
    try {
      if (q.length > 0) {
        const results = await api.searchSubstances(q);
        setSubstances(results);
      } else {
        const results = await api.getAllSubstances();
        setSubstances(results);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
        loadSubstances(query);
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  const renderItem = ({ item }: { item: Substance }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={() => router.push(`/substance/${encodeURIComponent(item.name)}`)}
    >
      <View>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.summary && (
          <Text numberOfLines={2} style={styles.itemSummary}>{item.summary}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search substances..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#BB86FC" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={substances}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={20}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#1E1E1E',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: '#BB86FC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemSummary: {
    color: '#ccc',
    fontSize: 14,
    maxWidth: '90%',
  },
});
