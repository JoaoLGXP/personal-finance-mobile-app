// src/screens/DashboardScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancial } from '../context/FinancialContext';

export default function DashboardScreen() {
  const { salary, setSalary, getFinancialAnalysis, clearAll } = useFinancial();
  const [tempSalary, setTempSalary] = useState(salary);
  const analysis = getFinancialAnalysis();

  const handleSalarySave = () => {
    setSalary(tempSalary);
    Alert.alert('Sucesso', 'Salário atualizado com sucesso!');
  };

  const handleClearAll = () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja limpar todos os dados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: clearAll, style: 'destructive' }
      ]
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'above': return '#EF4444';
      case 'below': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Ionicons name="wallet" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Gerenciador Financeiro</Text>
        </View>
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Salary Input */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Renda Mensal</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>R$</Text>
          <TextInput
            style={styles.salaryInput}
            value={tempSalary}
            onChangeText={setTempSalary}
            placeholder="Digite sua renda mensal"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSalarySave}>
          <Text style={styles.saveButtonText}>Salvar Renda</Text>
        </TouchableOpacity>
      </View>

      {/* Financial Summary */}
      {analysis.salary > 0 && (
        <>
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, styles.incomeCard]}>
              <Ionicons name="arrow-up" size={24} color="#10B981" />
              <Text style={styles.summaryLabel}>Renda</Text>
              <Text style={styles.summaryValue}>{formatCurrency(analysis.salary)}</Text>
            </View>
            
            <View style={[styles.summaryCard, styles.expenseCard]}>
              <Ionicons name="arrow-down" size={24} color="#EF4444" />
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={styles.summaryValue}>{formatCurrency(analysis.totalExpenses)}</Text>
            </View>
            
            <View style={[
              styles.summaryCard, 
              analysis.remaining >= 0 ? styles.balancePositive : styles.balanceNegative
            ]}>
              <Ionicons 
                name={analysis.remaining >= 0 ? "checkmark-circle" : "alert-circle"} 
                size={24} 
                color={analysis.remaining >= 0 ? "#3B82F6" : "#EF4444"} 
              />
              <Text style={styles.summaryLabel}>
                {analysis.remaining >= 0 ? 'Sobra' : 'Déficit'}
              </Text>
              <Text style={[
                styles.summaryValue,
                { color: analysis.remaining >= 0 ? '#3B82F6' : '#EF4444' }
              ]}>
                {formatCurrency(Math.abs(analysis.remaining))}
              </Text>
            </View>
          </View>

          {/* Savings Percentage */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Taxa de Poupança</Text>
            <View style={styles.savingsContainer}>
              <Text style={styles.savingsPercentage}>
                {analysis.savingsPercentage.toFixed(1)}%
              </Text>
              <Text style={styles.savingsLabel}>
                {analysis.savingsPercentage >= 20 ? 'Excelente!' : 
                 analysis.savingsPercentage >= 10 ? 'Bom, mas pode melhorar' : 
                 'Precisa melhorar'}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(analysis.savingsPercentage, 100)}%`,
                    backgroundColor: analysis.savingsPercentage >= 20 ? '#10B981' : 
                                   analysis.savingsPercentage >= 10 ? '#F59E0B' : '#EF4444'
                  }
                ]} 
              />
            </View>
          </View>

          {/* Category Analysis */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📈 Análise por Categoria</Text>
            {analysis.categoryAnalysis.map(category => (
              <View key={category.category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(category.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(category.status) }
                    ]}>
                      {category.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.categoryRecommended}>
                  Recomendado: {category.recommended}%
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(category.percentage, 100)}%`,
                        backgroundColor: category.color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(category.amount)} / {formatCurrency(category.recommendedAmount)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {analysis.salary === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Comece inserindo sua renda</Text>
          <Text style={styles.emptyStateText}>
            Digite sua renda mensal acima para começar a análise financeira
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerCard: {
    backgroundColor: '#3B82F6',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  salaryInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  savingsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  savingsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryRecommended: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  categoryAmount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
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
});