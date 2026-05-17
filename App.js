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
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Trash2, Edit3, X, DollarSign, Tag, FileText, Calendar, Banknote } from 'lucide-react-native';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [day, setDay] = useState('Monday');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

//CRUD Functions

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

return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
        <Plus color="#FFF" size={28} />
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
      <Text style={styles.totalAmount}>Php{total.toFixed(2)}</Text>
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
        <Text style={styles.itemAmount}>Php{parseFloat(item.amount).toFixed(2)}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
            <Edit3 size={18} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <Trash2 size={18} color="#EF4444" />
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
            <X color="#64748B" size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalForm}>
          <View style={styles.inputGroup}>
            <FileText size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput placeholder="What did you buy?" value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputGroup}>
            <Banknote size={18} color="#94A3B8" />
            <TextInput placeholder="   0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputGroup}>
            <Tag size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput placeholder="Category (e.g., Food, Utilities)" value={category} onChangeText={setCategory} style={styles.input} placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.daySelectorContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Calendar size={18} color="#64748B" style={{ marginRight: 8 }} />
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
