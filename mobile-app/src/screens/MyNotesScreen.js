import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const MyNotesScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        const digitalOrders = (data || []).filter(
          (order) => order?.status === 'completed' && order?.product?.type === 'digital'
        );
        setOrders(digitalOrders);
      } catch (err) {
        console.error('Failed to fetch mobile notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return orders;
    return orders.filter((order) => {
      const title = order?.product?.title?.toLowerCase() || '';
      const category = order?.product?.category?.toLowerCase() || '';
      return title.includes(search) || category.includes(search);
    });
  }, [orders, query]);

  const renderItem = ({ item }) => (
    <View style={styles.noteCard}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.product?.category || 'Notes'}</Text>
      </View>
      <Text style={styles.noteTitle}>{item.product?.title || 'Purchased Note'}</Text>
      <Text style={styles.noteMeta}>
        Added on {new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN')}
      </Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          navigation.navigate('Reader', {
            orderId: item._id,
            title: item.product?.title || 'Read Notes'
          })
        }
      >
        <Text style={styles.primaryButtonText}>Read Now</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.hello}>Hello {user?.name || 'Student'}</Text>
        <Text style={styles.heading}>Your notes are ready in one place.</Text>
        <Text style={styles.subheading}>
          Log in and read purchased notes without searching through the website.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search notes"
          style={styles.searchInput}
        />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Purchased Notes</Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {orders.length === 0 ? 'No purchased notes yet' : 'No notes match your search'}
          </Text>
          <Text style={styles.emptyText}>
            {orders.length === 0
              ? 'After buying notes on the website, they will appear here.'
              : 'Try a different title or class name.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb'
  },
  hero: {
    padding: 20,
    paddingBottom: 10
  },
  hello: {
    color: '#2563eb',
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 6
  },
  subheading: {
    color: '#475569',
    marginTop: 8,
    lineHeight: 21
  },
  searchInput: {
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbe4f0',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a'
  },
  statLabel: {
    marginTop: 4,
    color: '#64748b',
    fontWeight: '600'
  },
  logoutButton: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '800'
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    gap: 14
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  badgeText: {
    color: '#2563eb',
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  noteTitle: {
    marginTop: 12,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0f172a'
  },
  noteMeta: {
    marginTop: 8,
    color: '#64748b',
    fontWeight: '600'
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 14
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  },
  emptyCard: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a'
  },
  emptyText: {
    marginTop: 10,
    color: '#64748b',
    lineHeight: 21
  }
});

export default MyNotesScreen;
