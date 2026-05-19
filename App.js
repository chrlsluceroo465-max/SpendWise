import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { auth, db } from './firebase'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query 
} from 'firebase/firestore';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [day, setDay] = useState('Monday');
  const [editingId, setEditingId] = useState(null);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe; 
  }, [initializing]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setExpenses([]);
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Error Logging Out", error.message);
    }
  };

  const loadData = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, 'users', auth.currentUser.uid, 'expenses'));
      const querySnapshot = await getDocs(q);
      const loadedExpenses = [];
      querySnapshot.forEach((document) => {
        loadedExpenses.push({ id: document.id, ...document.data() });
      });
      setExpenses(loadedExpenses);
    } catch (e) {
      Alert.alert("Error", "Failed to load data from server.");
    }
  };

  const handleSave = async () => {
    if (!title || !amount) return Alert.alert("Required Fields", "Please fill out Title and Amount.");
    if (!auth.currentUser) return;

    const expenseData = {
      title,
      amount: parseFloat(amount) || 0,
      category: category || 'General',
      day,
      updatedAt: Date.now()
    };

    try {
      if (editingId) {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'expenses', editingId);
        await updateDoc(docRef, expenseData);
      } else {
        const colRef = collection(db, 'users', auth.currentUser.uid, 'expenses');
        await addDoc(colRef, expenseData);
      }
      loadData();
      resetForm();
    } catch (error) {
      Alert.alert("Save Failed", error.message);
    }
  };

  const deleteItem = (id) => {

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm("Are you sure you want to remove this item?");
      if (confirmDelete) {
        executeDeletion(id);
      }
    } else {
      Alert.alert("Delete Expense", "Are you sure you want to remove this item?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => executeDeletion(id) }
      ]);
    }
  };

  const executeDeletion = async (id) => {
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'expenses', id);
      await deleteDoc(docRef);
      loadData(); 
    } catch (e) {
      Alert.alert("Error", "Could not delete database item.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(item.amount.toString());
    setCategory(item.category);
    setDay(item.day || 'Monday');
    setModalVisible(true);
  };
  
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('');
    setDay('Monday');
    setEditingId(null);
    setModalVisible(false);
  };

  const totalWeeklyExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const getExpensesByDay = (targetDay) => {
    return expenses
      .filter(item => item.day === targetDay)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  };

  const weeklyBreakdown = [
    { dayName: 'Monday', amount: getExpensesByDay('Monday') },
    { dayName: 'Tuesday', amount: getExpensesByDay('Tuesday') },
    { dayName: 'Wednesday', amount: getExpensesByDay('Wednesday') },
    { dayName: 'Thursday', amount: getExpensesByDay('Thursday') },
    { dayName: 'Friday', amount: getExpensesByDay('Friday') },
    { dayName: 'Saturday', amount: getExpensesByDay('Saturday') },
    { dayName: 'Sunday', amount: getExpensesByDay('Sunday') },
  ];

  if (initializing) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#64748B' }}>Loading SpendWise...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', paddingHorizontal: 24 }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0006a5', marginBottom: 32, textAlign: 'center' }}>SpendWise Ledger</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.emojiIcon}>✉️</Text>
          <TextInput placeholder="Email Address" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#94A3B8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.emojiIcon}>🔒</Text>
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry autoCapitalize="none" placeholderTextColor="#94A3B8" />
        </View>

        <TouchableOpacity style={[styles.saveBtn, { marginTop: 24 }]} onPress={handleLogin}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#64748B', marginTop: 12 }]} onPress={handleSignUp}>
          <Text style={styles.btnText}>Register New Account</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={{ paddingHorizontal: 16, paddingTop: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, color: '#64748B' }}>User: {user?.email}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ fontSize: 12, color: 'red', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <HeaderCard total={totalWeeklyExpenses} totalItems={expenses.length} />
      <WeeklyBreakdownDashboard breakdown={weeklyBreakdown} />

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses recorded yet.</Text>
            <Text style={styles.emptySubtext}>Tap the + button to track your first budget item.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ExpenseCard item={item} onEdit={() => startEdit(item)} onDelete={() => deleteItem(item.id)} />
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      <ExpenseModal
        visible={modalVisible}
        editingId={editingId}
        title={title}
        setTitle={setTitle}
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        day={day}
        setDay={setDay}
        onSave={handleSave}
        onClose={resetForm}
      />
    </SafeAreaView>
  );
}

function HeaderCard({ total, totalItems }) {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.totalLabel}>TOTAL Daily EXPENSES</Text>
      <Text style={styles.totalAmount}>Php{(total || 0).toFixed(2)}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{totalItems} {totalItems === 1 ? 'Transaction' : 'Transactions'}</Text>
      </View>
    </View>
  );
}

function WeeklyBreakdownDashboard({ breakdown }) {
  return (
    <View style={styles.dashboardContainer}>
      <Text style={styles.dashboardTitle}>Weekly Summary Breakdown</Text>
      <View style={styles.daysRow}>
        {breakdown.map((item) => (
          <View key={item.dayName} style={styles.dayColumn}>
            <Text style={styles.dayLabel}>{item.dayName.substring(0, 3)}</Text>
            <Text style={styles.dayAmount}>Php{item.amount.toFixed(0)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ExpenseCard({ item, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.categoryIconPlaceholder}>
          <Text style={styles.categoryLetter}>{item.category ? item.category.charAt(0).toUpperCase() : 'E'}</Text>
        </View>
  
        <View style={styles.cardDetails}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemCat}>{item.category} • <Text style={styles.boldDay}>{item.day || 'Monday'}</Text></Text>
        </View>
      </View>
      
      <View style={styles.cardRight}>
        <Text style={styles.itemAmount}>Php{(parseFloat(item.amount) || 0).toFixed(2)}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
            <Text style={{ fontSize: 14 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <Text style={{ fontSize: 14 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ExpenseModal({ visible, editingId, title, setTitle, amount, setAmount, category, setCategory, day, setDay, onSave, onClose }) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.modalView}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{editingId ? 'Modify Expense' : 'Add New Expense'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: '#64748B', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.emojiIcon}>📝</Text>
            <TextInput placeholder="What did you buy?" value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.emojiIcon}>₱</Text>
            <TextInput placeholder="   0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.emojiIcon}>🏷️</Text>
            <TextInput placeholder="Category (e.g., Food, Utilities)" value={category} onChangeText={setCategory} style={styles.input} placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.daySelectorContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ marginRight: 8, fontSize: 16 }}>📅</Text>
              <Text style={styles.selectorLabel}>Select Day of Week:</Text>
            </View>
            <View style={styles.daysChipsRow}>
              {daysOfWeek.map((d) => (
                <TouchableOpacity 
                  key={d} 
                  style={[styles.dayChip, day === d && styles.activeDayChip]} 
                  onPress={() => setDay(d)}
                >
                  <Text style={[styles.dayChipText, day === d && styles.activeDayChipText]}>{d.substring(0,3)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.8}>
            <Text style={styles.btnText}>{editingId ? 'Update Ledger' : 'Add to Ledger'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerCard: { 
    backgroundColor: '#0006a5', 
    padding: 21, 
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8, 
    borderRadius: 20, 
    alignItems: 'center',
  },
  totalLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 4 },
  totalAmount: { fontSize: 32, fontWeight: '800', color: '#F8FAFC' },
  badge: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  badgeText: { color: '#E2E8F0', fontSize: 11, fontWeight: '600' },
  dashboardContainer: { backgroundColor: '#FFF', padding: 16, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  dashboardTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 12 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayColumn: { alignItems: 'center', flex: 1 },
  dayLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginBottom: 4 },
  dayAmount: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  card: { 
    backgroundColor: '#FFF', 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'grey',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryIconPlaceholder: { width: 39, height: 30, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  categoryLetter: { fontSize: 15, fontWeight: '700', color: '#475569' },
  cardDetails: { flex: 1, paddingRight: 8 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  itemCat: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  boldDay: { color: '#4F46E5', fontWeight: '600' },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  itemAmount: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  emojiIcon: { fontSize: 16, marginRight: 10 },
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 30, 
    backgroundColor: '#4F46E5', 
    width: 56,
    height: 56,
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 6
  },
  modalView: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#F1F5F9', borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  modalForm: { padding: 24, gap: 18 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderColor: '#E2E8F0', paddingVertical: 6 },
  input: { flex: 1, fontSize: 16, color: '#0F172A', paddingVertical: 6 },
  daySelectorContainer: { marginTop: 6 },
  selectorLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
  daysChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1F5F9', minWidth: 45, alignItems: 'center' },
  activeDayChip: { backgroundColor: '#4F46E5' },
  dayChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  activeDayChipText: { color: '#FFF' },
  saveBtn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 14 },
  btnText: { color: 'white', fontWeight: '700', fontSize: 16 }
});