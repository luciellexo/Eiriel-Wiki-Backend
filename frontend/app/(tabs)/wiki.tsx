import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { Substance } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useDoseStore } from '../../store/useDoseStore';

export default function WikiScreen() {
  const [query, setQuery] = useState('');
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toggleFavorite, isFavorite, favorites } = useDoseStore();

  const loadSubstances = async (q: string = '') => {
    setLoading(true);
    try {
      if (q.length > 0) {
        const results = await api.searchSubstances(q);
        setSubstances(results);
      } else {
        const results = await api.getAllSubstances();
        // Sort: Favorites first, then alphabetical
        const sorted = results.sort((a, b) => {
           const favA = isFavorite(a.name) ? 1 : 0;
           const favB = isFavorite(b.name) ? 1 : 0;
           if (favA !== favB) return favB - favA;
           return a.name.localeCompare(b.name);
        });
        setSubstances(sorted);
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
  }, [query, favorites]); // Reload when favorites change

  const renderItem = ({ item }: { item: Substance }) => {
    const fav = isFavorite(item.name);
    return (
      <TouchableOpacity 
        style={styles.item} 
        onPress={() => router.push(`/substance/${encodeURIComponent(item.name)}`)}
      >
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
             <Text style={styles.itemName}>{item.name}</Text>
             {fav && <Ionicons name="star" size={14} color="#CF6679" style={{marginLeft: 6}} />}
          </View>
          {item.summary && (
            <Text numberOfLines={2} style={styles.itemSummary}>{item.summary}</Text>
          )}
        </View>
        <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.name);
        }}>
           <Ionicons name={fav ? "star" : "star-outline"} size={22} color={fav ? "#CF6679" : "#666"} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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
