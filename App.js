import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform, Animated,
  Linking, ScrollView, Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojegaukvxjmhunqjhkxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZWdhdWt2eGptaHVucWpoa3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjk2ODksImV4cCI6MjA5NDcwNTY4OX0.q22y2v8vPAbc0qt7eBun-9XLY6NMqUiHfrv2mCTIoq4';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REGIONS = {
  'South Suburbs': ['Tinley Park', 'New Lenox', 'Frankfort', 'Orland Park', 'Mokena', 'Lockport', 'Lemont'],
  'West Suburbs':  ['Naperville', 'Downers Grove'],
  'North Suburbs': ['Arlington Heights', 'Mount Prospect', 'Schaumburg'],
};

const CATEGORY_COLORS = {
  parks:   '#2E7D32',
  village: '#1565C0',
  chamber: '#E65100',
  library: '#6A1B9A',
};

const CATEGORY_LABELS = {
  parks:   'Parks',
  village: 'Village',
  chamber: 'Chamber',
  library: 'Library',
};

const EVENT_TAGS = [
  {
    id: 'food', label: 'Food', icon: '🍕',
    keywords: ['food', 'dinner', 'lunch', 'breakfast', 'restaurant', 'taco', 'bbq',
               'grill', 'wine', 'beer', 'brew', 'bourbon', 'whiskey', 'cocktail',
               'spirits', 'feast', 'food truck', 'cuisine', 'brunch', 'eatery',
               'taste of', 'churrasco', 'steakhouse', 'yogurt', 'froyo', 'ice cream',
               'dessert', 'frozen yogurt', 'dining', 'flavor', 'chef', 'pizza',
               'pizzeria', 'malnati', 'byob', 'barbeque', 'smokehouse', 'winery'],
  },
  {
    id: 'sports', label: 'Sports', icon: '⚽',
    keywords: ['race', '5k', 'golf', 'tournament', 'tennis', 'soccer', 'football',
               'baseball', 'basketball', 'hockey', 'swimming', 'olympic', 'olympics',
               'walkathon', 'triathlon', 'fun run', 'run walk', 'league', 'fitness',
               'athletic', 'athletics', 'fishing', 'fishing derby', 'derby', 'BTL',
               'water park', 'waterpark', 'kayak', 'canoe', 'cycling', 'volleyball'],
  },
  {
    id: 'market', label: 'Market', icon: '🛍️',
    keywords: ['farmers market', 'vendor market', 'craft fair', 'flea market',
               'bazaar', 'market day', 'artisan market', 'car show', 'vendor fair'],
  },
  {
    id: 'movies', label: 'Movies', icon: '🎬',
    keywords: ['movie', 'film', 'cinema', 'screening', 'movie night', 'movies on the green',
               'despicable me', 'enchanted', 'zootopia', 'beauty and the beast'],
  },
  {
    id: 'meetings', label: 'Meetings', icon: '🤝',
    keywords: ['meeting', 'council', 'board meeting', 'commission', 'committee',
               'seminar', 'webinar', 'town hall', 'state of the village',
               'state of the city', 'young professionals', 'networking', 'summit',
               'ribbon cutting', 'ribbon-cutting', 'alzheimer', 'women in business',
               'support group', 'luncheon', 'workshop'],
  },
  {
    id: 'pets', label: 'Pets', icon: '🐾',
    keywords: ['woofstock', 'pet fair', 'dog show', 'cat show', 'animal shelter',
               'paw', 'puppy', 'kitten', 'pet adoption'],
  },
  {
    id: 'music', label: 'Music', icon: '🎵',
    keywords: ['concert', 'live music', 'band', 'stingrays', 'dynamix',
               'prairie station', 'andy grammer', 'brothers osborne', 'blue öyster'],
  },
  {
    id: 'arts', label: 'Arts', icon: '🎨',
    keywords: ['exhibit', 'gallery', 'theatre', 'theater', 'ballet', 'dance recital',
               'painting class', 'sculpture', 'arts festival', 'musical', 'open show',
               'art show', 'fine arts', 'performing arts'],
  },
  {
    id: 'festival', label: 'Festival', icon: '🎪',
    keywords: ['festival', 'car cruise', 'cruise the commons', 'outdoor event',
               'community festival', 'summer fest', 'street fest', 'carnival',
               'jubilee', 'gala', 'party in the park', 'on the lawn', 'after five', 'fridays after five',
               'live on the lawn', 'bingo', 'foam party', 'block party', 'outdoor concert'],
  },
  {
    id: 'kids', label: 'Kids', icon: '🎈',
    keywords: ['kids', 'children', 'youth', 'junior', 'toddler', 'preschool', 'teen',
               'camp', 'playground', 'superhero', 'princess', 'storytime', 'family fun',
               'safari', 'bounce house', 'mother son', 'father daughter', 'barbie',
               'play day', 'foam party', 'water park', 'waterpark', 'splash',
               'water slide', 'puppet', 'party in the usa'],
  },
  {
    id: 'holiday', label: 'Holiday', icon: '🎆',
    keywords: ['parade', 'fireworks', 'independence day', 'memorial day', 'loyalty day',
               'fourth of july', 'holiday celebration', 'veterans day'],
  },
];

// Tag from title only — descriptions bleed across events in some scrapers
// causing false positive tags.
function getEventTags(event) {
  const text = event.title;
  return EVENT_TAGS.filter(tag =>
    tag.keywords.some(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
    })
  );
}

// Colorful cartoon house icon built from Views
function HouseIcon({ size = 44 }) {
  const w = size;
  return (
    <View style={{ width: w, height: w, alignItems: 'center', justifyContent: 'flex-end' }}>

      {/* Sun */}
      <View style={{
        position: 'absolute', top: w * 0.04, left: w * 0.04,
        width: w * 0.20, height: w * 0.20, borderRadius: w * 0.10,
        backgroundColor: '#FFD93D',
      }} />

      {/* Chimney */}
      <View style={{
        position: 'absolute', top: w * 0.14, right: w * 0.21,
        width: w * 0.09, height: w * 0.20,
        backgroundColor: '#C1440E', borderRadius: 1,
      }} />

      {/* Roof */}
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: w * 0.43, borderRightWidth: w * 0.43,
        borderBottomWidth: w * 0.30,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderBottomColor: '#FF6B6B',
        marginBottom: -1, zIndex: 2,
      }} />

      {/* House body */}
      <View style={{
        width: w * 0.70, height: w * 0.38,
        backgroundColor: '#FFF8EE',
        flexDirection: 'row', alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingHorizontal: w * 0.05,
        overflow: 'hidden', zIndex: 2,
      }}>
        {/* Window */}
        <View style={{
          width: w * 0.19, height: w * 0.19,
          backgroundColor: '#48CAE4',
          borderRadius: 2, marginBottom: w * 0.08,
          borderWidth: 1.5, borderColor: '#FFF8EE',
        }} />
        {/* Door */}
        <View style={{
          width: w * 0.21, height: w * 0.28,
          backgroundColor: '#C17F4A',
          borderTopLeftRadius: w * 0.10, borderTopRightRadius: w * 0.10,
        }}>
          <View style={{
            position: 'absolute', right: w * 0.03, top: '45%',
            width: w * 0.04, height: w * 0.04,
            borderRadius: w * 0.02, backgroundColor: '#FFD93D',
          }} />
        </View>
      </View>

      {/* Grass */}
      <View style={{
        width: w * 0.86, height: w * 0.09,
        backgroundColor: '#6BCB77', borderRadius: 2,
      }} />
    </View>
  );
}

const SPLASH_ICONS = [
  { icon: '🎵', label: 'Concerts' },
  { icon: '🎭', label: 'Arts' },
  { icon: '🌽', label: 'Markets' },
  { icon: '⚽', label: 'Sports' },
  { icon: '🎨', label: 'Festivals' },
  { icon: '🎆', label: 'Events' },
  { icon: '🍕', label: 'Food' },
  { icon: '🎪', label: 'Fun' },
];

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const fadeOut  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true })
        .start(() => onDone());
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: Animated.multiply(opacity, fadeOut) }]}>
      <StatusBar style="light" />
      <View style={styles.splashLogo}>
        <HouseIcon size={90} />
      </View>
      <Text style={styles.splashTitle}>Da Burbs</Text>
      <Text style={styles.splashSubtitle}>Your everything app for{'\n'}what's going on in town.</Text>
      <View style={styles.splashGrid}>
        {SPLASH_ICONS.map((item) => (
          <View key={item.label} style={styles.splashIconCell}>
            <Text style={styles.splashIcon}>{item.icon}</Text>
            <Text style={styles.splashIconLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [splashDone, setSplashDone]         = useState(false);
  const [events, setEvents]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedTowns, setSelectedTowns]   = useState([]);
  const [selectedTags, setSelectedTags]     = useState([]);
  const [selectedDate, setSelectedDate]     = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const regionTowns      = selectedRegion ? (REGIONS[selectedRegion] || []) : [];
  const activeCommunities = selectedTowns.length > 0
    ? selectedTowns
    : (selectedRegion ? regionTowns : []);

  const selectRegion = (region) => {
    if (region === selectedRegion) { setSelectedRegion(null); setSelectedTowns([]); }
    else { setSelectedRegion(region); setSelectedTowns([]); }
  };

  const toggleTown = (town) =>
    setSelectedTowns(prev =>
      prev.includes(town) ? prev.filter(t => t !== town) : [...prev, town]
    );

  const toggleTag = (tagId) =>
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );

  // Client-side filters applied on top of Supabase results
  const displayedEvents = events.filter(e => {
    if (selectedTags.length > 0) {
      const tags = getEventTags(e);
      if (!selectedTags.some(id => tags.some(t => t.id === id))) return false;
    }
    if (selectedDate && e.start_datetime) {
      const evDate = new Date(e.start_datetime);
      if (
        evDate.getFullYear() !== selectedDate.getFullYear() ||
        evDate.getMonth()    !== selectedDate.getMonth()    ||
        evDate.getDate()     !== selectedDate.getDate()
      ) return false;
    }
    return true;
  });

  const fetchEvents = useCallback(async () => {
    const now = new Date().toISOString();
    let query = supabase
      .from('events')
      .select('*')
      .or(`start_datetime.gte.${now},start_datetime.is.null`)
      .order('start_datetime', { ascending: true, nullsFirst: false })
      .limit(150);

    if (activeCommunities.length > 0) {
      query = query.in('community', activeCommunities);
    }

    const { data, error } = await query;
    if (error) console.error('Supabase error:', error.message);
    else setEvents(data || []);
  }, [activeCommunities.join(',')]);

  useEffect(() => {
    const load = async () => { setLoading(true); await fetchEvents(); setLoading(false); };
    load();
  }, [fetchEvents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date     = new Date(dateStr);
    const today    = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isToday    = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const hasTime    = date.getHours() !== 0 || date.getMinutes() !== 0;
    const timeStr    = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (isToday)    return hasTime ? `Today at ${timeStr}` : 'Today';
    if (isTomorrow) return hasTime ? `Tomorrow at ${timeStr}` : 'Tomorrow';
    const dateOnly = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return hasTime ? `${dateOnly} at ${timeStr}` : dateOnly;
  };

  const renderEvent = ({ item }) => {
    const color     = CATEGORY_COLORS[item.category] || '#888';
    const dateLabel = formatDate(item.start_datetime);
    const tags      = getEventTags(item);

    return (
      <View style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: color }]} />
        <View style={styles.cardBody}>

          {/* Category + Community */}
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: color + '18' }]}>
              <View style={[styles.categoryDot, { backgroundColor: color }]} />
              <Text style={[styles.categoryText, { color }]}>
                {CATEGORY_LABELS[item.category] || item.category}
              </Text>
            </View>
            <Text style={styles.communityText}>{item.community}</Text>
          </View>

          {/* Title */}
          <Text style={styles.eventTitle}>{item.title}</Text>

          {/* Date */}
          {dateLabel ? (
            <View style={styles.dateRow}>
              <Text style={styles.dateDot}>•</Text>
              <Text style={styles.dateText}>{dateLabel}</Text>
            </View>
          ) : (
            <Text style={styles.dateTbd}>Date TBD</Text>
          )}

          {/* Location */}
          {item.location ? (
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          ) : null}

          {/* Description */}
          {item.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>
          ) : null}

          {/* Event type tags */}
          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.slice(0, 4).map(tag => (
                <View key={tag.id} style={styles.tagChip}>
                  <Text style={styles.tagIcon}>{tag.icon}</Text>
                  <Text style={styles.tagLabel}>{tag.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Source + link */}
          <View style={styles.cardFooter}>
            <Text style={styles.sourceText}>{item.source_name}</Text>
            {item.url ? (
              <TouchableOpacity onPress={() => Linking.openURL(item.url)} activeOpacity={0.6}>
                <Text style={styles.linkText}>View Event →</Text>
              </TouchableOpacity>
            ) : null}
          </View>

        </View>
      </View>
    );
  };

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogoRow}>
          <View style={styles.headerLogo}>
            <HouseIcon size={36} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Da Burbs</Text>
            <Text style={styles.headerSubtitle}>Your everything app for what's going on in town.</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterWrapper}>

        {/* Region row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedRegion && styles.filterChipActive]}
            onPress={() => { setSelectedRegion(null); setSelectedTowns([]); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, !selectedRegion && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>

          {Object.keys(REGIONS).map((region) => {
            const hasData = REGIONS[region].length > 0;
            const active  = selectedRegion === region;
            return (
              <TouchableOpacity
                key={region}
                style={[styles.filterChip, active && styles.filterChipActive, !hasData && styles.filterChipDisabled]}
                onPress={() => hasData && selectRegion(region)}
                activeOpacity={hasData ? 0.7 : 1}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive, !hasData && styles.filterChipTextDisabled]}>
                  {region}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Town chips */}
        {selectedRegion && regionTowns.length > 0 && (
          <View style={styles.townRow}>
            {regionTowns.map((town) => {
              const active = selectedTowns.includes(town);
              return (
                <TouchableOpacity
                  key={town}
                  style={[styles.townChip, active && styles.townChipActive]}
                  onPress={() => toggleTown(town)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.townChipText, active && styles.townChipTextActive]}>{town}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Event type tag filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagFilterContent}
          style={styles.tagFilterRow}
        >
          {EVENT_TAGS.map((tag) => {
            const active = selectedTags.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tagFilterChip, active && styles.tagFilterChipActive]}
                onPress={() => toggleTag(tag.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagFilterIcon}>{tag.icon}</Text>
                <Text style={[styles.tagFilterText, active && styles.tagFilterTextActive]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Date filter */}
        <View style={styles.dateFilterRow}>
          <TouchableOpacity
            style={[styles.dateFilterChip, selectedDate && styles.dateFilterChipActive]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateFilterIcon}>📅</Text>
            <Text style={[styles.dateFilterText, selectedDate && styles.dateFilterTextActive]}>
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : 'Pick a date'}
            </Text>
          </TouchableOpacity>
          {selectedDate && (
            <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.dateClearBtn} activeOpacity={0.7}>
              <Text style={styles.dateClearText}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.dateModalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.dateModalSheet}>
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>Select a Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.dateModalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="spinner"
              minimumDate={new Date()}
              onChange={(_, date) => { if (date) setSelectedDate(date); }}
              style={{ width: '100%' }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Event list */}
      {loading ? (
        <ActivityIndicator size="large" color="#1a3c5e" style={styles.loader} />
      ) : (
        <FlatList
          data={displayedEvents}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a3c5e" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No upcoming events found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Splash ──────────────────────────────────────────
  splash: {
    flex: 1, backgroundColor: '#1a3c5e',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30,
  },
  splashLogo: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  splashLogoText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  splashTitle:    { fontSize: 42, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, marginBottom: 10 },
  splashSubtitle: { fontSize: 16, color: '#8BAECF', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  splashGrid:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 300 },
  splashIconCell: { width: 64, alignItems: 'center', gap: 4 },
  splashIcon:     { fontSize: 30 },
  splashIconLabel:{ fontSize: 10, color: '#8BAECF', fontWeight: '500' },

  // ── Main ────────────────────────────────────────────
  container: { flex: 1, backgroundColor: '#F0F2F5' },

  header: {
    backgroundColor: '#1a3c5e',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 18, paddingHorizontal: 20,
  },
  headerLogoRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLogo: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerTitle:    { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 12, color: '#8BAECF', marginTop: 1 },

  // ── Filters ─────────────────────────────────────────
  filterWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDE3EA',
  },
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#DDE3EA',
  },
  filterChipActive:       { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  filterChipDisabled:     { opacity: 0.4 },
  filterChipText:         { fontSize: 13, fontWeight: '500', color: '#4A5568' },
  filterChipTextActive:   { color: '#FFFFFF' },
  filterChipTextDisabled: { color: '#A0AEC0' },

  townRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingBottom: 8, paddingTop: 4, gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EEF0F3',
  },
  townChip: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16,
    backgroundColor: '#EEF0F3', borderWidth: 1, borderColor: '#DDE3EA',
  },
  townChipActive:     { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  townChipText:       { fontSize: 12, fontWeight: '500', color: '#4A5568' },
  townChipTextActive: { color: '#FFFFFF' },

  // Tag filter bar
  tagFilterRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF0F3',
  },
  tagFilterContent: {
    paddingHorizontal: 12, paddingVertical: 8, gap: 6,
  },
  tagFilterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#DDE3EA',
  },
  tagFilterChipActive: { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  tagFilterIcon:       { fontSize: 13 },
  tagFilterText:       { fontSize: 12, fontWeight: '500', color: '#4A5568' },
  tagFilterTextActive: { color: '#FFFFFF' },

  // Date filter bar
  dateFilterRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EEF0F3',
  },
  dateFilterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#DDE3EA',
  },
  dateFilterChipActive: { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  dateFilterIcon:       { fontSize: 14 },
  dateFilterText:       { fontSize: 13, fontWeight: '500', color: '#4A5568' },
  dateFilterTextActive: { color: '#FFFFFF' },
  dateClearBtn:  { paddingHorizontal: 10, paddingVertical: 6 },
  dateClearText: { fontSize: 13, color: '#E53E3E', fontWeight: '500' },

  // Date Picker Modal
  dateModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  dateModalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  dateModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEF0F3',
  },
  dateModalTitle: { fontSize: 16, fontWeight: '600', color: '#1A202C' },
  dateModalDone:  { fontSize: 16, fontWeight: '600', color: '#1a3c5e' },

  // ── List ────────────────────────────────────────────
  loader:      { flex: 1 },
  listContent: { padding: 14, paddingBottom: 40, gap: 12 },

  // ── Card ────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#1a3c5e', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardAccent:  { height: 4, width: '100%' },
  cardBody:    { padding: 14 },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 5,
  },
  categoryDot:  { width: 6, height: 6, borderRadius: 3 },
  categoryText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  communityText:{ fontSize: 11, color: '#718096', fontWeight: '500' },

  eventTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C', lineHeight: 21, marginBottom: 6 },

  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  dateDot:  { color: '#1a3c5e', fontSize: 14, fontWeight: '700' },
  dateText: { fontSize: 13, color: '#1a3c5e', fontWeight: '600' },
  dateTbd:  { fontSize: 13, color: '#A0AEC0', fontStyle: 'italic', marginBottom: 4 },

  locationText:    { fontSize: 12, color: '#718096', marginBottom: 4 },
  descriptionText: { fontSize: 12, color: '#718096', lineHeight: 17, marginTop: 4, marginBottom: 6 },

  // Event type tags on card
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8, marginBottom: 4 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F7F8FA', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  tagIcon:  { fontSize: 11 },
  tagLabel: { fontSize: 10, color: '#4A5568', fontWeight: '500' },

  // Footer
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  sourceText: { fontSize: 11, color: '#A0AEC0', fontStyle: 'italic' },
  linkText:   { fontSize: 12, color: '#1a3c5e', fontWeight: '600' },

  // ── Empty ───────────────────────────────────────────
  emptyContainer: { paddingTop: 80, alignItems: 'center' },
  emptyText:      { fontSize: 15, color: '#A0AEC0' },
});
