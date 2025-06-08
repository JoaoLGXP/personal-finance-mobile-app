// src/context/FinancialContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinancialContext = createContext();

const initialState = {
  salary: '',
  expenses: [],
  categories: {
    'Moradia': { recommended: 30, color: '#3B82F6' },
    'Alimentação': { recommended: 15, color: '#10B981' },
    'Transporte': { recommended: 15, color: '#F59E0B' },
    'Saúde': { recommended: 10, color: '#EF4444' },
    'Educação': { recommended: 5, color: '#8B5CF6' },
    'Lazer': { recommended: 10, color: '#EC4899' },
    'Outros': { recommended: 15, color: '#6B7280' }
  }
};

function financialReducer(state, action) {
  switch (action.type) {
    case 'SET_SALARY':
      return { ...state, salary: action.payload };
    case 'ADD_EXPENSE':
      return { 
        ...state, 
        expenses: [...state.expenses, { ...action.payload, id: Date.now() }] 
      };
    case 'REMOVE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    case 'CLEAR_ALL':
      return { ...initialState };
    default:
      return state;
  }
}

export function FinancialProvider({ children }) {
  const [state, dispatch] = useReducer(financialReducer, initialState);

  // Carregar dados do AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  // Salvar dados no AsyncStorage sempre que o estado mudar
  useEffect(() => {
    saveData();
  }, [state.salary, state.expenses]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('financialData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const saveData = async () => {
    try {
      const dataToSave = {
        salary: state.salary,
        expenses: state.expenses
      };
      await AsyncStorage.setItem('financialData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const setSalary = (salary) => {
    dispatch({ type: 'SET_SALARY', payload: salary });
  };

  const addExpense = (expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  };

  const removeExpense = (id) => {
    dispatch({ type: 'REMOVE_EXPENSE', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
    AsyncStorage.removeItem('financialData');
  };

  const getFinancialAnalysis = () => {
    const salaryNum = parseFloat(state.salary) || 0;
    const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = salaryNum - totalExpenses;
    const savingsPercentage = salaryNum > 0 ? (remaining / salaryNum) * 100 : 0;

    const categoryAnalysis = Object.keys(state.categories).map(category => {
      const categoryExpenses = state.expenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      const percentage = salaryNum > 0 ? (categoryExpenses / salaryNum) * 100 : 0;
      const recommended = state.categories[category].recommended;
      const recommendedAmount = (salaryNum * recommended) / 100;
      
      return {
        category,
        amount: categoryExpenses,
        percentage: percentage,
        recommended,
        recommendedAmount,
        status: percentage > recommended ? 'above' : percentage < recommended * 0.5 ? 'below' : 'ok',
        color: state.categories[category].color
      };
    });

    return {
      salary: salaryNum,
      totalExpenses,
      remaining,
      savingsPercentage,
      categoryAnalysis
    };
  };

  const getSuggestions = () => {
    const analysis = getFinancialAnalysis();
    const suggestions = [];
    
    if (analysis.savingsPercentage < 20 && analysis.salary > 0) {
      suggestions.push({
        type: 'warning',
        title: 'Aumente sua reserva',
        message: `Você está economizando apenas ${analysis.savingsPercentage.toFixed(1)}%. O ideal é economizar pelo menos 20% da renda.`,
        icon: 'warning'
      });
    }

    analysis.categoryAnalysis.forEach(cat => {
      if (cat.status === 'above' && cat.amount > 0) {
        suggestions.push({
          type: 'alert',
          title: `Gastos elevados em ${cat.category}`,
          message: `Você está gastando ${cat.percentage.toFixed(1)}% em ${cat.category}. O recomendado é ${cat.recommended}%. Considere reduzir em R$ ${(cat.amount - cat.recommendedAmount).toFixed(2)}.`,
          icon: 'alert-circle'
        });
      }
    });

    if (analysis.remaining > 0 && analysis.savingsPercentage >= 20) {
      suggestions.push({
        type: 'investment',
        title: 'Oportunidade de Investimento',
        message: `Você tem R$ ${analysis.remaining.toFixed(2)} disponível. Considere investir em produtos financeiros adequados ao seu perfil.`,
        icon: 'trending-up'
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        title: 'Parabéns!',
        message: 'Suas finanças estão equilibradas! Continue mantendo esse controle.',
        icon: 'checkmark-circle'
      });
    }

    return suggestions;
  };

  const value = {
    ...state,
    setSalary,
    addExpense,
    removeExpense,
    clearAll,
    getFinancialAnalysis,
    getSuggestions
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial deve ser usado dentro de um FinancialProvider');
  }
  return context;
}