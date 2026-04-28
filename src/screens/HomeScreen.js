import React, { useState, useCallback, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { helpRequestsAPI } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { timeAgo } from '../utils/date';

const HelpRequestCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
    <View style={styles.cardHeader}>
      <View style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
        <Text style={[styles.statusText, item.is_active ? styles.activeText : styles.inactiveText]}>
          <Feather name={item.is_active ? "check-circle" : "slash"} size={10} /> {item.is_active ? 'Active' : 'Closed'}
        </Text>
      </View>
      <Text style={styles.timeAgo}>{timeAgo(item.created_at)}</Text>
    </View>

    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
    <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>

    <View style={styles.cardFooter}>
      <View style={styles.footerItem}>
        <Feather name="map-pin" size={12} color={COLORS.textSecondary} />
        <Text style={styles.footerText} numberOfLines={1}>{item.location}</Text>
      </View>
      <View style={styles.footerItem}>
        <Feather name="message-circle" size={12} color={COLORS.textSecondary} />
        <Text style={styles.footerText}>{item.help_offers?.length || 0} offers</Text>
      </View>
    </View>

    <View style={styles.requestorRow}>
      <View style={styles.avatarSmall}>
        <Text style={styles.avatarSmallText}>{item.user?.name?.[0]?.toUpperCase() || '?'}</Text>
      </View>
      <Text style={styles.requestorName}>{item.user?.name}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterActive, setFilterActive] = useState(null); // null = all, true = active, false = inactive
  const PAGE_SIZE = 20;

  const loadRequests = useCallback(async (resetPage = false, searchTerm = search, activeFilter = filterActive) => {
    if (loading && !resetPage) return;
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    try {
      const query = {};
      if (activeFilter !== null) query.is_active = activeFilter;
      const res = await helpRequestsAPI.paginate({
        page: currentPage,
        size: PAGE_SIZE,
        search: searchTerm || null,
        query,
      });
      const newItems = res.data.items || [];
      if (resetPage) {
        setItems(newItems);
        setPage(2);
      } else {
        setItems((prev) => [...prev, ...newItems]);
        setPage((p) => p + 1);
      }
      setHasMore(newItems.length === PAGE_SIZE);
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      setLoading(false);
    }
  }, [loading, page, search, filterActive]);

  const loadRequestsRef = useRef();
  loadRequestsRef.current = loadRequests;

  useFocusEffect(
    useCallback(() => {
      // Use the ref to call the latest version of loadRequests without 
      // triggering the infinite loop caused by loadRequests' own dependencies.
      if (loadRequestsRef.current) {
        loadRequestsRef.current(true);
      }
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests(true);
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    loadRequests(true, text, filterActive);
  };

  const handleFilterChange = (val) => {
    const newFilter = filterActive === val ? null : val;
    setFilterActive(newFilter);
    loadRequests(true, search, newFilter);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadRequests(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.greeting}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.greetText}>Hello, {user?.name?.split(' ')[0] || 'there'} </Text>
          <Feather name="smile" size={22} color={COLORS.textPrimary} />
        </View>
        <Text style={styles.greetSub}>Find someone who needs a hand</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help requests..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearBtn}>
            <Feather name="x" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {[
          { label: 'All', value: null, icon: 'list' },
          { label: 'Active', value: true, icon: 'check-circle' },
          { label: 'Closed', value: false, icon: 'lock' },
        ].map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.filterChip, filterActive === f.value && styles.filterChipActive]}
            onPress={() => handleFilterChange(f.value)}
          >
            {f.icon && (
              <Feather 
                name={f.icon} 
                size={13} 
                color={filterActive === f.value ? '#fff' : COLORS.textSecondary} 
                style={{ marginRight: 4 }} 
              />
            )}
            <Text style={[styles.filterChipText, filterActive === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Help Requests</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) =>
          <HelpRequestCard item={item} onPress={(i) => navigation.navigate('HelpRequestDetail', { uuid: i.uuid })} />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Feather name="users" size={56} color={COLORS.textMuted} style={styles.emptyEmoji} />
              <Text style={styles.emptyTitle}>No help requests yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to ask your community for help!</Text>
            </View>
          ) : null
        }
        ListFooterComponent={loading && items.length > 0 ? <ActivityIndicator style={{ margin: 20 }} color={COLORS.primary} /> : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateHelpRequest')}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  listHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  greeting: {
    marginBottom: SPACING.md,
  },
  greetText: {
    fontSize: 22,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  greetSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    color: COLORS.textMuted,
    fontSize: 16,
    padding: 4,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  filterChipTextActive: {
    color: '#fff',
    ...FONTS.semiBold,
  },
  sectionTitle: {
    fontSize: 17,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  activeBadge: {
    backgroundColor: COLORS.tag.active.bg,
  },
  inactiveBadge: {
    backgroundColor: COLORS.tag.inactive.bg,
  },
  statusText: {
    fontSize: 11,
    ...FONTS.semiBold,
  },
  activeText: {
    color: COLORS.tag.active.text,
  },
  inactiveText: {
    color: COLORS.tag.inactive.text,
  },
  timeAgo: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  cardTitle: {
    fontSize: 15,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
    marginBottom: 4,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  footerIcon: {
    fontSize: 12,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  requestorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: {
    fontSize: 11,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  requestorName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 34,
    ...FONTS.bold,
  },
});
