import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  customerOrders,
  markets,
  pendingApprovals,
  vendorInventory,
  vendorOrders,
  vendors,
} from './src/mockData';

const navigationByRole = {
  Customer: [
    { label: 'Home', icon: '⌂' },
    { label: 'Market', icon: '⌖' },
    { label: 'Cart', icon: '▣' },
    { label: 'Orders', icon: '◷' },
    { label: 'Profile', icon: '●' },
  ],
  Vendor: [
    { label: 'Overview', icon: '⌂' },
    { label: 'Inventory', icon: '▤' },
    { label: 'Orders', icon: '◷' },
    { label: 'Profile', icon: '●' },
  ],
  Admin: [
    { label: 'Overview', icon: '⌂' },
    { label: 'Vendors', icon: '♙' },
    { label: 'Markets', icon: '⌖' },
    { label: 'Profile', icon: '●' },
  ],
};

export default function App() {
  const [activeRole, setActiveRole] = useState('Customer');
  const [customerView, setCustomerView] = useState('Home');
  const [vendorView, setVendorView] = useState('Overview');
  const [adminView, setAdminView] = useState('Overview');
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('Sign in');
  const [authRole, setAuthRole] = useState('Customer');
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState('market-1');
  const [managedVendorId, setManagedVendorId] = useState('vendor-1');
  const [dataReady, setDataReady] = useState(false);
  const [profile, setProfile] = useState({ name: 'Ananya Rao', phone: '', email: '', area: 'Madhapur' });
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [orderUpdatesEnabled, setOrderUpdatesEnabled] = useState(true);
  const [vendorProfile, setVendorProfile] = useState({ name: 'Fresh Harvest', phone: '', specialty: 'Fresh vegetables', marketName: 'Community Ground', area: 'Madhapur', address: 'Near Community Hall, Madhapur', days: 'Daily', openTime: '3:00 PM', closeTime: '10:00 PM' });
  const [registration, setRegistration] = useState({ name: '', phone: '', specialty: '', marketName: '', area: '', address: '', days: 'Daily', openTime: '', closeTime: '' });
  const [liveMarkets, setLiveMarkets] = useState(markets);
  const [liveVendors, setLiveVendors] = useState(vendors);
  const [liveCustomerOrders, setLiveCustomerOrders] = useState(customerOrders);
  const [liveVendorOrders, setLiveVendorOrders] = useState(vendorOrders);
  const [liveInventory, setLiveInventory] = useState(vendorInventory);
  const [liveApprovals, setLiveApprovals] = useState(pendingApprovals);
  const [newItem, setNewItem] = useState({ name: '', price: '', stock: '', unit: 'kg' });
  const [cart, setCart] = useState({
    'vendor-1::tomato': 2,
    'vendor-1::potato': 1,
  });

  useEffect(() => {
    AsyncStorage.getItem('localveg.app-data').then((saved) => {
      if (saved) {
        const stored = JSON.parse(saved);
        setLiveMarkets(stored.markets || markets);
        setLiveVendors(stored.vendors || vendors);
        setLiveCustomerOrders(stored.customerOrders || customerOrders);
        setLiveVendorOrders(stored.vendorOrders || vendorOrders);
        setLiveInventory(stored.inventory || vendorInventory);
        setLiveApprovals(stored.approvals || pendingApprovals);
        setProfile(stored.profile || profile);
        setVendorProfile(stored.vendorProfile || vendorProfile);
        setManagedVendorId(stored.managedVendorId || 'vendor-1');
        setCart(stored.cart || {});
        setSession(stored.session || null);
        setAddresses(stored.addresses || []);
        setOrderUpdatesEnabled(stored.orderUpdatesEnabled ?? true);
        if (stored.session?.role) setActiveRole(stored.session.role);
      }
    }).catch(() => Alert.alert('Storage unavailable', 'Your changes may not persist on this device.'))
      .finally(() => setDataReady(true));
  }, []);

  useEffect(() => {
    if (!dataReady) return;
    AsyncStorage.setItem('localveg.app-data', JSON.stringify({
      markets: liveMarkets,
      vendors: liveVendors,
      customerOrders: liveCustomerOrders,
      vendorOrders: liveVendorOrders,
      inventory: liveInventory,
      approvals: liveApprovals,
      profile,
      vendorProfile,
      managedVendorId,
      cart,
      session,
      addresses,
      orderUpdatesEnabled,
    })).catch(() => Alert.alert('Could not save', 'There was a problem saving your changes on this device.'));
  }, [dataReady, liveMarkets, liveVendors, liveCustomerOrders, liveVendorOrders, liveInventory, liveApprovals, profile, vendorProfile, managedVendorId, cart, session, addresses, orderUpdatesEnabled]);

  const selectedMarket = liveMarkets.find((market) => market.id === selectedMarketId) || liveMarkets[0];

  const visibleVendors = useMemo(
    () => liveVendors.filter((vendor) => vendor.marketId === selectedMarketId && vendor.approved !== false),
    [liveVendors, selectedMarketId]
  );

  const marketProducts = useMemo(
    () =>
      visibleVendors.flatMap((vendor) =>
        vendor.items.map((item) => ({
          ...item,
          vendorName: vendor.name,
          vendorId: vendor.id,
          preferred: vendor.preferred,
        }))
      ),
    [visibleVendors]
  );

  const cartItems = useMemo(() => {
    const items = [];
    Object.entries(cart).forEach(([key, qty]) => {
      if (!qty) return;
      const [vendorId, itemId] = key.split('::');
      const vendor = liveVendors.find((entry) => entry.id === vendorId);
      if (!vendor) return;
      const item = vendor.items.find((entry) => entry.id === itemId);
      if (!item) return;
      items.push({
        key,
        vendorName: vendor.name,
        itemName: item.name,
        qty,
        price: item.price,
        total: item.price * qty,
      });
    });
    return items;
  }, [cart, liveVendors]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  const addToCart = (vendorId, itemId, price) => {
    const key = `${vendorId}::${itemId}`;
    setCart((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
    setCustomerView('Cart');
  };

  const changeCartQuantity = (key, change) => {
    setCart((current) => {
      const nextQuantity = (current[key] || 0) + change;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[key];
      else next[key] = nextQuantity;
      return next;
    });
  };

  const placeOrder = () => {
    if (cartItems.length === 0) return;
    const byVendor = cartItems.reduce((groups, item) => {
      const vendor = liveVendors.find((entry) => entry.name === item.vendorName);
      if (!vendor) return groups;
      groups[vendor.id] ||= { vendor, items: [], total: 0 };
      groups[vendor.id].items.push(item);
      groups[vendor.id].total += item.total;
      return groups;
    }, {});
    const createdOrders = Object.values(byVendor).map(({ vendor, items, total }, index) => ({
      id: `#${Date.now().toString().slice(-6)}${index ? `-${index}` : ''}`,
      vendorId: vendor.id,
      vendor: vendor.name,
      customer: profile.name || 'Customer',
      items: items.map((item) => `${item.itemName} x${item.qty}`).join(', '),
      total,
      status: 'Pending confirmation',
      time: 'Just now',
    }));
    setLiveCustomerOrders((current) => [...createdOrders, ...current]);
    setLiveVendorOrders((current) => [...createdOrders, ...current]);
    setCart({});
    setCustomerView('Orders');
    Alert.alert('Pickup requested', 'Your reservation has been sent to the vendor. Payment is not collected in this preview.');
  };

  const updateVendorOrder = (orderId, status) => {
    setLiveVendorOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    setLiveCustomerOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
  };

  const updateInventoryItem = (itemId, patch) => {
    setLiveInventory((current) => current.map((item) => item.id === itemId ? { ...item, ...patch } : item));
    const inventoryItem = liveInventory.find((item) => item.id === itemId);
    if (inventoryItem) {
      setLiveVendors((current) => current.map((vendor) => vendor.id !== managedVendorId ? vendor : {
        ...vendor,
        items: vendor.items.map((item) => item.name === inventoryItem.name ? { ...item, ...patch } : item),
      }));
    }
  };

  const addInventoryItem = () => {
    const price = Number(newItem.price);
    const stock = Number(newItem.stock);
    if (!newItem.name.trim() || !Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || stock < 0) {
      Alert.alert('Check product details', 'Enter a product name, a price above zero, and available stock.');
      return;
    }
    const item = { id: `product-${Date.now()}`, name: newItem.name.trim(), price, stock, unit: newItem.unit || 'kg', fresh: true, status: stock ? 'Available' : 'Out of stock' };
    setLiveInventory((current) => [...current, item]);
    setLiveVendors((current) => current.map((vendor) => vendor.id !== managedVendorId ? vendor : {
      ...vendor,
      items: [...vendor.items, { ...item }],
    }));
    setNewItem({ name: '', price: '', stock: '', unit: 'kg' });
  };

  const saveVendorProfile = () => {
    if (!vendorProfile.name.trim() || !vendorProfile.marketName.trim() || !vendorProfile.address.trim()) {
      Alert.alert('Missing details', 'Add a stall name, market name, and location before saving.');
      return;
    }
    const managedVendor = liveVendors.find((entry) => entry.id === managedVendorId);
    const market = liveMarkets.find((entry) => entry.id === managedVendor?.marketId);
    setLiveMarkets((current) => current.map((entry) => entry.id === market?.id ? {
      ...entry,
      name: vendorProfile.marketName,
      area: vendorProfile.area,
      address: vendorProfile.address,
      days: vendorProfile.days,
      openTime: vendorProfile.openTime,
      closeTime: vendorProfile.closeTime,
    } : entry));
    setLiveVendors((current) => current.map((entry) => entry.id === managedVendorId ? {
      ...entry,
      name: vendorProfile.name,
      specialty: vendorProfile.specialty,
      phone: vendorProfile.phone,
    } : entry));
    Alert.alert('Saved', 'Your stall details and market schedule were updated on this device.');
  };

  const submitVendorRegistration = () => {
    const required = ['name', 'phone', 'marketName', 'area', 'address', 'openTime', 'closeTime'];
    if (required.some((key) => !registration[key].trim())) {
      Alert.alert('Complete the form', 'Add your business, contact, market location, and trading hours.');
      return;
    }
    const marketId = `market-${Date.now()}`;
    const vendorId = `vendor-${Date.now()}`;
    const newMarket = {
      id: marketId,
      name: registration.marketName,
      area: registration.area,
      address: registration.address,
      openTime: registration.openTime,
      closeTime: registration.closeTime,
      days: registration.days || 'Daily',
      status: 'Pending approval',
      vendorCount: 1,
      totalItems: 0,
      distance: 'New location',
    };
    setLiveMarkets((current) => [...current, newMarket]);
    setLiveVendors((current) => [...current, {
      id: vendorId,
      name: registration.name,
      marketId,
      rating: 0,
      specialty: registration.specialty || 'Fresh produce',
      open: false,
      approved: false,
      preferred: false,
      phone: registration.phone,
      items: [],
    }]);
    setManagedVendorId(vendorId);
    setVendorProfile({ name: registration.name, phone: registration.phone, specialty: registration.specialty || 'Fresh produce', marketName: registration.marketName, area: registration.area, address: registration.address, days: registration.days || 'Daily', openTime: registration.openTime, closeTime: registration.closeTime });
    setLiveInventory([]);
    setLiveApprovals((current) => [...current, { id: vendorId, name: registration.name, status: 'Pending', marketId }]);
    setRegistration({ name: '', phone: '', specialty: '', marketName: '', area: '', address: '', days: 'Daily', openTime: '', closeTime: '' });
    Alert.alert('Application submitted', 'Your stall and daily market location are saved locally and awaiting admin review.');
  };

  const reviewVendor = (vendorId, approved) => {
    setLiveApprovals((current) => current.map((entry) => entry.id === vendorId ? { ...entry, status: approved ? 'Approved' : 'Rejected' } : entry));
    setLiveVendors((current) => current.map((entry) => entry.id === vendorId ? { ...entry, approved } : entry));
    setLiveMarkets((current) => current.map((entry) => entry.id === liveApprovals.find((approval) => approval.id === vendorId)?.marketId
      ? { ...entry, status: approved ? 'Open' : 'Application rejected' }
      : entry));
  };

  const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
  const updateVendorProfile = (field, value) => setVendorProfile((current) => ({ ...current, [field]: value }));
  const updateRegistration = (field, value) => setRegistration((current) => ({ ...current, [field]: value }));
  const updateAuthForm = (field, value) => setAuthForm((current) => ({ ...current, [field]: value }));
  const signIn = () => {
    const email = authForm.email.trim().toLowerCase();
    if (!email.includes('@') || authForm.password.length < 6) {
      Alert.alert('Check your details', 'Enter a valid email and a password with at least 6 characters.');
      return;
    }
    if (authMode === 'Create account' && !authForm.name.trim()) {
      Alert.alert('Add your name', 'Enter your name to create an account.');
      return;
    }
    const displayName = authForm.name.trim() || email.split('@')[0];
    const nextSession = { role: authRole, email, name: displayName };
    setSession(nextSession);
    setActiveRole(authRole);
    if (authRole === 'Customer') {
      setCustomerView('Home');
      setProfile((current) => ({ ...current, name: displayName, email, phone: authForm.phone || current.phone }));
    }
    if (authRole === 'Vendor') setVendorView('Profile');
    if (authRole === 'Admin') {
      setAdminView('Overview');
      setProfile((current) => ({ ...current, name: displayName, email, phone: authForm.phone || current.phone }));
    }
    setAuthForm((current) => ({ ...current, password: '' }));
  };
  const signOut = () => {
    setSession(null);
    setAuthMode('Sign in');
    setAuthForm((current) => ({ ...current, password: '' }));
  };
  const selectNavigation = (label) => {
    if (activeRole === 'Customer') setCustomerView(label);
    if (activeRole === 'Vendor') setVendorView(label === 'Overview' ? 'Overview' : label);
    if (activeRole === 'Admin') setAdminView(label);
  };
  const saveAddress = () => {
    const value = newAddress.trim();
    if (!value) {
      Alert.alert('Add a pickup location', 'Enter a saved pickup address or preferred market location.');
      return;
    }
    setAddresses((current) => [...current, { id: `${Date.now()}`, label: current.length ? 'Pickup location' : 'Primary pickup', value }]);
    setNewAddress('');
  };
  const removeAddress = (addressId) => setAddresses((current) => current.filter((address) => address.id !== addressId));
  const field = (label, value, onChangeText, placeholder = label, keyboardType = 'default') => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        style={styles.textInput}
        placeholderTextColor="#859187"
      />
    </View>
  );
  const actionButton = (label, onPress, secondary = false) => (
    <TouchableOpacity key={label} onPress={onPress} style={[styles.actionButton, secondary && styles.actionButtonSecondary]}>
      <Text style={[styles.actionButtonText, secondary && styles.actionButtonTextSecondary]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderCustomerHome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroBadge}>Today</Text>
          <Text style={styles.heroBadgeAlt}>Fresh stock</Text>
        </View>
        <Text style={styles.heroTitle}>LocalVeg</Text>
        <Text style={styles.heroSubtitle}>Reserve fresh vegetables before you reach the market.</Text>
        <View style={styles.heroMetaRow}>
          <Text style={styles.metaPill}>{selectedMarket.name}</Text>
          <Text style={styles.metaPill}>{selectedMarket.openTime} - {selectedMarket.closeTime}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Nearby markets</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hList}>
        {liveMarkets.map((market) => (
          <TouchableOpacity
            key={market.id}
            onPress={() => setSelectedMarketId(market.id)}
            style={[styles.marketCard, selectedMarketId === market.id && styles.marketCardActive]}
          >
            <Text style={styles.marketName}>{market.name}</Text>
            <Text style={styles.marketMeta}>{market.area}</Text>
            <Text style={styles.marketMeta}>{market.openTime} - {market.closeTime}</Text>
            <Text style={styles.marketMeta}>{market.status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Preferred vendors</Text>
      {visibleVendors.map((vendor) => (
        <View key={vendor.id} style={styles.vendorCard}>
          <View style={styles.vendorHeaderRow}>
            <View>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <Text style={styles.vendorSubText}>{vendor.specialty}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>★ {vendor.rating}</Text>
            </View>
          </View>

          <View style={styles.productList}>
            {vendor.items.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.productRow}>
                <View>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productStock}>{item.stock} {item.unit} available</Text>
                </View>
                <View style={styles.priceActionRow}>
                  <Text style={styles.priceText}>₹{item.price}/{item.unit}</Text>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => addToCart(vendor.id, item.id, item.price)}
                  >
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderCustomerMarket = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Market: {selectedMarket.name}</Text>
      <View style={styles.marketDetailCard}>
        <Text style={styles.detailLine}>📍 {selectedMarket.address}</Text>
        <Text style={styles.detailLine}>⏰ {selectedMarket.days}</Text>
        <Text style={styles.detailLine}>🧺 {visibleVendors.length} vendors</Text>
        <Text style={styles.detailLine}>🌿 {selectedMarket.totalItems}+ vegetables available</Text>
      </View>

      {marketProducts.map((item, index) => (
        <View key={`${item.vendorId}-${item.id}-${index}`} style={styles.catalogCard}>
          <View style={styles.catalogHeaderRow}>
            <View>
              <Text style={styles.catalogName}>{item.name}</Text>
              <Text style={styles.catalogVendor}>{item.vendorName}</Text>
            </View>
            <Text style={styles.catalogPrice}>₹{item.price}/{item.unit}</Text>
          </View>
          <View style={styles.catalogBottomRow}>
            <Text style={[styles.stockText, item.stock <= 10 && styles.lowStockText]}>
              {item.stock <= 10 ? 'Low stock' : 'In stock'} • {item.stock} {item.unit}
            </Text>
            {item.fresh && <Text style={styles.freshTag}>Fresh today</Text>}
          </View>
          <TouchableOpacity style={styles.reserveBtn} onPress={() => addToCart(item.vendorId, item.id, item.price)}>
            <Text style={styles.reserveBtnText}>Reserve</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderCustomerCart = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Your cart</Text>
      {cartItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          {cartItems.map((item) => (
            <View key={item.key} style={styles.cartItem}>
              <View>
                <Text style={styles.cartItemName}>{item.itemName}</Text>
                <Text style={styles.cartItemVendor}>{item.vendorName}</Text>
              </View>
              <View style={styles.cartMetaWrap}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity onPress={() => changeCartQuantity(item.key, -1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>-</Text></TouchableOpacity>
                  <Text style={styles.cartQty}>{item.qty}</Text>
                  <TouchableOpacity onPress={() => changeCartQuantity(item.key, 1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>+</Text></TouchableOpacity>
                </View>
                <Text style={styles.cartTotal}>₹{item.total}</Text>
              </View>
            </View>
          ))}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order summary</Text>
            <View style={styles.summaryRow}>
              <Text>Subtotal</Text>
              <Text>₹{cartTotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Pickup fee</Text>
              <Text>₹0</Text>
            </View>
            <View style={styles.summaryRowBold}>
              <Text>Total</Text>
              <Text>₹{cartTotal}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={placeOrder}>
              <Text style={styles.checkoutText}>Reserve order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderCustomerOrders = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Orders</Text>
      {liveCustomerOrders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderStatus}>{order.status}</Text>
          </View>
          <Text style={styles.orderVendor}>{order.vendor}</Text>
          <Text style={styles.orderItems}>{order.items}</Text>
          <View style={styles.orderRow}>
            <Text style={styles.orderTime}>{order.time}</Text>
            <Text style={styles.orderTotal}>₹{order.total}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderProfileScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeading}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(activeRole === 'Vendor' ? vendorProfile.name : profile.name).slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.profileIdentity}>
          <Text style={styles.profileName}>{activeRole === 'Vendor' ? vendorProfile.name : profile.name}</Text>
          <Text style={styles.profileMeta}>{session?.email || profile.email || 'Local preview account'}</Text>
          <Text style={styles.rolePill}>{activeRole} account</Text>
        </View>
      </View>

      {activeRole === 'Customer' && (
        <>
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Personal details</Text>
            {field('Full name', profile.name, (value) => updateProfile('name', value))}
            {field('Phone number', profile.phone, (value) => updateProfile('phone', value), 'Add your phone', 'phone-pad')}
            {field('Email address', profile.email, (value) => updateProfile('email', value), 'name@example.com', 'email-address')}
            {field('Neighborhood', profile.area, (value) => updateProfile('area', value))}
            {actionButton('Save personal details', () => Alert.alert('Profile saved', 'Your details are saved on this device.'))}
          </View>
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Saved pickup locations</Text>
            {addresses.map((address) => (
              <View key={address.id} style={styles.addressRow}>
                <View style={styles.addressCopy}><Text style={styles.addressLabel}>{address.label}</Text><Text style={styles.addressValue}>{address.value}</Text></View>
                <TouchableOpacity onPress={() => removeAddress(address.id)} accessibilityLabel="Remove pickup location"><Text style={styles.removeText}>Remove</Text></TouchableOpacity>
              </View>
            ))}
            {field('Add pickup location', newAddress, setNewAddress, 'Street, landmark, neighborhood')}
            {actionButton('Add location', saveAddress, true)}
          </View>
        </>
      )}

      {activeRole === 'Vendor' && (
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Business and market profile</Text>
          {field('Business / stall name', vendorProfile.name, (value) => updateVendorProfile('name', value))}
          {field('Contact phone', vendorProfile.phone, (value) => updateVendorProfile('phone', value), 'Add a phone number', 'phone-pad')}
          {field('Produce specialty', vendorProfile.specialty, (value) => updateVendorProfile('specialty', value))}
          {field('Daily market name', vendorProfile.marketName, (value) => updateVendorProfile('marketName', value))}
          {field('Area / neighborhood', vendorProfile.area, (value) => updateVendorProfile('area', value))}
          {field('Market address', vendorProfile.address, (value) => updateVendorProfile('address', value))}
          {field('Trading days', vendorProfile.days, (value) => updateVendorProfile('days', value), 'Daily or Mon-Sat')}
          <View style={styles.inventoryEditRow}>
            <View style={styles.compactField}>{field('Opens', vendorProfile.openTime, (value) => updateVendorProfile('openTime', value), 'e.g. 3:00 PM')}</View>
            <View style={styles.compactField}>{field('Closes', vendorProfile.closeTime, (value) => updateVendorProfile('closeTime', value), 'e.g. 9:00 PM')}</View>
          </View>
          {actionButton('Save business profile', saveVendorProfile)}
        </View>
      )}

      {activeRole === 'Vendor' && (
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Register another stall</Text>
          {field('Business / stall name', registration.name, (value) => updateRegistration('name', value))}
          {field('Contact phone', registration.phone, (value) => updateRegistration('phone', value), 'Phone number', 'phone-pad')}
          {field('Produce specialty', registration.specialty, (value) => updateRegistration('specialty', value))}
          {field('Daily market name', registration.marketName, (value) => updateRegistration('marketName', value))}
          {field('Area / neighborhood', registration.area, (value) => updateRegistration('area', value))}
          {field('Market address or stall location', registration.address, (value) => updateRegistration('address', value))}
          {field('Trading days', registration.days, (value) => updateRegistration('days', value), 'Daily or Mon-Sat')}
          <View style={styles.inventoryEditRow}>
            <View style={styles.compactField}>{field('Opens', registration.openTime, (value) => updateRegistration('openTime', value), 'e.g. 3:00 PM')}</View>
            <View style={styles.compactField}>{field('Closes', registration.closeTime, (value) => updateRegistration('closeTime', value), 'e.g. 9:00 PM')}</View>
          </View>
          {actionButton('Submit stall for review', submitVendorRegistration)}
        </View>
      )}

      {activeRole === 'Admin' && (
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Administrator account</Text>
          {field('Full name', profile.name, (value) => updateProfile('name', value))}
          {field('Email address', profile.email, (value) => updateProfile('email', value), 'name@example.com', 'email-address')}
          {field('Phone number', profile.phone, (value) => updateProfile('phone', value), 'Add a phone number', 'phone-pad')}
          {actionButton('Save account details', () => Alert.alert('Profile saved', 'Your details are saved on this device.'))}
        </View>
      )}

      <View style={styles.settingsSection}>
        <Text style={styles.formTitle}>Preferences and support</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}><Text style={styles.addressLabel}>Order updates</Text><Text style={styles.profileMeta}>Pickup and reservation status</Text></View>
          <Switch value={orderUpdatesEnabled} onValueChange={setOrderUpdatesEnabled} trackColor={{ true: '#17823B' }} />
        </View>
        <TouchableOpacity style={styles.supportLink} onPress={() => Alert.alert('LocalVeg support', 'For this preview, support contact and account recovery are not connected.') }><Text style={styles.addressLabel}>Help and support</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
        <TouchableOpacity style={styles.supportLink} onPress={() => Alert.alert('Privacy and terms', 'Production privacy and terms pages will be provided when the account service is connected.') }><Text style={styles.addressLabel}>Privacy and terms</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>
      </View>
      <Text style={styles.localNotice}>Preview account: information is stored only on this device. Secure login, recovery, and shared accounts require a backend.</Text>
      {actionButton('Sign out', signOut, true)}
    </ScrollView>
  );

  const renderVendorDashboard = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>{vendorProfile.name} dashboard</Text>
      {vendorView === 'Overview' && (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{liveVendorOrders.length}</Text><Text style={styles.metricLabel}>Orders</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{liveVendorOrders.filter((order) => order.status.toLowerCase().includes('pending')).length}</Text><Text style={styles.metricLabel}>Needs action</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{liveInventory.length}</Text><Text style={styles.metricLabel}>Products listed</Text></View>
          </View>
          <Text style={styles.sectionTitle}>Next market session</Text>
          <View style={styles.marketDetailCard}>
            <Text style={styles.vendorName}>{vendorProfile.marketName}</Text>
            <Text style={styles.detailLine}>{vendorProfile.area} · {vendorProfile.days}</Text>
            <Text style={styles.detailLine}>{vendorProfile.openTime} - {vendorProfile.closeTime}</Text>
            <Text style={styles.detailLine}>{vendorProfile.address}</Text>
          </View>
        </>
      )}

      {vendorView === 'Inventory' && (
        <>
          <Text style={styles.sectionTitle}>Your inventory</Text>
          {liveInventory.map((item) => (
            <View key={item.id} style={styles.inventoryCard}>
              <View style={styles.inventoryHeaderRow}>
                <Text style={styles.inventoryName}>{item.name}</Text>
                <Text style={styles.inventoryStatus}>{item.stock > 0 ? 'Available' : 'Out of stock'}</Text>
              </View>
              <View style={styles.inventoryEditRow}>
                <View style={styles.compactField}><Text style={styles.fieldLabel}>Price / {item.unit}</Text><TextInput value={String(item.price)} keyboardType="decimal-pad" onChangeText={(value) => updateInventoryItem(item.id, { price: Number(value) || 0 })} style={styles.textInput} /></View>
                <View style={styles.compactField}><Text style={styles.fieldLabel}>Stock</Text><TextInput value={String(item.stock)} keyboardType="decimal-pad" onChangeText={(value) => updateInventoryItem(item.id, { stock: Number(value) || 0 })} style={styles.textInput} /></View>
                <TouchableOpacity style={styles.freshnessButton} onPress={() => updateInventoryItem(item.id, { fresh: !item.fresh })}><Text style={styles.tickBtnText}>{item.fresh ? 'Fresh today' : 'Mark fresh'}</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Add a product</Text>
            {field('Product name', newItem.name, (value) => setNewItem((current) => ({ ...current, name: value })))}
            <View style={styles.inventoryEditRow}>
              <View style={styles.compactField}>{field('Price (₹)', newItem.price, (value) => setNewItem((current) => ({ ...current, price: value })), '0.00', 'decimal-pad')}</View>
              <View style={styles.compactField}>{field('Stock quantity', newItem.stock, (value) => setNewItem((current) => ({ ...current, stock: value })), '0', 'decimal-pad')}</View>
              <View style={styles.compactField}>{field('Unit', newItem.unit, (value) => setNewItem((current) => ({ ...current, unit: value })), 'kg / bunch')}</View>
            </View>
            {actionButton('Add to catalog', addInventoryItem)}
          </View>
        </>
      )}

      {vendorView === 'Orders' && (
        <>
          <Text style={styles.sectionTitle}>Incoming orders</Text>
          {liveVendorOrders.filter((order) => order.vendorId
            ? order.vendorId === managedVendorId
            : managedVendorId === 'vendor-1' && (!order.vendor || order.vendor === vendorProfile.name)).map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderRow}><Text style={styles.orderId}>{order.id}</Text><Text style={styles.orderStatus}>{order.status}</Text></View>
              <Text style={styles.orderVendor}>{order.customer}</Text>
              <Text style={styles.orderItems}>{order.items}</Text>
              <Text style={styles.orderTotal}>₹{order.total}</Text>
              <View style={styles.orderActions}>
                {['Accepted', 'Ready for pickup', 'Completed'].map((status) => actionButton(status, () => updateVendorOrder(order.id, status), status !== 'Accepted'))}
              </View>
            </View>
          ))}
        </>
      )}

    </ScrollView>
  );

  const renderAdminDashboard = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {adminView === 'Overview' && (
        <>
          <Text style={styles.sectionTitle}>Platform overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{liveMarkets.length}</Text><Text style={styles.metricLabel}>Markets</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{liveVendors.length}</Text><Text style={styles.metricLabel}>Vendors</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{new Set(liveCustomerOrders.map((order) => order.customer).filter(Boolean)).size || 1}</Text><Text style={styles.metricLabel}>Customers</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{liveCustomerOrders.length}</Text><Text style={styles.metricLabel}>Reservations</Text></View>
          </View>
          <Text style={styles.sectionTitle}>Review queue</Text>
          {liveApprovals.filter((vendor) => vendor.status === 'Pending' || vendor.status === 'Review').map((vendor) => (
            <View key={vendor.id} style={styles.approvalCard}>
              <Text style={styles.approvalName}>{vendor.name}</Text>
              <View style={styles.approvalRow}>
                <Text style={styles.approvalStatus}>{vendor.status}</Text>
                <View style={styles.approvalActions}>
                  <TouchableOpacity onPress={() => reviewVendor(vendor.id, true)} style={styles.tickBtn}><Text style={styles.tickBtnText}>Approve</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => reviewVendor(vendor.id, false)} style={styles.rejectBtn}><Text style={styles.rejectBtnText}>Reject</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      {adminView === 'Vendors' && (
        <>
          <Text style={styles.sectionTitle}>Vendor applications</Text>
          {liveApprovals.map((vendor) => (
            <View key={vendor.id} style={styles.approvalCard}>
              <Text style={styles.approvalName}>{vendor.name}</Text>
              <View style={styles.approvalRow}>
                <Text style={styles.approvalStatus}>{vendor.status}</Text>
                {(vendor.status === 'Pending' || vendor.status === 'Review') && (
                  <View style={styles.approvalActions}>
                    <TouchableOpacity onPress={() => reviewVendor(vendor.id, true)} style={styles.tickBtn}><Text style={styles.tickBtnText}>Approve</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => reviewVendor(vendor.id, false)} style={styles.rejectBtn}><Text style={styles.rejectBtnText}>Reject</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </>
      )}

      {adminView === 'Markets' && (
        <>
          <Text style={styles.sectionTitle}>Registered markets</Text>
          {liveMarkets.map((market) => (
            <View key={market.id} style={styles.marketHealthCard}>
              <Text style={styles.marketHealthName}>{market.name}</Text>
              <Text style={styles.marketMeta}>{market.area} · {market.days}</Text>
              <Text style={styles.marketMeta}>{market.address}</Text>
              <View style={styles.marketHealthRow}><Text>{market.openTime} - {market.closeTime}</Text><Text>{market.status}</Text></View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderCustomerBody = () => {
    switch (customerView) {
      case 'Market':
        return renderCustomerMarket();
      case 'Cart':
        return renderCustomerCart();
      case 'Orders':
        return renderCustomerOrders();
      case 'Profile':
        return renderProfileScreen();
      default:
        return renderCustomerHome();
    }
  };

  const renderAuthScreen = () => (
    <SafeAreaView style={styles.authSafeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authBrandRow}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>L</Text></View>
          <Text style={styles.authBrand}>LocalVeg</Text>
        </View>
        <Text style={styles.authEyebrow}>YOUR NEIGHBORHOOD MARKET</Text>
        <Text style={styles.authTitle}>{authMode === 'Create account' ? 'Join your local market.' : 'Fresh from your market.'}</Text>
        <Text style={styles.authSubtitle}>Sign in to shop local produce, manage your stall, or administer market listings.</Text>

        <Text style={styles.fieldLabel}>Continue as</Text>
        <View style={styles.authRoleRow}>
          {(authMode === 'Create account' ? ['Customer', 'Vendor'] : ['Customer', 'Vendor', 'Admin']).map((role) => (
            <TouchableOpacity key={role} onPress={() => setAuthRole(role)} style={[styles.authRoleButton, authRole === role && styles.authRoleButtonActive]}>
              <Text style={[styles.authRoleText, authRole === role && styles.authRoleTextActive]}>{role}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.authForm}>
          <Text style={styles.authFormTitle}>{authMode}</Text>
          {authMode === 'Create account' && field('Your name', authForm.name, (value) => updateAuthForm('name', value), 'First and last name')}
          {field('Email address', authForm.email, (value) => updateAuthForm('email', value), 'you@example.com', 'email-address')}
          {authMode === 'Create account' && field('Phone number', authForm.phone, (value) => updateAuthForm('phone', value), 'Optional', 'phone-pad')}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput value={authForm.password} onChangeText={(value) => updateAuthForm('password', value)} placeholder="At least 6 characters" secureTextEntry style={styles.passwordInput} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setPasswordVisible((visible) => !visible)} accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}><Text style={styles.passwordToggle}>{passwordVisible ? 'Hide' : 'Show'}</Text></TouchableOpacity>
            </View>
          </View>
          {authMode === 'Sign in' && <TouchableOpacity onPress={() => Alert.alert('Account recovery', 'Email recovery is not connected in this local preview.')} style={styles.forgotLink}><Text style={styles.forgotText}>Forgot password?</Text></TouchableOpacity>}
          {actionButton(authMode === 'Create account' ? 'Create account' : 'Sign in', signIn)}
          <TouchableOpacity onPress={() => {
            setAuthMode((mode) => {
              const nextMode = mode === 'Sign in' ? 'Create account' : 'Sign in';
              if (nextMode === 'Create account' && authRole === 'Admin') setAuthRole('Customer');
              return nextMode;
            });
          }} style={styles.authSwitch}>
            <Text style={styles.authSwitchText}>{authMode === 'Sign in' ? 'New to LocalVeg? ' : 'Already have an account? '}<Text style={styles.authSwitchAction}>{authMode === 'Sign in' ? 'Create account' : 'Sign in'}</Text></Text>
          </TouchableOpacity>
        </View>
        <View style={styles.previewNote}><Text style={styles.previewNoteTitle}>Local preview access</Text><Text style={styles.previewNoteText}>Accounts are stored only on this device. Role selection is for preview and is not secure authentication.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );

  if (!dataReady) {
    return (
      <SafeAreaView style={styles.authSafeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingState}><Text style={styles.appName}>LocalVeg</Text><Text style={styles.profileMeta}>Preparing your market</Text></View>
      </SafeAreaView>
    );
  }

  if (!session) return renderAuthScreen();

  const activeNavigationLabel = activeRole === 'Customer' ? customerView : activeRole === 'Vendor' ? vendorView : adminView;
  const roleScreen = activeRole === 'Customer'
    ? renderCustomerBody()
    : activeRole === 'Vendor'
      ? vendorView === 'Profile' ? renderProfileScreen() : renderVendorDashboard()
      : adminView === 'Profile' ? renderProfileScreen() : renderAdminDashboard();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View><Text style={styles.appName}>LocalVeg</Text><Text style={styles.headerText}>{activeRole} · {session.name}</Text></View>
          <TouchableOpacity onPress={() => selectNavigation('Profile')} style={styles.headerAvatar} accessibilityLabel="Open profile"><Text style={styles.headerAvatarText}>{(session.name || 'U').slice(0, 1).toUpperCase()}</Text></TouchableOpacity>
        </View>
        <View style={styles.screenContent}>{roleScreen}</View>
        <View style={styles.bottomNavigation}>
          {navigationByRole[activeRole].map((item) => {
            const selected = activeNavigationLabel === item.label || (item.label === 'Overview' && activeNavigationLabel === 'Overview');
            return (
              <TouchableOpacity key={item.label} onPress={() => selectNavigation(item.label)} style={styles.bottomTab} accessibilityRole="button" accessibilityState={{ selected }}>
                <View style={[styles.bottomTabIconWrap, selected && styles.bottomTabIconWrapActive]}>
                  <Text style={[styles.bottomTabIcon, selected && styles.bottomTabIconActive]}>{item.icon}</Text>
                  {item.label === 'Cart' && cartItems.length > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartItems.length}</Text></View>}
                </View>
                <Text style={[styles.bottomTabLabel, selected && styles.bottomTabLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  authSafeArea: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  authScroll: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 36,
  },
  authBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#17823B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#FFF',
    fontSize: 23,
    fontWeight: '900',
  },
  authBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2A37',
  },
  authEyebrow: {
    color: '#17823B',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },
  authTitle: {
    color: '#1F2A37',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    maxWidth: 420,
  },
  authSubtitle: {
    color: '#657468',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 26,
  },
  authRoleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 18,
  },
  authRoleButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CDD8CE',
    backgroundColor: '#FFF',
  },
  authRoleButtonActive: {
    backgroundColor: '#17823B',
    borderColor: '#17823B',
  },
  authRoleText: {
    color: '#405247',
    fontWeight: '700',
  },
  authRoleTextActive: {
    color: '#FFF',
  },
  authForm: {
    backgroundColor: '#FFF',
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0E8E1',
    borderRadius: 12,
  },
  authFormTitle: {
    color: '#1F2A37',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDD8CE',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    minHeight: 42,
    color: '#1F2A37',
  },
  passwordToggle: {
    color: '#17823B',
    fontWeight: '700',
    padding: 8,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: 5,
  },
  forgotText: {
    color: '#17823B',
    fontSize: 13,
    fontWeight: '700',
  },
  authSwitch: {
    alignItems: 'center',
    paddingTop: 14,
  },
  authSwitchText: {
    color: '#657468',
    fontSize: 13,
  },
  authSwitchAction: {
    color: '#17823B',
    fontWeight: '800',
  },
  previewNote: {
    marginTop: 18,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#D79036',
    backgroundColor: '#FFF8ED',
  },
  previewNoteTitle: {
    color: '#72511D',
    fontWeight: '800',
    marginBottom: 3,
  },
  previewNoteText: {
    color: '#725F3F',
    fontSize: 12,
    lineHeight: 18,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 64,
    paddingTop: 5,
    paddingBottom: 9,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2A37',
  },
  headerText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F0E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#17823B',
    fontWeight: '800',
    fontSize: 16,
  },
  screenContent: {
    flex: 1,
    minHeight: 0,
  },
  bottomNavigation: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E8E1',
    marginHorizontal: -16,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 3,
  },
  bottomTab: {
    minWidth: 58,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bottomTabIconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  bottomTabIconWrapActive: {
    backgroundColor: '#EAF7EE',
  },
  bottomTabIcon: {
    color: '#647367',
    fontSize: 20,
    lineHeight: 24,
  },
  bottomTabIconActive: {
    color: '#17823B',
  },
  bottomTabLabel: {
    color: '#647367',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomTabLabelActive: {
    color: '#17823B',
    fontWeight: '800',
  },
  cartBadge: {
    position: 'absolute',
    right: -3,
    top: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C45139',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DCEEDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#17823B',
    fontWeight: '900',
    fontSize: 24,
  },
  profileIdentity: {
    flex: 1,
  },
  profileName: {
    color: '#1F2A37',
    fontWeight: '800',
    fontSize: 20,
  },
  profileMeta: {
    color: '#657468',
    fontSize: 12,
    marginTop: 2,
  },
  rolePill: {
    alignSelf: 'flex-start',
    color: '#17823B',
    backgroundColor: '#EAF7EE',
    fontSize: 11,
    fontWeight: '800',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  settingsSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  settingRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1EE',
    marginBottom: 2,
  },
  settingCopy: {
    flex: 1,
  },
  supportLink: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1EE',
  },
  chevron: {
    color: '#859187',
    fontSize: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1EE',
  },
  addressCopy: {
    flex: 1,
  },
  addressLabel: {
    color: '#1F2A37',
    fontWeight: '700',
  },
  addressValue: {
    color: '#657468',
    fontSize: 13,
    marginTop: 3,
  },
  removeText: {
    color: '#9F3030',
    fontSize: 12,
    fontWeight: '700',
  },
  roleSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#D9F1DD',
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleButtonActive: {
    backgroundColor: '#17823B',
  },
  roleButtonText: {
    color: '#1F2A37',
    fontWeight: '700',
  },
  roleButtonTextActive: {
    color: '#FFF',
  },
  customerSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EAEFEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  customerTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  customerTabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  customerTabText: {
    color: '#5B6577',
    fontWeight: '600',
  },
  customerTabTextActive: {
    color: '#17823B',
  },
  vendorNav: {
    flexGrow: 0,
    marginBottom: 8,
  },
  vendorTab: {
    borderWidth: 1,
    borderColor: '#D9E2DA',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  vendorTabActive: {
    borderColor: '#17823B',
    backgroundColor: '#17823B',
  },
  vendorTabText: {
    color: '#405247',
    fontWeight: '700',
  },
  vendorTabTextActive: {
    color: '#FFF',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroCard: {
    backgroundColor: '#17823B',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroBadge: {
    color: '#F7FFF8',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeAlt: {
    color: '#F7FFF8',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#E7F7EA',
    marginBottom: 16,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    color: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2A37',
    marginBottom: 10,
    marginTop: 8,
  },
  hList: {
    marginBottom: 10,
  },
  marketCard: {
    width: 180,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  marketCardActive: {
    borderColor: '#17823B',
    backgroundColor: '#F0FAF3',
  },
  marketName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 6,
  },
  marketMeta: {
    color: '#5F6D7A',
    marginBottom: 4,
  },
  vendorCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6ECF0',
    marginBottom: 12,
  },
  vendorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2A37',
  },
  vendorSubText: {
    color: '#5F6D7A',
    marginTop: 3,
  },
  ratingBox: {
    backgroundColor: '#FFF5E6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  ratingText: {
    color: '#B26A00',
    fontWeight: '700',
  },
  productList: {
    gap: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  productName: {
    fontWeight: '700',
    color: '#1F2A37',
  },
  productStock: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceText: {
    fontWeight: '700',
    color: '#17823B',
  },
  addBtn: {
    backgroundColor: '#17823B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  marketDetailCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  detailLine: {
    color: '#1F2A37',
    fontWeight: '600',
    marginBottom: 6,
  },
  catalogCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catalogName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2A37',
  },
  catalogVendor: {
    color: '#5F6D7A',
    marginTop: 2,
  },
  catalogPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17823B',
  },
  catalogBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stockText: {
    color: '#3B4A5A',
    fontWeight: '600',
  },
  lowStockText: {
    color: '#D97706',
  },
  freshTag: {
    backgroundColor: '#EAF7EE',
    color: '#17823B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    fontWeight: '700',
  },
  reserveBtn: {
    backgroundColor: '#17823B',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveBtnText: {
    color: '#FFF',
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#4B5563',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2A37',
  },
  cartItemVendor: {
    color: '#5F6D7A',
    marginTop: 3,
  },
  cartMetaWrap: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF7EE',
    borderRadius: 8,
  },
  quantityButtonText: {
    color: '#17823B',
    fontSize: 20,
    fontWeight: '800',
  },
  cartQty: {
    color: '#5F6D7A',
  },
  cartTotal: {
    fontWeight: '800',
    color: '#17823B',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    color: '#1F2A37',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    color: '#475569',
  },
  summaryRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    fontWeight: '800',
  },
  checkoutBtn: {
    backgroundColor: '#17823B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  checkoutText: {
    color: '#FFF',
    fontWeight: '800',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontWeight: '800',
    color: '#1F2A37',
  },
  orderStatus: {
    fontWeight: '700',
    color: '#17823B',
  },
  orderVendor: {
    marginTop: 6,
    color: '#374151',
    fontWeight: '700',
  },
  orderItems: {
    marginTop: 5,
    color: '#4B5563',
  },
  orderTime: {
    color: '#6B7280',
    marginTop: 6,
  },
  orderTotal: {
    color: '#1F2A37',
    fontWeight: '800',
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#17823B',
  },
  metricLabel: {
    marginTop: 5,
    color: '#5F6D7A',
  },
  inventoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  inventoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inventoryName: {
    fontSize: 17,
    fontWeight: '800',
  },
  inventoryStatus: {
    color: '#17823B',
    fontWeight: '700',
  },
  inventoryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    color: '#475569',
  },
  tickBtn: {
    backgroundColor: '#17823B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tickBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  formSection: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2A37',
    marginBottom: 14,
  },
  formField: {
    marginBottom: 12,
    flexGrow: 1,
  },
  fieldLabel: {
    color: '#405247',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 5,
  },
  textInput: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#CDD8CE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#1F2A37',
    backgroundColor: '#FFF',
  },
  inventoryEditRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  compactField: {
    flex: 1,
    minWidth: 88,
  },
  actionButton: {
    minHeight: 42,
    backgroundColor: '#17823B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginRight: 6,
  },
  actionButtonSecondary: {
    backgroundColor: '#EEF5EF',
    borderWidth: 1,
    borderColor: '#CADACC',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  actionButtonTextSecondary: {
    color: '#31543A',
  },
  orderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  freshnessButton: {
    backgroundColor: '#17823B',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    marginBottom: 12,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    backgroundColor: '#9F3030',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rejectBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  localNotice: {
    color: '#657468',
    fontSize: 12,
    marginBottom: 10,
  },
  approvalCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  approvalName: {
    fontWeight: '800',
    color: '#1F2A37',
  },
  approvalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  approvalStatus: {
    color: '#B26A00',
    fontWeight: '700',
  },
  marketHealthCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6ECF0',
  },
  marketHealthName: {
    fontWeight: '800',
    color: '#1F2A37',
  },
  marketHealthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    color: '#475569',
  },
  bottomAlert: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 10,
    backgroundColor: '#EEFBEF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D6F0DA',
  },
  bottomAlertText: {
    color: '#17823B',
    fontWeight: '700',
  },
});
