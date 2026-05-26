import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform, Animated,
  Linking, ScrollView, Modal, ActionSheetIOS, Alert, Image, Share,
} from 'react-native';
import * as ExpoCalendar from 'expo-calendar';
import { Calendar } from 'react-native-calendars';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ojegaukvxjmhunqjhkxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZWdhdWt2eGptaHVucWpoa3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjk2ODksImV4cCI6MjA5NDcwNTY4OX0.q22y2v8vPAbc0qt7eBun-9XLY6NMqUiHfrv2mCTIoq4';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REGIONS = {
  'South Suburbs': ['Tinley Park', 'New Lenox', 'Frankfort', 'Orland Park', 'Mokena', 'Lockport'],
  'West Suburbs':  ['Naperville', 'Downers Grove', 'Oak Park', 'Wheaton', 'Elmhurst'],
  'North Suburbs': ['Arlington Heights', 'Mount Prospect', 'Schaumburg', 'Evanston', 'Waukegan', 'Palatine', 'Buffalo Grove', 'Hoffman Estates'],
};

const CATEGORY_COLORS = {
  parks:   '#2E7D32',
  village: '#1565C0',
  chamber: '#E65100',
  library: '#6A1B9A',
  music:   '#AD1457',
  market:  '#00695C',
};

const CATEGORY_LABELS = {
  parks:   'Parks',
  village: 'Village',
  chamber: 'Chamber',
  library: 'Library',
  music:   'Music',
  market:  'Market',
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
    keywords: ['farmers market', 'country market', 'vendor market', 'craft fair', 'flea market',
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

function getEventTags(event) {
  const text = event.title;
  return EVENT_TAGS.filter(tag =>
    tag.keywords.some(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
    })
  );
}

async function addToCalendar(event) {
  const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow calendar access in Settings to add events.');
    return;
  }

  const startDate = event.start_datetime ? new Date(event.start_datetime) : new Date();
  const endDate   = new Date(startDate.getTime() + 60 * 60 * 1000); // default +1 hour

  ActionSheetIOS.showActionSheetWithOptions(
    { options: ['Apple Calendar', 'Google Calendar', 'Cancel'], cancelButtonIndex: 2 },
    async (idx) => {
      if (idx === 0) {
        try {
          const cals = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
          const cal  = cals.find(c => c.allowsModifications) || cals[0];
          if (!cal) { Alert.alert('No calendar found'); return; }
          await ExpoCalendar.createEventAsync(cal.id, {
            title:     event.title,
            startDate,
            endDate,
            notes:     event.description || '',
            location:  event.location    || '',
          });
          Alert.alert('Added!', `"${event.title}" was added to your calendar.`);
        } catch {
          Alert.alert('Error', 'Could not add the event to your calendar.');
        }
      } else if (idx === 1) {
        const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const qs  = new URLSearchParams({
          action:   'TEMPLATE',
          text:     event.title,
          dates:    `${fmt(startDate)}/${fmt(endDate)}`,
          details:  event.description || '',
          location: event.location    || '',
        });
        Linking.openURL(`https://calendar.google.com/calendar/render?${qs.toString()}`);
      }
    }
  );
}

async function shareEvent(event, dateLabel) {
  const lines = [event.title];
  if (dateLabel)        lines.push(dateLabel);
  if (event.location)   lines.push(event.location);
  if (event.url)        lines.push(event.url);
  try {
    await Share.share({ message: lines.join('\n') });
  } catch { /* user cancelled or error */ }
}

const SPLASH_ICONS = [
  { icon: '🎵', label: 'Concerts' },
  { icon: '🎭', label: 'Arts' },
  { icon: '🌽', label: 'Markets' },
  { icon: '⚽', label: 'Sports' },
  { icon: '🎪', label: 'Festivals' },
  { icon: '🎆', label: 'Events' },
  { icon: '🍕', label: 'Food' },
  { icon: '🎡', label: 'Fun' },
];

const STREAMERS = [
  { color: '#FF6B6B', top: -10, left: '2%',   rotate: '20deg',  width: 7,  height: 130 },
  { color: '#FFD93D', top: -5,  left: '16%',  rotate: '-15deg', width: 5,  height: 100 },
  { color: '#6BCB77', top: -10, left: '32%',  rotate: '10deg',  width: 8,  height: 115 },
  { color: '#48CAE4', top: -5,  left: '50%',  rotate: '-25deg', width: 6,  height: 95  },
  { color: '#C17F4A', top: -10, left: '67%',  rotate: '18deg',  width: 7,  height: 120 },
  { color: '#48CAE4', top: -5,  right: '26%', rotate: '-10deg', width: 6,  height: 108 },
  { color: '#FF6B6B', top: -5,  right: '14%', rotate: '-12deg', width: 5,  height: 105 },
  { color: '#6BCB77', top: -10, right: '2%',  rotate: '22deg',  width: 7,  height: 118 },
  { color: '#FFD93D', bottom: -10, left: '5%',   rotate: '-20deg', width: 6, height: 110 },
  { color: '#6BCB77', bottom: -5,  left: '20%',  rotate: '15deg',  width: 8, height: 125 },
  { color: '#48CAE4', bottom: -10, left: '38%',  rotate: '-8deg',  width: 5, height: 100 },
  { color: '#C17F4A', bottom: -5,  left: '56%',  rotate: '22deg',  width: 7, height: 115 },
  { color: '#6BCB77', bottom: -10, right: '28%', rotate: '-5deg',  width: 6, height: 108 },
  { color: '#FF6B6B', bottom: -10, right: '16%', rotate: '-18deg', width: 6, height: 105 },
  { color: '#FFD93D', bottom: -5,  right: '3%',  rotate: '14deg',  width: 5, height: 95  },
];

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

      {/* Streamers */}
      {STREAMERS.map((s, i) => (
        <View key={i} style={[styles.streamer, {
          backgroundColor: s.color,
          top: s.top ?? undefined,
          bottom: s.bottom ?? undefined,
          left: s.left ?? undefined,
          right: s.right ?? undefined,
          width: s.width,
          height: s.height,
          transform: [{ rotate: s.rotate }],
        }]} />
      ))}

      <View style={styles.splashLogo}>
        <Image source={require('./assets/icon.png')} style={styles.splashLogoImg} />
      </View>
      <Text style={styles.splashTitle}>Da Burbs</Text>
      <Text style={styles.splashSubtitle}>Find Fun and Events in the Chicagoland</Text>
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

export default function App() {
  const [splashDone, setSplashDone]           = useState(false);
  const [events, setEvents]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedTowns, setSelectedTowns]     = useState([]);
  const [selectedTags, setSelectedTags]       = useState([]);
  const [selectedDate, setSelectedDate]       = useState(null);
  const [weekendMode, setWeekendMode]         = useState(false);
  const [showDatePicker, setShowDatePicker]   = useState(false);
  const [filtersOpen, setFiltersOpen]         = useState(true);
  const [favRegions, setFavRegions]           = useState([]);
  const [favTowns, setFavTowns]               = useState([]);
  const [favLoaded, setFavLoaded]             = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('favRegions'),
      AsyncStorage.getItem('favTowns'),
    ]).then(([rv, tv]) => {
      if (rv) { const r = JSON.parse(rv); setFavRegions(r); if (r.length) setSelectedRegions(r); }
      if (tv) { const t = JSON.parse(tv); setFavTowns(t); if (t.length) setSelectedTowns(t); }
      setFavLoaded(true);
    });
  }, []);

  const toggleFavRegion = async (region) => {
    const next = favRegions.includes(region) ? favRegions.filter(r => r !== region) : [...favRegions, region];
    setFavRegions(next);
    await AsyncStorage.setItem('favRegions', JSON.stringify(next));
  };

  const toggleFavTown = async (town) => {
    const next = favTowns.includes(town) ? favTowns.filter(t => t !== town) : [...favTowns, town];
    setFavTowns(next);
    await AsyncStorage.setItem('favTowns', JSON.stringify(next));
  };

  const regionTowns = selectedRegions.length > 0
    ? [...new Set(selectedRegions.flatMap(r => REGIONS[r] || []))]
    : [];

  const activeCommunities = selectedTowns.length > 0
    ? selectedTowns
    : regionTowns;

  const toggleRegion = (region) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
    setSelectedTowns([]);
  };

  const clearAll = () => { setSelectedRegions([]); setSelectedTowns([]); };

  const toggleTown = (town) =>
    setSelectedTowns(prev =>
      prev.includes(town) ? prev.filter(t => t !== town) : [...prev, town]
    );

  const toggleTag = (tagId) =>
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );

  // ── Ads ─────────────────────────────────────────────
  const [ads, setAds] = useState([]);

  const fetchAds = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .or(`start_date.is.null,start_date.lte.${today}`);
      if (error) return; // table may not exist yet — fail silently
      const visible = (data || []).filter(ad => {
        if (!ad.communities || ad.communities.length === 0) return true;
        if (activeCommunities.length === 0) return true;
        return ad.communities.some(c => activeCommunities.includes(c));
      });
      setAds(visible);
    } catch { /* ignore */ }
  }, [activeCommunities.join(',')]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  // Returns [Fri, Sat, Sun] of the current/upcoming weekend, dropping days already past.
  function getWeekendDates() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dow = today.getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
    // How many days until (or since) the Friday of this/next weekend
    const daysToFriday = dow === 0 ? -6     // Sun → last Fri (current weekend in progress)
                       : dow <= 4  ? 5 - dow // Mon–Thu → next Fri
                       : 5 - dow;            // Fri(0) Sat(-1) → this weekend's Fri
    const friday = new Date(todayStart);
    friday.setDate(todayStart.getDate() + daysToFriday);
    return [0, 1, 2].map(n => {
      const d = new Date(friday);
      d.setDate(friday.getDate() + n);
      return d;
    }).filter(d => d >= todayStart);
  }

  const weekendDates = weekendMode ? getWeekendDates() : [];

  const displayedEvents = events.filter(e => {
    if (selectedTags.length > 0) {
      const tags = getEventTags(e);
      if (!selectedTags.some(id => tags.some(t => t.id === id))) return false;
    }
    if (weekendMode) {
      if (!e.start_datetime) return false;
      const evDate = new Date(e.start_datetime);
      const matches = weekendDates.some(wd =>
        evDate.getFullYear() === wd.getFullYear() &&
        evDate.getMonth()    === wd.getMonth()    &&
        evDate.getDate()     === wd.getDate()
      );
      if (!matches) return false;
    } else if (selectedDate) {
      if (!e.start_datetime) return false;
      const evDate = new Date(e.start_datetime);
      if (
        evDate.getFullYear() !== selectedDate.getFullYear() ||
        evDate.getMonth()    !== selectedDate.getMonth()    ||
        evDate.getDate()     !== selectedDate.getDate()
      ) return false;
    }
    return true;
  });

  // Interleave ads into the event list every 8 events
  const AD_INTERVAL = 8;
  const feedData = [];
  let adIdx = 0;
  displayedEvents.forEach((event, i) => {
    feedData.push({ type: 'event', data: event, key: `event-${event.id}` });
    if (ads.length > 0 && (i + 1) % AD_INTERVAL === 0) {
      const ad = ads[adIdx % ads.length];
      feedData.push({ type: 'ad', data: ad, key: `ad-${ad.id}-${i}` });
      adIdx++;
    }
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
    if (!favLoaded) return;
    const load = async () => { setLoading(true); await fetchEvents(); setLoading(false); };
    load();
  }, [fetchEvents, favLoaded]);

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

  const renderAd = ({ item }) => {
    const ad = item.data;
    return (
      <View style={styles.adCard}>
        <View style={styles.adHeader}>
          <Text style={styles.adBusinessName}>{ad.business_name}</Text>
          <View style={styles.sponsoredBadge}>
            <Text style={styles.sponsoredText}>Sponsored</Text>
          </View>
        </View>
        <Text style={styles.adTitle}>{ad.title}</Text>
        {ad.description ? (
          <Text style={styles.adDescription} numberOfLines={3}>{ad.description}</Text>
        ) : null}
        {ad.cta_url ? (
          <TouchableOpacity
            style={styles.adCta}
            onPress={() => Linking.openURL(ad.cta_url)}
            activeOpacity={0.75}
          >
            <Text style={styles.adCtaText}>{ad.cta_text || 'Learn More'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderEvent = (item) => {
    const color     = CATEGORY_COLORS[item.category] || '#888';
    const dateLabel = formatDate(item.start_datetime);
    const tags      = getEventTags(item);

    return (
      <View style={styles.card}>
        <View style={[styles.cardAccent, { backgroundColor: color }]} />
        <View style={styles.cardBody}>

          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: color + '18' }]}>
              <View style={[styles.categoryDot, { backgroundColor: color }]} />
              <Text style={[styles.categoryText, { color }]}>
                {CATEGORY_LABELS[item.category] || item.category}
              </Text>
            </View>
            <Text style={styles.communityText}>{item.community}</Text>
          </View>

          <Text style={styles.eventTitle}>{item.title}</Text>

          {dateLabel ? (
            <View style={styles.dateRow}>
              <Text style={styles.dateDot}>•</Text>
              <Text style={styles.dateText}>{dateLabel}</Text>
            </View>
          ) : (
            <Text style={styles.dateTbd}>Date TBD</Text>
          )}

          {item.location ? (
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          ) : null}

          {item.description ? (
            <Text style={styles.descriptionText} numberOfLines={4}>{item.description}</Text>
          ) : null}

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

          <View style={styles.cardFooter}>
            <Text style={styles.sourceText}>{item.source_name}</Text>
            <View style={styles.cardFooterActions}>
              <TouchableOpacity onPress={() => addToCalendar(item)} activeOpacity={0.6} style={styles.calBtn}>
                <Text style={styles.calBtnText}>＋ Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shareEvent(item, dateLabel)} activeOpacity={0.6} style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>⬆ Share</Text>
              </TouchableOpacity>
              {item.url ? (
                <TouchableOpacity onPress={() => Linking.openURL(item.url)} activeOpacity={0.6}>
                  <Text style={styles.linkText}>View →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    if (item.type === 'ad') return renderAd({ item });
    return renderEvent(item.data);
  };

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogoRow}>
          <Image
            source={require('./assets/icon.png')}
            style={styles.headerLogo}
          />
          <View>
            <Text style={styles.headerTitle}>Da Burbs</Text>
            <Text style={styles.headerSubtitle}>Find Fun and Events in the Chicagoland</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterWrapper}>
        {/* Collapse toggle — always visible at the top-right */}
        <TouchableOpacity
          style={styles.filterToggleBtn}
          onPress={() => setFiltersOpen(o => !o)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 8 }}
        >
          <Text style={styles.filterToggleText}>{filtersOpen ? '▲ Hide filters' : '▼ Show filters'}</Text>
        </TouchableOpacity>

        {filtersOpen && (<>

        {/* Region */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>REGION</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, selectedRegions.length === 0 && styles.filterChipActive]}
              onPress={clearAll}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, selectedRegions.length === 0 && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>

            {Object.keys(REGIONS).map((region) => {
              const active = selectedRegions.includes(region);
              const faved  = favRegions.includes(region);
              return (
                <View key={region} style={styles.chipWithStar}>
                  <TouchableOpacity
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => toggleRegion(region)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {region}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleFavRegion(region)} activeOpacity={0.6} style={styles.starBtn}>
                    <Text style={[styles.starIcon, faved && styles.starIconActive]}>{faved ? '★' : '☆'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Suburb */}
        <View style={styles.filterDivider} />
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>SUBURB</Text>
          {selectedRegions.length === 0 ? (
            <Text style={styles.filterHint}>Select a region above to filter by suburb</Text>
          ) : (
            <View style={styles.townRow}>
              {regionTowns.map((town) => {
                const active = selectedTowns.includes(town);
                const faved  = favTowns.includes(town);
                return (
                  <View key={town} style={styles.chipWithStar}>
                    <TouchableOpacity
                      style={[styles.townChip, active && styles.townChipActive]}
                      onPress={() => toggleTown(town)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.townChipText, active && styles.townChipTextActive]}>{town}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleFavTown(town)} activeOpacity={0.6} style={styles.starBtn}>
                      <Text style={[styles.starIcon, faved && styles.starIconActive]}>{faved ? '★' : '☆'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Type */}
        <View style={styles.filterDivider} />
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>TYPE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagFilterContent}
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
        </View>

        {/* Date */}
        <View style={styles.filterDivider} />
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>DATE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateFilterRow}>
            {/* This weekend chip */}
            <TouchableOpacity
              style={[styles.dateFilterChip, weekendMode && styles.dateFilterChipActive]}
              onPress={() => {
                setWeekendMode(m => !m);
                setSelectedDate(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateFilterIcon}>🎉</Text>
              <Text style={[styles.dateFilterText, weekendMode && styles.dateFilterTextActive]}>
                This weekend
              </Text>
            </TouchableOpacity>

            {/* Pick a specific date */}
            <TouchableOpacity
              style={[styles.dateFilterChip, selectedDate && styles.dateFilterChipActive]}
              onPress={() => {
                setShowDatePicker(true);
                setWeekendMode(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateFilterIcon}>📅</Text>
              <Text style={[styles.dateFilterText, selectedDate && styles.dateFilterTextActive]}>
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  : 'Pick a date'}
              </Text>
            </TouchableOpacity>

            {(selectedDate || weekendMode) && (
              <TouchableOpacity
                onPress={() => { setSelectedDate(null); setWeekendMode(false); }}
                style={styles.dateClearBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.dateClearText}>✕ Clear</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        </>)}

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
            <Calendar
              minDate={new Date().toISOString().split('T')[0]}
              markedDates={selectedDate ? {
                [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#1a3c5e' }
              } : {}}
              onDayPress={(day) => {
                setSelectedDate(new Date(day.dateString + 'T12:00:00'));
                setShowDatePicker(false);
              }}
              theme={{
                todayTextColor: '#1a3c5e',
                selectedDayBackgroundColor: '#1a3c5e',
                arrowColor: '#1a3c5e',
                dotColor: '#1a3c5e',
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Event list */}
      {loading ? (
        <ActivityIndicator size="large" color="#1a3c5e" style={styles.loader} />
      ) : (
        <FlatList
          data={feedData}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
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
  streamer: {
    position: 'absolute',
    borderRadius: 4,
    opacity: 0.85,
  },
  splashLogo:      { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  splashLogoImg:   { width: 100, height: 100, borderRadius: 22 },
  splashTitle:     { fontSize: 42, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, marginBottom: 10 },
  splashSubtitle:  { fontSize: 16, color: '#8BAECF', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  splashGrid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 300 },
  splashIconCell:  { width: 64, alignItems: 'center', gap: 4 },
  splashIcon:      { fontSize: 30 },
  splashIconLabel: { fontSize: 10, color: '#8BAECF', fontWeight: '500' },

  // ── Main ────────────────────────────────────────────
  container: { flex: 1, backgroundColor: '#F0F2F5' },

  header: {
    backgroundColor: '#1a3c5e',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 18, paddingHorizontal: 20,
  },
  headerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLogo: {
    width: 54, height: 54, borderRadius: 14,
    overflow: 'hidden',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 12, color: '#8BAECF', marginTop: 2 },

  // ── Filters ─────────────────────────────────────────
  filterWrapper: {
    backgroundColor: '#EBF1F8',
    borderBottomWidth: 1,
    borderBottomColor: '#C8D8E8',
  },
  filterToggleBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterToggleText: {
    fontSize: 11,
    color: '#5A7A96',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  filterSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  filterSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A7A96',
    letterSpacing: 1,
    marginBottom: 6,
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginHorizontal: 0,
  },
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 7,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#DDE3EA',
  },
  filterChipActive:     { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  filterChipText:       { fontSize: 13, fontWeight: '500', color: '#4A5568' },
  filterChipTextActive: { color: '#FFFFFF' },

  filterHint:      { fontSize: 12, color: '#B0BAC8', fontStyle: 'italic' },
  chipWithStar:    { flexDirection: 'row', alignItems: 'center', gap: 2 },
  starBtn:         { padding: 2 },
  starIcon:        { fontSize: 14, color: '#B0BAC8' },
  starIconActive:  { color: '#F4A800' },

  townRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
  },
  townChip: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16,
    backgroundColor: '#EEF0F3', borderWidth: 1, borderColor: '#DDE3EA',
  },
  townChipActive:     { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  townChipText:       { fontSize: 12, fontWeight: '500', color: '#4A5568' },
  townChipTextActive: { color: '#FFFFFF' },

  tagFilterContent: {
    gap: 6, paddingBottom: 2,
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

  dateFilterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 2,
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
  categoryDot:   { width: 6, height: 6, borderRadius: 3 },
  categoryText:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  communityText: { fontSize: 11, color: '#718096', fontWeight: '500' },

  eventTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C', lineHeight: 21, marginBottom: 6 },

  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  dateDot:  { color: '#1a3c5e', fontSize: 14, fontWeight: '700' },
  dateText: { fontSize: 13, color: '#1a3c5e', fontWeight: '600' },
  dateTbd:  { fontSize: 13, color: '#A0AEC0', fontStyle: 'italic', marginBottom: 4 },

  locationText:    { fontSize: 12, color: '#718096', marginBottom: 4 },
  descriptionText: { fontSize: 12, color: '#718096', lineHeight: 17, marginTop: 4, marginBottom: 6 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8, marginBottom: 4 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F7F8FA', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  tagIcon:  { fontSize: 11 },
  tagLabel: { fontSize: 10, color: '#4A5568', fontWeight: '500' },

  cardFooter:        { marginTop: 8 },
  cardFooterActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  sourceText:        { fontSize: 11, color: '#A0AEC0', fontStyle: 'italic' },
  linkText:          { fontSize: 12, color: '#1a3c5e', fontWeight: '600' },
  calBtn:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#EBF1F8', borderWidth: 1, borderColor: '#C8D8E8' },
  calBtnText:        { fontSize: 11, color: '#1a3c5e', fontWeight: '600' },
  shareBtn:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#EBF1F8', borderWidth: 1, borderColor: '#C8D8E8' },
  shareBtnText:      { fontSize: 11, color: '#1a3c5e', fontWeight: '600' },

  // ── Sponsored Ad Card ───────────────────────────────
  adCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0E0B0',
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  adHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 6,
  },
  adBusinessName: { fontSize: 12, fontWeight: '700', color: '#92660A' },
  sponsoredBadge: {
    backgroundColor: '#F4E0A0',
    borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: '#E0C060',
  },
  sponsoredText:  { fontSize: 10, fontWeight: '600', color: '#92660A', letterSpacing: 0.3 },
  adTitle:        { fontSize: 15, fontWeight: '700', color: '#1A202C', lineHeight: 21, marginBottom: 5 },
  adDescription:  { fontSize: 12, color: '#718096', lineHeight: 17, marginBottom: 10 },
  adCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a3c5e',
    borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  adCtaText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  // ── Empty ───────────────────────────────────────────
  emptyContainer: { paddingTop: 80, alignItems: 'center' },
  emptyText:      { fontSize: 15, color: '#A0AEC0' },
});
