// src/screens/ExpensesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';

export default function ExpensesScreen() {
  const { expenses, categories, addExpense, removeExpense } = useFinancial();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: ''
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount) {
      Alert.alert('Erro', 'Por favor, preencha a categoria e o valor');
      return;
    }

    const amount = parseFloat(newExpense.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    addExpense({
      ...newExpense,
      amount: amount,
      date: new Date().toISOString()
    });

    setNewExpense({ category: '', amount: '', description: '' });
    setShowAddModal(false);
    Alert.alert('Sucesso', 'Gasto adicionado com sucesso!');
  };

  const handleDeleteExpense = (id, description) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir o gasto "${description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => removeExpense(id), style: 'destructive' }
      ]
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categories[item.category]?.color + '20' }]}>
            <Text style={[styles.categoryBadgeText, { color: categories[item.category]?.color }]}>
              {item.category}
            </Text>
          </View>
          <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
        </View>
        
        {item.description ? (
          <Text style={styles.expenseDescription}>{item.description}</Text>
        ) : null}
        
        <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteExpense(item.id, item.description || item.category)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const CategoryPicker = () => (
    <Modal
      visible={showCategoryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.categoryModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Categoria</Text>
            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.categoryList}>
            {Object.keys(categories).map(category => (
              <TouchableOpacity
                key={category}
                style={styles.categoryOption}
                onPress={() => {
                  setNewExpense({...newExpense, category});
                  setShowCategoryPicker(false);
                }}
              >
                <View style={[styles.categoryColor, { backgroundColor: categories[category].color }]} />
                <Text style={styles.categoryOptionText}>{category}</Text>
                <Text style={styles.categoryRecommended}>
                  {categories[category].recommended}% recomendado
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meus Gastos</Text>
          <Text style={styles.headerSubtitle}>
            Total: {formatCurrency(totalExpenses)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Nenhum gasto registrado</Text>
          <Text style={styles.emptyStateText}>
            Toque no botão + para adicionar seu primeiro gasto
          </Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.expensesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Gasto</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria *</Text>
              <TouchableOpacity
                style={styles.categoryInput}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={[
                  styles.categoryInputText,
                  { color: newExpense.category ? '#1F2937' : '#9CA3AF' }
                ]}>
                  {newExpense.category || 'Selecionar categoria'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor (R$) *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
                  placeholder="0,00"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição (opcional)</Text>
              <TextInput
                style={styles.descriptionInput}
                value={newExpense.description}
                onChangeText={(text) => setNewExpense({...newExpense, description: text})}
                placeholder="Ex: Supermercado, Combustível..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddExpense}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <CategoryPicker />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  expensesList: {
    padding: 16,
  },
  expenseItem: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  categoryInputText: {
    fontSize: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  categoryModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoryRecommended: {
    fontSize: 12,
    color: '#6B7280',
  },
});