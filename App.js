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
