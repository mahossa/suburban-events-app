import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform, Animated,
  Linking, ScrollView, Modal, ActionSheetIOS, Alert, Image, Share, Switch,
} from 'react-native';
import * as ExpoCalendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { Calendar } from 'react-native-calendars';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ojegaukvxjmhunqjhkxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZWdhdWt2eGptaHVucWpoa3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjk2ODksImV4cCI6MjA5NDcwNTY4OX0.q22y2v8vPAbc0qt7eBun-9XLY6NMqUiHfrv2mCTIoq4';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EXPO_PROJECT_ID = 'ee0ed411-0a3f-4cc6-a09b-eb75203a05c9';

// ── Theme ────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:              '#F0F2F5',
  card:            '#FFFFFF',
  cardShadow:      '#1a3c5e',
  filterBg:        '#EBF1F8',
  filterBorder:    '#C8D8E8',
  filterDivider:   '#E8ECF0',
  filterChipBg:    '#F0F2F5',
  filterChipBorder:'#DDE3EA',
  filterLabel:     '#5A7A96',
  filterText:      '#4A5568',
  filterHint:      '#B0BAC8',
  toggleText:      '#5A7A96',
  text:            '#1A202C',
  subtext:         '#718096',
  muted:           '#A0AEC0',
  dateText:        '#1a3c5e',
  settingsBg:      '#F7F8FA',
  settingsCard:    '#FFFFFF',
  settingsText:    '#1A202C',
  settingsSubtext: '#718096',
  settingsDivider: '#E2E8F0',
  settingsLabel:   '#5A7A96',
  modalBg:         '#FFFFFF',
  tagChipBg:       '#F7F8FA',
  tagChipBorder:   '#E2E8F0',
  tagText:         '#4A5568',
  calBtnBg:        '#EBF1F8',
  calBtnBorder:    '#C8D8E8',
  calBtnText:      '#1a3c5e',
  sourceText:      '#A0AEC0',
  emptyText:       '#A0AEC0',
  switchTrackFalse:'#D1D8E0',
  accentBlue:      '#1a3c5e',
  headerGear:      '#8BAECF',
};

const DARK = {
  bg:              '#0D1520',
  card:            '#162030',
  cardShadow:      '#000000',
  filterBg:        '#111C2A',
  filterBorder:    '#1E3045',
  filterDivider:   '#1A2D40',
  filterChipBg:    '#162030',
  filterChipBorder:'#1E3045',
  filterLabel:     '#4A7090',
  filterText:      '#7DA0BC',
  filterHint:      '#3A5570',
  toggleText:      '#4A7090',
  text:            '#D8E8F2',
  subtext:         '#7098B4',
  muted:           '#3A5570',
  dateText:        '#5B9ED4',
  settingsBg:      '#0D1520',
  settingsCard:    '#162030',
  settingsText:    '#D8E8F2',
  settingsSubtext: '#7098B4',
  settingsDivider: '#1A2D40',
  settingsLabel:   '#4A7090',
  modalBg:         '#111C2A',
  tagChipBg:       '#1E2F40',
  tagChipBorder:   '#253A50',
  tagText:         '#7098B4',
  calBtnBg:        '#1E2F40',
  calBtnBorder:    '#253A50',
  calBtnText:      '#5B9ED4',
  sourceText:      '#3A5570',
  emptyText:       '#3A5570',
  switchTrackFalse:'#1E3045',
  accentBlue:      '#3A7AB0',
  headerGear:      '#4A7090',
};

// ── Font scale ───────────────────────────────────────────────────────────────
const FONT_MULT = { small: 0.87, medium: 1.0, large: 1.16 };

// ── App data ─────────────────────────────────────────────────────────────────
const REGIONS = {
  'South Suburbs': ['Tinley Park', 'New Lenox', 'Frankfort', 'Orland Park', 'Mokena', 'Lockport', 'Joliet', 'Bolingbrook'],
  'West Suburbs':  ['Naperville', 'Downers Grove', 'Oak Park', 'Wheaton', 'Elmhurst', 'Aurora'],
  'North Suburbs': ['Arlington Heights', 'Mount Prospect', 'Schaumburg', 'Evanston', 'Waukegan', 'Palatine', 'Buffalo Grove', 'Hoffman Estates', 'Rosemont', 'Elgin', 'Skokie', 'Highland Park', 'Lake Forest'],
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
  const endDate   = new Date(startDate.getTime() + 60 * 60 * 1000);

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

// ── Push notifications ───────────────────────────────────────────────────────
async function registerForPushNotificationsAsync() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifications Blocked',
        'To receive alerts, go to Settings → Notifications → Da Burbs and enable them.',
      );
      return null;
    }
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: EXPO_PROJECT_ID });
    return token;
  } catch (e) {
    console.error('Push token error:', e);
    return null;
  }
}

// ── Splash ───────────────────────────────────────────────────────────────────
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

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Core state
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
  const [ads, setAds]                         = useState([]);

  // Settings state
  const [showSettings, setShowSettings]       = useState(false);
  const [darkMode, setDarkMode]               = useState(false);
  const [fontSize, setFontSize]               = useState('medium'); // 'small' | 'medium' | 'large'
  const [notifyNewEvents, setNotifyNewEvents] = useState(false);
  const [notifyFriday, setNotifyFriday]       = useState(false);
  const [pushToken, setPushToken]             = useState(null);

  // Notification prompt (shown on first star)
  const [showNotifPrompt, setShowNotifPrompt]         = useState(false);
  const [notifPromptShown, setNotifPromptShown]       = useState(false);
  const [promptNewEvents, setPromptNewEvents]         = useState(true);
  const [promptFriday, setPromptFriday]               = useState(true);
  const [promptStarredName, setPromptStarredName]     = useState('');

  // ── Theme + font helpers ───────────────────────────────────────────────────
  const C  = darkMode ? DARK : LIGHT;
  const fs = (size) => Math.round(size * FONT_MULT[fontSize]);

  // ── Load all persisted state on mount ─────────────────────────────────────
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('favRegions'),
      AsyncStorage.getItem('favTowns'),
      AsyncStorage.getItem('darkMode'),
      AsyncStorage.getItem('fontSize'),
      AsyncStorage.getItem('notifyNewEvents'),
      AsyncStorage.getItem('notifyFriday'),
      AsyncStorage.getItem('pushToken'),
      AsyncStorage.getItem('notifPromptShown'),
    ]).then(([rv, tv, dm, fsz, nne, nfr, pt, nps]) => {
      if (rv)  { const r = JSON.parse(rv);  setFavRegions(r);       if (r.length) setSelectedRegions(r); }
      if (tv)  { const t = JSON.parse(tv);  setFavTowns(t);         if (t.length) setSelectedTowns(t); }
      if (dm)  setDarkMode(JSON.parse(dm));
      if (fsz) setFontSize(fsz);
      if (nne) setNotifyNewEvents(JSON.parse(nne));
      if (nfr) setNotifyFriday(JSON.parse(nfr));
      if (pt)  setPushToken(pt);
      if (nps) setNotifPromptShown(JSON.parse(nps));
      setFavLoaded(true);
    });
  }, []);

  // ── Favorites ──────────────────────────────────────────────────────────────
  const maybeShowNotifPrompt = (name, isAdding) => {
    // Show once, only when starring (not unstarring), only if notifications not already set up
    if (!isAdding) return;
    if (notifPromptShown) return;
    if (notifyNewEvents || notifyFriday) return;
    setPromptStarredName(name);
    setShowNotifPrompt(true);
    setNotifPromptShown(true);
    AsyncStorage.setItem('notifPromptShown', 'true');
  };

  const toggleFavRegion = async (region) => {
    const isAdding = !favRegions.includes(region);
    const next = isAdding ? [...favRegions, region] : favRegions.filter(r => r !== region);
    setFavRegions(next);
    await AsyncStorage.setItem('favRegions', JSON.stringify(next));
    maybeShowNotifPrompt(region, isAdding);
  };

  const toggleFavTown = async (town) => {
    const isAdding = !favTowns.includes(town);
    const next = isAdding ? [...favTowns, town] : favTowns.filter(t => t !== town);
    setFavTowns(next);
    await AsyncStorage.setItem('favTowns', JSON.stringify(next));
    maybeShowNotifPrompt(town, isAdding);
  };

  // ── Push notifications ─────────────────────────────────────────────────────
  const savePushTokenToSupabase = async (token, newEvents, friday) => {
    const allFavTowns = [...new Set([
      ...favTowns,
      ...favRegions.flatMap(r => REGIONS[r] || []),
    ])];
    try {
      await supabase.from('push_tokens').upsert(
        { token, communities: allFavTowns, notify_new_events: newEvents, notify_friday_digest: friday, updated_at: new Date().toISOString() },
        { onConflict: 'token' }
      );
    } catch (e) { /* table may not exist yet */ }
  };

  const enableNotifications = async (newEvents, friday) => {
    const token = await registerForPushNotificationsAsync();
    if (!token) return false;
    setPushToken(token);
    await AsyncStorage.setItem('pushToken', token);
    await savePushTokenToSupabase(token, newEvents, friday);
    return true;
  };

  const toggleNewEvents = async (val) => {
    setNotifyNewEvents(val);
    await AsyncStorage.setItem('notifyNewEvents', JSON.stringify(val));
    if (val) {
      await enableNotifications(true, notifyFriday);
    } else if (pushToken) {
      await savePushTokenToSupabase(pushToken, false, notifyFriday);
    }
  };

  const toggleFriday = async (val) => {
    setNotifyFriday(val);
    await AsyncStorage.setItem('notifyFriday', JSON.stringify(val));
    if (val) {
      await enableNotifications(notifyNewEvents, true);
    } else if (pushToken) {
      await savePushTokenToSupabase(pushToken, notifyNewEvents, false);
    }
  };

  // ── Region/town filtering ──────────────────────────────────────────────────
  const regionTowns = selectedRegions.length > 0
    ? [...new Set(selectedRegions.flatMap(r => REGIONS[r] || []))]
    : [];

  const activeCommunities = selectedTowns.length > 0 ? selectedTowns : regionTowns;

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

  // ── Ads ────────────────────────────────────────────────────────────────────
  const fetchAds = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .or(`start_date.is.null,start_date.lte.${today}`);
      if (error) return;
      const visible = (data || []).filter(ad => {
        if (!ad.communities || ad.communities.length === 0) return true;
        if (activeCommunities.length === 0) return true;
        return ad.communities.some(c => activeCommunities.includes(c));
      });
      setAds(visible);
    } catch { /* ignore */ }
  }, [activeCommunities.join(',')]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  // ── Weekend date helper ────────────────────────────────────────────────────
  function getWeekendDates() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dow = today.getDay();
    const daysToFriday = dow === 0 ? -6 : dow <= 4 ? 5 - dow : 5 - dow;
    const friday = new Date(todayStart);
    friday.setDate(todayStart.getDate() + daysToFriday);
    return [0, 1, 2].map(n => {
      const d = new Date(friday);
      d.setDate(friday.getDate() + n);
      return d;
    }).filter(d => d >= todayStart);
  }

  const weekendDates = weekendMode ? getWeekendDates() : [];

  // ── Event filtering ────────────────────────────────────────────────────────
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

  // ── Ad interleaving ────────────────────────────────────────────────────────
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

  // ── Data fetching ──────────────────────────────────────────────────────────
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

  // ── Date formatting ────────────────────────────────────────────────────────
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

  // ── Render: Ad card ────────────────────────────────────────────────────────
  const renderAd = ({ item }) => {
    const ad = item.data;
    return (
      <View style={[styles.adCard, { backgroundColor: darkMode ? '#1E2A1A' : '#FFFBF0', borderColor: darkMode ? '#2A3A20' : '#F0E0B0' }]}>
        <View style={styles.adHeader}>
          <Text style={[styles.adBusinessName, { color: darkMode ? '#7AB87A' : '#92660A' }]}>{ad.business_name}</Text>
          <View style={[styles.sponsoredBadge, { backgroundColor: darkMode ? '#2A3A20' : '#F4E0A0', borderColor: darkMode ? '#3A5030' : '#E0C060' }]}>
            <Text style={[styles.sponsoredText, { color: darkMode ? '#7AB87A' : '#92660A' }]}>Sponsored</Text>
          </View>
        </View>
        <Text style={[styles.adTitle, { color: C.text }]}>{ad.title}</Text>
        {ad.description ? (
          <Text style={[styles.adDescription, { color: C.subtext }]} numberOfLines={3}>{ad.description}</Text>
        ) : null}
        {ad.cta_url ? (
          <TouchableOpacity
            style={[styles.adCta, { backgroundColor: C.accentBlue }]}
            onPress={() => Linking.openURL(ad.cta_url)}
            activeOpacity={0.75}
          >
            <Text style={styles.adCtaText}>{ad.cta_text || 'Learn More'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  // ── Render: Event card ─────────────────────────────────────────────────────
  const renderEvent = (item) => {
    const color     = CATEGORY_COLORS[item.category] || '#888';
    const dateLabel = formatDate(item.start_datetime);
    const tags      = getEventTags(item);

    return (
      <View style={[styles.card, { backgroundColor: C.card, shadowColor: C.cardShadow }]}>
        <View style={[styles.cardAccent, { backgroundColor: color }]} />
        <View style={styles.cardBody}>

          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: color + (darkMode ? '30' : '18') }]}>
              <View style={[styles.categoryDot, { backgroundColor: color }]} />
              <Text style={[styles.categoryText, { color }]}>
                {CATEGORY_LABELS[item.category] || item.category}
              </Text>
            </View>
            <Text style={[styles.communityText, { color: C.subtext }]}>{item.community}</Text>
          </View>

          <Text style={[styles.eventTitle, { color: C.text, fontSize: fs(15) }]}>{item.title}</Text>

          {dateLabel ? (
            <View style={styles.dateRow}>
              <Text style={[styles.dateDot, { color: C.dateText }]}>•</Text>
              <Text style={[styles.dateText, { color: C.dateText, fontSize: fs(13) }]}>{dateLabel}</Text>
            </View>
          ) : (
            <Text style={[styles.dateTbd, { fontSize: fs(13) }]}>Date TBD</Text>
          )}

          {item.location ? (
            <Text style={[styles.locationText, { color: C.subtext, fontSize: fs(12) }]} numberOfLines={1}>{item.location}</Text>
          ) : null}

          {item.description ? (
            <Text style={[styles.descriptionText, { color: C.subtext, fontSize: fs(12) }]} numberOfLines={4}>{item.description}</Text>
          ) : null}

          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.slice(0, 4).map(tag => (
                <View key={tag.id} style={[styles.tagChip, { backgroundColor: C.tagChipBg, borderColor: C.tagChipBorder }]}>
                  <Text style={styles.tagIcon}>{tag.icon}</Text>
                  <Text style={[styles.tagLabel, { color: C.tagText }]}>{tag.label}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={[styles.sourceText, { color: C.sourceText }]}>{item.source_name}</Text>
            <View style={styles.cardFooterActions}>
              <TouchableOpacity onPress={() => addToCalendar(item)} activeOpacity={0.6} style={[styles.calBtn, { backgroundColor: C.calBtnBg, borderColor: C.calBtnBorder }]}>
                <Text style={[styles.calBtnText, { color: C.calBtnText }]}>＋ Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shareEvent(item, dateLabel)} activeOpacity={0.6} style={[styles.shareBtn, { backgroundColor: C.calBtnBg, borderColor: C.calBtnBorder }]}>
                <Text style={[styles.shareBtnText, { color: C.calBtnText }]}>⬆ Share</Text>
              </TouchableOpacity>
              {item.url ? (
                <TouchableOpacity onPress={() => Linking.openURL(item.url)} activeOpacity={0.6}>
                  <Text style={[styles.linkText, { color: C.accentBlue }]}>View →</Text>
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

  // ── Render: Notification Prompt (shown on first star) ─────────────────────
  const notifPromptModal = (
    <Modal visible={showNotifPrompt} transparent animationType="slide">
      <View style={styles.notifPromptOverlay}>
        <View style={[styles.notifPromptSheet, { backgroundColor: C.modalBg }]}>

          <View style={styles.notifPromptHandle} />

          <Text style={styles.notifPromptEmoji}>🔔</Text>
          <Text style={[styles.notifPromptTitle, { color: C.settingsText }]}>
            Stay in the loop for {promptStarredName}
          </Text>
          <Text style={[styles.notifPromptSubtitle, { color: C.settingsSubtext }]}>
            Choose what you'd like to be notified about for your starred suburbs:
          </Text>

          {/* New Events toggle */}
          <View style={[styles.notifPromptRow, { borderColor: C.settingsDivider }]}>
            <View style={styles.settingsRowInfo}>
              <Text style={[styles.settingsRowTitle, { color: C.settingsText }]}>New Events</Text>
              <Text style={[styles.settingsRowDesc, { color: C.settingsSubtext }]}>
                Get notified when new events are added for your starred suburbs
              </Text>
            </View>
            <Switch
              value={promptNewEvents}
              onValueChange={setPromptNewEvents}
              trackColor={{ false: C.switchTrackFalse, true: '#1a3c5e' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={C.switchTrackFalse}
            />
          </View>

          {/* Friday Digest toggle */}
          <View style={[styles.notifPromptRow, { borderColor: C.settingsDivider }]}>
            <View style={styles.settingsRowInfo}>
              <Text style={[styles.settingsRowTitle, { color: C.settingsText }]}>Friday Digest</Text>
              <Text style={[styles.settingsRowDesc, { color: C.settingsSubtext }]}>
                Receive a weekend preview every Friday morning
              </Text>
            </View>
            <Switch
              value={promptFriday}
              onValueChange={setPromptFriday}
              trackColor={{ false: C.switchTrackFalse, true: '#1a3c5e' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={C.switchTrackFalse}
            />
          </View>

          {/* Turn on button */}
          <TouchableOpacity
            style={[styles.notifPromptBtn, { opacity: (promptNewEvents || promptFriday) ? 1 : 0.4 }]}
            activeOpacity={0.8}
            disabled={!promptNewEvents && !promptFriday}
            onPress={async () => {
              setShowNotifPrompt(false);
              if (promptNewEvents) await toggleNewEvents(true);
              if (promptFriday)    await toggleFriday(true);
            }}
          >
            <Text style={styles.notifPromptBtnText}>Turn On Notifications</Text>
          </TouchableOpacity>

          {/* Maybe later */}
          <TouchableOpacity
            onPress={() => setShowNotifPrompt(false)}
            activeOpacity={0.6}
            style={styles.notifPromptSkip}
          >
            <Text style={[styles.notifPromptSkipText, { color: C.settingsSubtext }]}>Maybe Later</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );

  // ── Render: Settings Modal ─────────────────────────────────────────────────
  const settingsModal = (
    <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.settingsContainer, { backgroundColor: C.settingsBg }]}>

        {/* Settings header */}
        <View style={[styles.settingsHeader, { borderBottomColor: C.settingsDivider }]}>
          <Text style={[styles.settingsTitle, { color: C.settingsText }]}>Settings</Text>
          <TouchableOpacity onPress={() => setShowSettings(false)} hitSlop={{ top: 8, bottom: 8, left: 16, right: 8 }}>
            <Text style={[styles.settingsDoneBtn, { color: C.accentBlue }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Notifications ── */}
          <Text style={[styles.settingsSectionLabel, { color: C.settingsLabel }]}>NOTIFICATIONS</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.settingsCard, borderColor: C.settingsDivider }]}>

            {/* New Events */}
            <View style={styles.settingsRow}>
              <View style={styles.settingsRowInfo}>
                <Text style={[styles.settingsRowTitle, { color: C.settingsText }]}>New Events</Text>
                <Text style={[styles.settingsRowDesc, { color: C.settingsSubtext }]}>
                  Get notified when new events are added for your favorited suburbs
                </Text>
              </View>
              <Switch
                value={notifyNewEvents}
                onValueChange={toggleNewEvents}
                trackColor={{ false: C.switchTrackFalse, true: '#1a3c5e' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={C.switchTrackFalse}
              />
            </View>

            <View style={[styles.settingsRowDivider, { backgroundColor: C.settingsDivider }]} />

            {/* Friday Digest */}
            <View style={styles.settingsRow}>
              <View style={styles.settingsRowInfo}>
                <Text style={[styles.settingsRowTitle, { color: C.settingsText }]}>Friday Digest</Text>
                <Text style={[styles.settingsRowDesc, { color: C.settingsSubtext }]}>
                  Receive a weekend preview every Friday morning
                </Text>
              </View>
              <Switch
                value={notifyFriday}
                onValueChange={toggleFriday}
                trackColor={{ false: C.switchTrackFalse, true: '#1a3c5e' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={C.switchTrackFalse}
              />
            </View>

            {(notifyNewEvents || notifyFriday) && (
              <View style={[styles.settingsNotifNote, { borderTopColor: C.settingsDivider }]}>
                <Text style={[styles.settingsNotifNoteText, { color: C.settingsSubtext }]}>
                  🔔 Notifications are tied to your starred suburbs. Star regions or towns in the filters to customize your alerts.
                </Text>
              </View>
            )}
          </View>

          {/* ── Display ── */}
          <Text style={[styles.settingsSectionLabel, { color: C.settingsLabel }]}>DISPLAY</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.settingsCard, borderColor: C.settingsDivider }]}>

            {/* Dark Mode */}
            <View style={styles.settingsRow}>
              <View style={styles.settingsRowInfo}>
                <Text style={[styles.settingsRowTitle, { color: C.settingsText }]}>Dark Mode</Text>
                <Text style={[styles.settingsRowDesc, { color: C.settingsSubtext }]}>
                  Switch to a darker color scheme
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={(val) => {
                  setDarkMode(val);
                  AsyncStorage.setItem('darkMode', JSON.stringify(val));
                }}
                trackColor={{ false: C.switchTrackFalse, true: '#1a3c5e' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={C.switchTrackFalse}
              />
            </View>

            <View style={[styles.settingsRowDivider, { backgroundColor: C.settingsDivider }]} />

            {/* Font Size */}
            <View style={[styles.settingsRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
              <Text style={[styles.settingsRowTitle, { color: C.settingsText }]}>Text Size</Text>
              <View style={styles.fontSizeRow}>
                {['small', 'medium', 'large'].map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeChip,
                      { borderColor: C.settingsDivider, backgroundColor: C.settingsBg },
                      fontSize === size && { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
                    ]}
                    onPress={() => {
                      setFontSize(size);
                      AsyncStorage.setItem('fontSize', size);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.fontSizeText,
                      { color: C.settingsSubtext },
                      fontSize === size && { color: '#FFFFFF' },
                    ]}>
                      {size === 'small' ? 'Small' : size === 'medium' ? 'Medium' : 'Large'}
                    </Text>
                    <Text style={[
                      styles.fontSizePreview,
                      { color: fontSize === size ? '#FFFFFF' : C.settingsSubtext },
                      { fontSize: size === 'small' ? 11 : size === 'medium' ? 14 : 17 },
                    ]}>Aa</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>

          {/* ── About ── */}
          <Text style={[styles.settingsSectionLabel, { color: C.settingsLabel }]}>ABOUT</Text>
          <View style={[styles.settingsCard, { backgroundColor: C.settingsCard, borderColor: C.settingsDivider }]}>

            <View style={styles.settingsAboutHeader}>
              <Image source={require('./assets/icon.png')} style={styles.settingsAboutIcon} />
              <View>
                <Text style={[styles.settingsAboutAppName, { color: C.settingsText }]}>Da Burbs</Text>
                <Text style={[styles.settingsAboutVersion, { color: C.settingsSubtext }]}>Version 1.0.0</Text>
              </View>
            </View>

            <View style={[styles.settingsRowDivider, { backgroundColor: C.settingsDivider }]} />

            <View style={styles.settingsAboutBody}>
              <Text style={[styles.settingsAboutBodyText, { color: C.settingsSubtext }]}>
                Da Burbs is a community events aggregator for the Chicagoland suburbs. Events are collected from local park districts, village websites, chambers of commerce, libraries, and other community sources.
              </Text>
              <Text style={[styles.settingsAboutBodyText, { color: C.settingsSubtext, marginTop: 12 }]}>
                <Text style={{ fontWeight: '600', color: C.settingsText }}>Disclaimer: </Text>
                Event information is provided for informational purposes only. Da Burbs does not organize, sponsor, or guarantee the accuracy of any listed events. Please verify event details directly with the hosting organization before attending.
              </Text>
            </View>

          </View>

          <View style={styles.settingsFooter}>
            <Text style={[styles.settingsFooterText, { color: C.muted }]}>
              Made with ♥ in Chicagoland
            </Text>
          </View>

        </ScrollView>
      </View>
    </Modal>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style="light" />

      {settingsModal}
      {notifPromptModal}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogoRow}>
          <Image source={require('./assets/icon.png')} style={styles.headerLogo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Da Burbs</Text>
            <Text style={styles.headerSubtitle}>Find Fun and Events in the Chicagoland</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerGearBtn}
          >
            <Text style={[styles.headerGearIcon, { color: C.headerGear }]}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filterWrapper, { backgroundColor: C.filterBg, borderBottomColor: C.filterBorder }]}>
        <TouchableOpacity
          style={styles.filterToggleBtn}
          onPress={() => setFiltersOpen(o => !o)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 8 }}
        >
          <Text style={[styles.filterToggleText, { color: C.toggleText }]}>
            {filtersOpen ? '▲ Hide filters' : '▼ Show filters'}
          </Text>
        </TouchableOpacity>

        {filtersOpen && (<>

        {/* Region */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionLabel, { color: C.filterLabel }]}>REGION</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: C.filterChipBg, borderColor: C.filterChipBorder }, selectedRegions.length === 0 && styles.filterChipActive]}
              onPress={clearAll}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, { color: C.filterText }, selectedRegions.length === 0 && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>

            {Object.keys(REGIONS).map((region) => {
              const active = selectedRegions.includes(region);
              const faved  = favRegions.includes(region);
              return (
                <View key={region} style={styles.chipWithStar}>
                  <TouchableOpacity
                    style={[styles.filterChip, { backgroundColor: C.filterChipBg, borderColor: C.filterChipBorder }, active && styles.filterChipActive]}
                    onPress={() => toggleRegion(region)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, { color: C.filterText }, active && styles.filterChipTextActive]}>
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
        <View style={[styles.filterDivider, { backgroundColor: C.filterDivider }]} />
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionLabel, { color: C.filterLabel }]}>SUBURB</Text>
          {selectedRegions.length === 0 ? (
            <Text style={[styles.filterHint, { color: C.filterHint }]}>Select a region above to filter by suburb</Text>
          ) : (
            <View style={styles.townRow}>
              {regionTowns.map((town) => {
                const active = selectedTowns.includes(town);
                const faved  = favTowns.includes(town);
                return (
                  <View key={town} style={styles.chipWithStar}>
                    <TouchableOpacity
                      style={[styles.townChip, { backgroundColor: C.filterChipBg, borderColor: C.filterChipBorder }, active && styles.townChipActive]}
                      onPress={() => toggleTown(town)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.townChipText, { color: C.filterText }, active && styles.townChipTextActive]}>{town}</Text>
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
        <View style={[styles.filterDivider, { backgroundColor: C.filterDivider }]} />
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionLabel, { color: C.filterLabel }]}>TYPE</Text>
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
                  style={[styles.tagFilterChip, { backgroundColor: C.filterChipBg, borderColor: C.filterChipBorder }, active && styles.tagFilterChipActive]}
                  onPress={() => toggleTag(tag.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagFilterIcon}>{tag.icon}</Text>
                  <Text style={[styles.tagFilterText, { color: C.filterText }, active && styles.tagFilterTextActive]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Date */}
        <View style={[styles.filterDivider, { backgroundColor: C.filterDivider }]} />
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionLabel, { color: C.filterLabel }]}>DATE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateFilterRow}>
            <TouchableOpacity
              style={[styles.dateFilterChip, { backgroundColor: C.filterChipBg, borderColor: C.filterChipBorder }, weekendMode && styles.dateFilterChipActive]}
              onPress={() => { setWeekendMode(m => !m); setSelectedDate(null); }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateFilterIcon}>🎉</Text>
              <Text style={[styles.dateFilterText, { color: C.filterText }, weekendMode && styles.dateFilterTextActive]}>
                This weekend
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateFilterChip, { backgroundColor: C.filterChipBg, borderColor: C.filterChipBorder }, selectedDate && styles.dateFilterChipActive]}
              onPress={() => { setShowDatePicker(true); setWeekendMode(false); }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateFilterIcon}>📅</Text>
              <Text style={[styles.dateFilterText, { color: C.filterText }, selectedDate && styles.dateFilterTextActive]}>
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  : 'Pick a date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedDate(null);
                setWeekendMode(false);
                setSelectedRegions([]);
                setSelectedTowns([]);
                setSelectedTags([]);
              }}
              style={styles.dateClearBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.dateClearText}>✕ Clear all</Text>
            </TouchableOpacity>
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
          <View style={[styles.dateModalSheet, { backgroundColor: C.modalBg }]}>
            <View style={[styles.dateModalHeader, { borderBottomColor: C.settingsDivider }]}>
              <Text style={[styles.dateModalTitle, { color: C.text }]}>Select a Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.dateModalDone, { color: C.accentBlue }]}>Done</Text>
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
                calendarBackground: C.modalBg,
                dayTextColor: C.text,
                monthTextColor: C.text,
                textDisabledColor: C.muted,
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
              <Text style={[styles.emptyText, { color: C.emptyText }]}>No upcoming events found.</Text>
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
  container: { flex: 1 },

  header: {
    backgroundColor: '#1a3c5e',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 18, paddingHorizontal: 20,
  },
  headerLogoRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLogo:     { width: 54, height: 54, borderRadius: 14, overflow: 'hidden' },
  headerTitle:    { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 12, color: '#8BAECF', marginTop: 2 },
  headerGearBtn:  { padding: 4 },
  headerGearIcon: { fontSize: 22 },

  // ── Filters ─────────────────────────────────────────
  filterWrapper: {
    borderBottomWidth: 1,
  },
  filterToggleBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterToggleText: {
    fontSize: 11,
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
    letterSpacing: 1,
    marginBottom: 6,
  },
  filterDivider:    { height: 1 },
  filterRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive:     { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  filterChipText:       { fontSize: 13, fontWeight: '500' },
  filterChipTextActive: { color: '#FFFFFF' },

  filterHint:      { fontSize: 12, fontStyle: 'italic' },
  chipWithStar:    { flexDirection: 'row', alignItems: 'center', gap: 2 },
  starBtn:         { padding: 2 },
  starIcon:        { fontSize: 14, color: '#B0BAC8' },
  starIconActive:  { color: '#F4A800' },

  townRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  townChip: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16,
    borderWidth: 1,
  },
  townChipActive:     { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  townChipText:       { fontSize: 12, fontWeight: '500' },
  townChipTextActive: { color: '#FFFFFF' },

  tagFilterContent:    { gap: 6, paddingBottom: 2 },
  tagFilterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    borderWidth: 1,
  },
  tagFilterChipActive: { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  tagFilterIcon:       { fontSize: 13 },
  tagFilterText:       { fontSize: 12, fontWeight: '500' },
  tagFilterTextActive: { color: '#FFFFFF' },

  dateFilterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 2 },
  dateFilterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1,
  },
  dateFilterChipActive: { backgroundColor: '#1a3c5e', borderColor: '#1a3c5e' },
  dateFilterIcon:       { fontSize: 14 },
  dateFilterText:       { fontSize: 13, fontWeight: '500' },
  dateFilterTextActive: { color: '#FFFFFF' },
  dateClearBtn:  { paddingHorizontal: 10, paddingVertical: 6 },
  dateClearText: { fontSize: 13, color: '#E53E3E', fontWeight: '500' },

  // Date Picker Modal
  dateModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  dateModalSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  dateModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateModalTitle: { fontSize: 16, fontWeight: '600' },
  dateModalDone:  { fontSize: 16, fontWeight: '600' },

  // ── List ────────────────────────────────────────────
  loader:      { flex: 1 },
  listContent: { padding: 14, paddingBottom: 40, gap: 12 },

  // ── Card ────────────────────────────────────────────
  card: {
    borderRadius: 14, overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
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
  communityText:{ fontSize: 11, fontWeight: '500' },

  eventTitle: { fontWeight: '700', lineHeight: 21, marginBottom: 6 },

  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  dateDot:  { fontSize: 14, fontWeight: '700' },
  dateText: { fontWeight: '600' },
  dateTbd:  { color: '#A0AEC0', fontStyle: 'italic', marginBottom: 4 },

  locationText:    { marginBottom: 4 },
  descriptionText: { lineHeight: 17, marginTop: 4, marginBottom: 6 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8, marginBottom: 4 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1,
  },
  tagIcon:  { fontSize: 11 },
  tagLabel: { fontSize: 10, fontWeight: '500' },

  cardFooter:        { marginTop: 8 },
  cardFooterActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  sourceText:        { fontSize: 11, fontStyle: 'italic' },
  linkText:          { fontSize: 12, fontWeight: '600' },
  calBtn:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  calBtnText:        { fontSize: 11, fontWeight: '600' },
  shareBtn:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  shareBtnText:      { fontSize: 11, fontWeight: '600' },

  // ── Sponsored Ad Card ───────────────────────────────
  adCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  adHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 6,
  },
  adBusinessName: { fontSize: 12, fontWeight: '700' },
  sponsoredBadge: {
    borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1,
  },
  sponsoredText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  adTitle:       { fontSize: 15, fontWeight: '700', lineHeight: 21, marginBottom: 5 },
  adDescription: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  adCta: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  adCtaText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  // ── Empty ───────────────────────────────────────────
  emptyContainer: { paddingTop: 80, alignItems: 'center' },
  emptyText:      { fontSize: 15 },

  // ── Settings Modal ──────────────────────────────────
  settingsContainer: {
    flex: 1,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsTitle:   { fontSize: 20, fontWeight: '700' },
  settingsDoneBtn: { fontSize: 16, fontWeight: '600' },

  settingsSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
  },

  settingsCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingsRowInfo:  { flex: 1, gap: 3 },
  settingsRowTitle: { fontSize: 15, fontWeight: '600' },
  settingsRowDesc:  { fontSize: 12, lineHeight: 17 },
  settingsRowDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },

  settingsNotifNote: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  settingsNotifNoteText: { fontSize: 12, lineHeight: 17 },

  // Font size picker
  fontSizeRow: { flexDirection: 'row', gap: 10, paddingBottom: 2 },
  fontSizeChip: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5,
    gap: 4,
  },
  fontSizeText:    { fontSize: 12, fontWeight: '600' },
  fontSizePreview: { fontWeight: '500' },

  // About section
  settingsAboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  settingsAboutIcon:    { width: 52, height: 52, borderRadius: 12 },
  settingsAboutAppName: { fontSize: 17, fontWeight: '700' },
  settingsAboutVersion: { fontSize: 13, marginTop: 2 },
  settingsAboutBody:    { padding: 16, paddingTop: 14 },
  settingsAboutBodyText:{ fontSize: 13, lineHeight: 20 },

  settingsFooter: { alignItems: 'center', paddingVertical: 32 },
  settingsFooterText: { fontSize: 12 },

  // ── Notification Prompt ─────────────────────────────────────────────────────
  notifPromptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  notifPromptSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    alignItems: 'center',
  },
  notifPromptHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#C0C8D0',
    marginBottom: 20,
  },
  notifPromptEmoji:    { fontSize: 40, marginBottom: 12 },
  notifPromptTitle:    { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  notifPromptSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  notifPromptRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  notifPromptBtn: {
    width: '100%',
    backgroundColor: '#1a3c5e',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  notifPromptBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  notifPromptSkip:    { marginTop: 14, paddingVertical: 6 },
  notifPromptSkipText:{ fontSize: 14 },
});
