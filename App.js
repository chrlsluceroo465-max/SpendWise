import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Trash2, Edit3 } from 'lucide-react-native';

export default function App() {
  const [expenses, setExpenses] = useState([]); // Global State [cite: 6]
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState(null);

  // 1. Initialization Phase 
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const storedData = await AsyncStorage.getItem('@expenses');
    if (storedData) setExpenses(JSON.parse(storedData)); // Populate state [cite: 6]
  };

  const saveData = async (newData) => {
    await AsyncStorage.setItem('@expenses', JSON.stringify(newData)); // Persist [cite: 8]
    setExpenses(newData);
  };

  // 2 & 4. Create and Update (C/U) [cite: 7, 11]
  const handleSave = () => {
    if (!title || !amount) return Alert.alert("Error", "Please fill fields");

    if (editingId) {
      // Update logic [cite: 12]
      const updated = expenses.map(item => 
        item.id === editingId ? { ...item, title, amount, category } : item
      );
      saveData(updated);
    } else {
      // Create logic [cite: 8]
      const newItem = { id: Date.now().toString(), title, amount, category };
      saveData([...expenses, newItem]);
    }
    resetForm();
  };

  // 5. Removal & Delete (D) [cite: 13, 14]
  const deleteItem = (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Yes", onPress: () => saveData(expenses.filter(item => item.id !== id)) }
    ]);
  };

  const resetForm = () => {
    setTitle(''); setAmount(''); setCategory('');
    setEditingId(null); setModalVisible(false);
  };

  // 3. Display & Read (R) - Calculate Total [cite: 9, 10]
  const total = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalLabel}>Total Spending</Text>
        <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
      </View>

      <FlatList 
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemCat}>{item.category}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.itemAmount}>${item.amount}</Text>
              <TouchableOpacity onPress={() => { 
                setEditingId(item.id); setTitle(item.title); 
                setAmount(item.amount); setCategory(item.category);
                setModalVisible(true);
              }}><Edit3 size={20} color="#666" /></TouchableOpacity>
              <TouchableOpacity onPress={() => deleteItem(item.id)}><Trash2 size={20} color="red" /></TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="white" size={30} />
      </TouchableOpacity>

      {/* Input Form Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.btnText}>Save</Text></TouchableOpacity>
          <TouchableOpacity onPress={resetForm}><Text>Cancel</Text></TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 60 },
  header: { padding: 20, backgroundColor: '#FFF', alignItems: 'center', marginBottom: 10 },
  totalLabel: { fontSize: 16, color: '#666' },
  totalAmount: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32' },
  card: { backgroundColor: '#FFF', padding: 15, marginHorizontal: 20, marginBottom: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 18, fontWeight: '600' },
  itemCat: { color: '#888', fontSize: 12 },
  itemAmount: { fontSize: 18, fontWeight: 'bold', marginRight: 15 },
  row: { flexDirection: 'row', gap: 15 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#000', padding: 15, borderRadius: 30 },
  modalContent: { flex: 1, justifyContent: 'center', padding: 40, gap: 15 },
  input: { borderBottomWidth: 1, borderColor: '#DDD', padding: 10, fontSize: 18 },
  saveBtn: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});