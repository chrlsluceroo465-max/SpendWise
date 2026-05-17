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
